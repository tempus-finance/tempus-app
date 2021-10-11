import { BigNumber, ethers } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

import getDefaultProvider from '../services/getDefaultProvider';
import getStatisticsService from '../services/getStatisticsService';
import getTempusPoolService from '../services/getTempusPoolService';
import StatisticsService from '../services/StatisticsService';
import TempusPoolService from '../services/TempusPoolService';

import ChartDataPoint from '../interfaces/ChartDataPoint';

import getConfig from '../utils/get-config';
import { div18f, mul18f } from '../utils/wei-math';

type TVLChartDataAdapterParameters = {
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
};

class TVLChartDataAdapter {
  private readonly AVERAGE_BLOCK_TIME_SECONDS = 13.33;
  private readonly SECONDS_IN_A_DAY = 86400;
  private readonly NUMBER_OF_PAST_DAYS = 29;

  private statisticsService: StatisticsService | null = null;
  private tempusPoolService: TempusPoolService | null = null;

  public init(params: TVLChartDataAdapterParameters): void {
    this.statisticsService = getStatisticsService(params.signerOrProvider);
    this.tempusPoolService = getTempusPoolService(params.signerOrProvider);
  }

  public async generateChartData(): Promise<ChartDataPoint[]> {
    if (!this.statisticsService || !this.tempusPoolService) {
      console.error(`Attempted to use TVLChartDataAdapter before initializing it.`);
      return Promise.reject([]);
    }

    let blocksToQuery: ethers.providers.Block[];
    try {
      blocksToQuery = await this.fetchDataPointBlocks();
    } catch (error) {
      console.error('TVLChartDataAdapter generateChartData() - Failed to fetch data point blocks.', error);
      return Promise.reject(error);
    }

    let tempusPoolsTvl: BigNumber[];
    try {
      const tvlFetchPromises: Promise<BigNumber>[] = [];
      blocksToQuery.forEach(block => {
        tvlFetchPromises.push(this.getTempusTotalTVL(block));
      });
      tempusPoolsTvl = await Promise.all(tvlFetchPromises);
    } catch (error) {
      console.error('TVLChartDataAdapter generateChartData() - Failed to fetch TVL for Tempus pools.', error);
      return Promise.reject(error);
    }

    const chartData = tempusPoolsTvl.map((result, index) => {
      const currentValue = result;
      const previousValue = index > 0 && tempusPoolsTvl[index - 1];

      let valueIncrease = BigNumber.from('0');
      if (previousValue && !previousValue.isZero()) {
        const valueDiff = currentValue.sub(previousValue);
        const valueRatio = div18f(valueDiff, previousValue);

        valueIncrease = mul18f(valueRatio, ethers.utils.parseEther('100'));
      }

      return {
        value: Number(ethers.utils.formatEther(result)),
        date: new Date(blocksToQuery[index].timestamp * 1000),
        valueIncrease: ethers.utils.formatEther(valueIncrease),
      };
    });

    return chartData;
  }

  private async fetchDataPointBlocks(): Promise<ethers.providers.Block[]> {
    const provider = getDefaultProvider();

    const blockInterval = Math.floor(this.SECONDS_IN_A_DAY / this.AVERAGE_BLOCK_TIME_SECONDS);

    let currentBlock: ethers.providers.Block;
    try {
      currentBlock = await provider.getBlock('latest');
    } catch (error) {
      console.error('TVLChartDataAdapter fetchDataPointBlocks() - Failed to fetch latest block data.');
      return Promise.reject(error);
    }

    let pastBlocks: ethers.providers.Block[];
    try {
      const blockFetchPromises = [];
      // Fetch Blocks for previous 29 days (1 block per day)
      for (let i = this.NUMBER_OF_PAST_DAYS; i > 0; i--) {
        const blockToQuery = currentBlock.number - (currentBlock.number % blockInterval) - i * blockInterval;
        blockFetchPromises.push(provider.getBlock(blockToQuery));
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
  private async getTempusTotalTVL(block: ethers.providers.Block): Promise<BigNumber> {
    let tempusPoolsTvl: BigNumber[];
    try {
      tempusPoolsTvl = (
        await Promise.all(
          getConfig().tempusPools.map(async (tempusPoolConfig): Promise<BigNumber> => {
            if (!this.statisticsService) {
              return BigNumber.from('0');
            }
            const poolStartTime = tempusPoolConfig.startDate;

            // Do not query block if tempus pool contract did not exist at that point in time.
            if (poolStartTime && poolStartTime / 1000 > block.timestamp) {
              return BigNumber.from('0');
            }

            const [tvlInBackingTokens, backingTokenRate] = await Promise.all([
              this.statisticsService.totalValueLockedInBackingTokens(tempusPoolConfig.address, {
                blockTag: block.number,
              }),
              this.statisticsService.getRate(tempusPoolConfig.backingToken, {
                blockTag: block.number,
              }),
            ]);
            return mul18f(tvlInBackingTokens, backingTokenRate);
          }),
        )
      ).flat();
    } catch (error) {
      console.error('TVLChartDataAdapter getTempusTotalTVL() - Failed to fetch TVL for tempus pools.');
      return Promise.reject(error);
    }

    let totalTVL = BigNumber.from('0');
    tempusPoolsTvl.forEach(tvl => {
      totalTVL = totalTVL.add(tvl);
    });

    return totalTVL;
  }
}
export default TVLChartDataAdapter;
