import { ethers } from 'ethers';
import { Block, JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import ChartDataPoint from '../interfaces/ChartDataPoint';
import getStatisticsService from '../services/getStatisticsService';
import getTempusPoolService from '../services/getTempusPoolService';
import StatisticsService from '../services/StatisticsService';
import TempusPoolService, { DepositedEvent, RedeemedEvent } from '../services/TempusPoolService';
import getConfig from '../utils/get-config';

type VolumeChartDataAdapterParameters = {
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
};

interface EventChartData {
  value: number;
  date: Date;
}

class VolumeChartDataAdapter {
  private readonly NUMBER_OF_PAST_DAYS = 30;
  private readonly MILLISECONDS_IN_A_DAY = 86400000;

  private eventBlockData: Block[] = [];
  private chartData: EventChartData[] = [];

  private tempusPoolService: TempusPoolService | null = null;
  private statisticsService: StatisticsService | null = null;

  public init(params: VolumeChartDataAdapterParameters): void {
    this.tempusPoolService = getTempusPoolService(params.signerOrProvider);
    this.statisticsService = getStatisticsService(params.signerOrProvider);
  }

  public async generateChartData(): Promise<ChartDataPoint[]> {
    const chartDataPoints: ChartDataPoint[] = [];

    try {
      await this.fetchData();
    } catch (error) {
      console.error('Failed to fetch data for volume chart.', error);
      return Promise.reject(error);
    }

    // Generate chart data for last NUMBER_OF_PAST_DAYS
    for (let i = this.NUMBER_OF_PAST_DAYS; i > 0; i--) {
      const currentTime = Date.now();

      const startDate = new Date(currentTime - this.MILLISECONDS_IN_A_DAY * i);
      const endDate = new Date(currentTime - this.MILLISECONDS_IN_A_DAY * (i - 1));

      chartDataPoints.push(this.getChartDataPoint(startDate, endDate, chartDataPoints[chartDataPoints.length - 1]));
    }

    return chartDataPoints;
  }

  private getChartDataPoint(dateFrom: Date, dateTo: Date, previous: ChartDataPoint): ChartDataPoint {
    let value = 0;
    this.chartData.forEach(data => {
      if (data.date > dateFrom && data.date < dateTo) {
        value += data.value;
      }
    });

    return {
      value: value,
      date: dateTo,
      valueIncrease: previous && previous.value ? ((value - previous.value) / previous.value) * 100 : 0,
    };
  }

  /**
   * Fetches all required data from contracts in order to build data structure for Volume chart
   */
  private async fetchData(): Promise<void> {
    const depositEventFetchPromises: Promise<DepositedEvent[]>[] = [];
    const redeemEventFetchPromises: Promise<RedeemedEvent[]>[] = [];

    getConfig().tempusPools.forEach(tempusPool => {
      if (this.tempusPoolService) {
        depositEventFetchPromises.push(this.tempusPoolService.getDepositedEvents(tempusPool.address));
        redeemEventFetchPromises.push(this.tempusPoolService.getRedeemedEvents(tempusPool.address));
      }
    });

    let depositEvents: DepositedEvent[];
    let redeemEvents: RedeemedEvent[];
    try {
      // TODO - Include swap events as well when they are added on the backend side.
      depositEvents = (await Promise.all(depositEventFetchPromises)).flat();
      redeemEvents = (await Promise.all(redeemEventFetchPromises)).flat();
    } catch (error) {
      console.error('Failed to fetch deposit and redeem events for volume chart', error);
      return Promise.reject(error);
    }

    try {
      await this.fetchEventBlocks([...depositEvents, ...redeemEvents]);
    } catch (error) {
      console.error('Failed to fetch block data for deposit and redeem events', error);
      return Promise.reject(error);
    }

    try {
      await this.fetchChartData([...depositEvents, ...redeemEvents]);
    } catch (error) {
      console.error('Failed to fetch chart data for deposit and redeem events', error);
      return Promise.reject(error);
    }
  }

  /**
   * Fetches chart data for all passed events.
   */
  private async fetchChartData(events: Array<DepositedEvent | RedeemedEvent>): Promise<void> {
    const fetchPromises: Promise<EventChartData>[] = [];

    events.forEach(event => {
      fetchPromises.push(this.getEventChartData(event));
    });

    try {
      this.chartData = await Promise.all(fetchPromises);
    } catch (error) {
      console.log('Failed to fetch events chart data', error);
      return Promise.reject(error);
    }
  }

  /**
   * Fetches block data for all provided events.
   */
  private async fetchEventBlocks(events: Array<DepositedEvent | RedeemedEvent>): Promise<void> {
    const fetchBlockPromises: Promise<Block>[] = [];

    events.forEach(event => {
      fetchBlockPromises.push(event.getBlock());
    });

    try {
      this.eventBlockData = await Promise.all(fetchBlockPromises);
    } catch (error) {
      console.error('Failed to fetch block data for events', error);
      return Promise.reject(error);
    }
  }

  /**
   * Returns block data for specified event - fetches data from local block cache.
   */
  private getEventBlock(event: DepositedEvent | RedeemedEvent): Block {
    const block = this.eventBlockData.find(block => {
      return block.number === event.blockNumber;
    });

    if (!block) {
      throw new Error('Failed to find block data for event!');
    }

    return block;
  }

  /**
   * Generates chart data for a single event that contains timestamp of the event and value of the event in terms of USD
   */
  private async getEventChartData(event: DepositedEvent | RedeemedEvent): Promise<EventChartData> {
    if (!this.tempusPoolService || !this.statisticsService) {
      console.error('Attempted to use VolumeChartDataAdapter before initalizing it!');
      return Promise.reject();
    }

    const eventBlock = this.getEventBlock(event);

    let eventPoolBackingToken: string;
    try {
      eventPoolBackingToken = await this.tempusPoolService.getBackingTokenTicker(event.address);
    } catch (error) {
      console.error('Failed to get tempus pool backing token ticker!', error);
      return Promise.reject(error);
    }

    let poolBackingTokenRate: number;
    try {
      poolBackingTokenRate = await this.statisticsService.getRate(eventPoolBackingToken, {
        blockTag: eventBlock.number,
      });
    } catch (error) {
      console.error('Failed to get tempus pool exchange rate to USD!');
      return Promise.reject(error);
    }

    return {
      date: new Date(this.getEventBlock(event).timestamp * 1000),
      value: poolBackingTokenRate * this.getEventValue(event),
    };
  }

  /**
   * Returns event value in terms of the event Tempus Pool backing token count.
   */
  private getEventValue(event: DepositedEvent | RedeemedEvent): number {
    const exchangeRate = Number(ethers.utils.formatEther(event.args.rate));

    if (this.isDepositEvent(event)) {
      return Number(ethers.utils.formatEther(event.args.yieldTokenAmount)) * exchangeRate;
    }
    if (this.isRedeemEvent(event)) {
      return Number(ethers.utils.formatEther(event.args.yieldBearingAmount)) * exchangeRate;
    } else {
      throw new Error('Failed to get event value.');
    }
  }

  /**
   * Type guard - Checks if provided event is of type DepositedEvent
   */
  private isDepositEvent(event: DepositedEvent | RedeemedEvent): event is DepositedEvent {
    return 'yieldTokenAmount' in event.args;
  }

  /**
   * Type guard - Checks if provided event is of type RedeemedEvent
   */
  private isRedeemEvent(event: DepositedEvent | RedeemedEvent): event is RedeemedEvent {
    return 'yieldBearingAmount' in event.args;
  }
}
export default VolumeChartDataAdapter;
