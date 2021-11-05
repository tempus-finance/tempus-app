import { BigNumber, ethers } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import getStatisticsService from '../services/getStatisticsService';
import StatisticsService from '../services/StatisticsService';
import ChartDataPoint from '../interfaces/ChartDataPoint';
import { div18f, mul18f } from '../utils/weiMath';
import TempusControllerService from '../services/TempusControllerService';
import getTempusControllerService from '../services/getTempusControllerService';
import { BLOCK_DURATION_SECONDS, SECONDS_IN_A_DAY } from '../constants';
import { PoolData } from '../context/poolDataContext';
import getERC20TokenService from '../services/getERC20TokenService';

type ProfitLossGraphDataAdapterParameters = {
  signer: JsonRpcSigner;
  eRC20TokenServiceGetter: typeof getERC20TokenService;
};

class ProfitLossGraphDataAdapter {
  private statisticsService: StatisticsService | null = null;
  private tempusControllerService: TempusControllerService | null = null;
  private eRC20TokenServiceGetter: null | typeof getERC20TokenService = null;

  private signer: JsonRpcSigner | null = null;

  public init(params: ProfitLossGraphDataAdapterParameters): void {
    this.statisticsService = getStatisticsService(params.signer);
    this.tempusControllerService = getTempusControllerService(params.signer);
    this.eRC20TokenServiceGetter = params.eRC20TokenServiceGetter;

    this.signer = params.signer;
  }

  public async generateChartData(poolData: PoolData, userWalletAddress: string): Promise<ChartDataPoint[]> {
    if (!this.statisticsService) {
      console.error(`Attempted to use ProfitLossGraphDataAdapter before initializing it.`);
      return Promise.reject();
    }

    const minBlockNumberForUser = await this.getFirstDepositBlockForUser(poolData.address, userWalletAddress);

    let blocksToQuery: ethers.providers.Block[];
    try {
      blocksToQuery = await this.fetchDataPointBlocks();
    } catch (error) {
      console.error('TVLChartDataAdapter generateChartData() - Failed to fetch data point blocks.', error);
      return Promise.reject(error);
    }

    let liquidationValues: BigNumber[];
    try {
      const liquidationValuesPromises: Promise<BigNumber>[] = [];
      blocksToQuery.forEach(block => {
        liquidationValuesPromises.push(
          this.getUserLiquidationValueForBlock(
            block,
            userWalletAddress,
            minBlockNumberForUser || poolData.startDate,
            poolData,
          ),
        );
      });
      liquidationValues = await Promise.all(liquidationValuesPromises);
    } catch (error) {
      console.error('TVLChartDataAdapter generateChartData() - Failed to fetch TVL for Tempus pools.', error);
      return Promise.reject(error);
    }

    const chartData = liquidationValues.map((result, index) => {
      const currentValue = result;
      const previousValue = index > 0 && liquidationValues[index - 1];

      let valueIncrease = BigNumber.from('0');
      if (previousValue && !previousValue.isZero()) {
        const valueDiff = currentValue.sub(previousValue);
        const valueRatio = div18f(valueDiff, previousValue);

        valueIncrease = valueRatio;
      }

      return {
        value: Number(ethers.utils.formatEther(result)),
        date: new Date(blocksToQuery[index].timestamp * 1000),
        valueIncrease: ethers.utils.formatEther(valueIncrease),
      };
    });

    return chartData;
  }

  private async getFirstDepositBlockForUser(poolAddress: string, userWalletAddress: string): Promise<number | null> {
    if (!this.tempusControllerService || !this.signer) {
      console.error(`Attempted to use ProfitLossGraphDataAdapter before initializing it.`);
      return Promise.reject();
    }

    const userDepositEvents = await this.tempusControllerService.getDepositedEvents({
      forPool: poolAddress,
      forUser: userWalletAddress,
    });

    if (userDepositEvents.length === 0) {
      return null;
    }

    let minBlockNumber = userDepositEvents[0].blockNumber;
    userDepositEvents.forEach(depositedEvent => {
      if (depositedEvent.blockNumber < minBlockNumber) {
        minBlockNumber = depositedEvent.blockNumber;
      }
    });

    const blockData = await this.signer.provider.getBlock(minBlockNumber);

    return blockData.timestamp * 1000;
  }

  private async fetchDataPointBlocks(): Promise<ethers.providers.Block[]> {
    if (!this.signer) {
      return Promise.reject();
    }

    const blockInterval = Math.floor(SECONDS_IN_A_DAY / BLOCK_DURATION_SECONDS);

    let currentBlock: ethers.providers.Block;
    try {
      currentBlock = await this.signer.provider.getBlock('latest');
    } catch (error) {
      console.error('TVLChartDataAdapter fetchDataPointBlocks() - Failed to fetch latest block data.');
      return Promise.reject(error);
    }

    let pastBlocks: ethers.providers.Block[];
    try {
      const blockFetchPromises = [];
      // Fetch Blocks for previous 29 days (1 block per day)
      for (let i = 29; i > 0; i -= 2) {
        const blockToQuery = currentBlock.number - (currentBlock.number % blockInterval) - i * blockInterval;
        blockFetchPromises.push(this.signer.provider.getBlock(blockToQuery));
      }
      pastBlocks = await Promise.all(blockFetchPromises);
    } catch (error) {
      console.error('TVLChartDataAdapter fetchDataPointBlocks() - Failed to fetch block block data for past days.');
      return Promise.reject(error);
    }

    return [...pastBlocks, currentBlock];
  }

  /**
   * Returns the sum of all Tempus Pools TVL at specified block number
   */
  private async getUserLiquidationValueForBlock(
    block: ethers.providers.Block,
    userWalletAddress: string,
    sinceDate: number,
    poolData: PoolData,
  ): Promise<BigNumber> {
    if (!this.statisticsService || !this.eRC20TokenServiceGetter) {
      return BigNumber.from('0');
    }

    // Do not query block if tempus pool contract did not exist at that point in time.
    if (sinceDate / 1000 > block.timestamp) {
      return BigNumber.from('0');
    }

    const lpTokenService = this.eRC20TokenServiceGetter(poolData.ammAddress);
    const principalsService = this.eRC20TokenServiceGetter(poolData.principalsAddress);
    const yieldsService = this.eRC20TokenServiceGetter(poolData.yieldsAddress);

    try {
      const [lpBalance, principalsBalance, yieldsBalance] = await Promise.all([
        lpTokenService.balanceOf(userWalletAddress, {
          blockTag: block.number,
        }),
        principalsService.balanceOf(userWalletAddress, {
          blockTag: block.number,
        }),
        yieldsService.balanceOf(userWalletAddress, {
          blockTag: block.number,
        }),
      ]);

      const [liquidationValueInBackingTokens, backingTokenRate] = await Promise.all([
        this.statisticsService.estimateExitAndRedeem(
          poolData.ammAddress,
          lpBalance,
          principalsBalance,
          yieldsBalance,
          true,
          {
            blockTag: block.number,
          },
        ),
        this.statisticsService.getRate(poolData.backingToken, {
          blockTag: block.number,
        }),
      ]);
      return mul18f(liquidationValueInBackingTokens, backingTokenRate);
    } catch (error) {
      console.error('TVLChartDataAdapter getTempusTotalTVL() - Failed to fetch TVL for tempus pools.');
      return Promise.reject(error);
    }
  }
}
export default ProfitLossGraphDataAdapter;
