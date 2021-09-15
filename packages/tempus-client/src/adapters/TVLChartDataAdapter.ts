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
        value: ethers.utils.formatEther(result),
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

  private async getTempusPoolStartTimes(): Promise<Map<string, Date>> {
    let startTimes: Date[];
    try {
      const fetchStartTimePromises: Promise<Date>[] = [];
      getConfig().tempusPools.forEach(tempusPoolConfig => {
        if (this.tempusPoolService) {
          const startTimePromise = this.tempusPoolService.getStartTime(tempusPoolConfig.address);
          fetchStartTimePromises.push(startTimePromise);
        }
      });
      startTimes = await Promise.all(fetchStartTimePromises);
    } catch (error) {
      console.error('TVLChartDataAdapter getTempusPoolStartTimes() - Failed to fetch Tempus pool start times');
      return Promise.reject(error);
    }

    const startTimesMap = new Map<string, Date>();
    startTimes.forEach((startTime, index) => {
      startTimesMap.set(getConfig().tempusPools[index].address, startTime);
    });

    return startTimesMap;
  }

  /**
   * Returns the sum of all Tempus Pools TVL at specified block number
   */
  private async getTempusTotalTVL(block: ethers.providers.Block): Promise<BigNumber> {
    const fetchTVLPromises: Promise<BigNumber>[] = [];

    let tempusPoolStartTimes: Map<string, Date>;
    try {
      tempusPoolStartTimes = await this.getTempusPoolStartTimes();
    } catch (error) {
      console.error('TVLChartDataAdapter getTempusTotalTVL() - Failed to fetch Tempus pool start times.');
      return Promise.reject(error);
    }

    let tempusPoolsTvl: BigNumber[];
    try {
      // TODO - Fetch pools from factory contract - waiting for backend team to finish factory contract for this.
      getConfig().tempusPools.forEach(tempusPoolConfig => {
        const poolStartTime = tempusPoolStartTimes.get(tempusPoolConfig.address);

        // Do not query block if tempus pool contract did not exist at that point in time.
        if (poolStartTime && poolStartTime.getTime() / 1000 > block.timestamp) {
          return;
        }

        const tvlPromise = this.statisticsService?.totalValueLockedUSD(
          tempusPoolConfig.address,
          tempusPoolConfig.backingToken,
          { blockTag: block.number },
        );
        if (tvlPromise) {
          fetchTVLPromises.push(tvlPromise);
        }
      });

      tempusPoolsTvl = await Promise.all(fetchTVLPromises);
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
