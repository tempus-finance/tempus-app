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

    await this.fetchData();

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

    // DODO - Include swap events as well when they are added on the backend side.
    const depositEvents = (await Promise.all(depositEventFetchPromises)).flat();
    const redeemEvents = (await Promise.all(redeemEventFetchPromises)).flat();

    await this.fetchEventBlocks([...depositEvents, ...redeemEvents]);
    await this.fetchChartData([...depositEvents, ...redeemEvents]);
  }

  /**
   * Fetches chart data for all passed events.
   */
  private async fetchChartData(events: Array<DepositedEvent | RedeemedEvent>) {
    const fetchPromises: Promise<EventChartData>[] = [];

    events.forEach(event => {
      fetchPromises.push(this.getEventChartData(event));
    });

    this.chartData = await Promise.all(fetchPromises);
  }

  /**
   * Fetches block data for all provided events.
   */
  private async fetchEventBlocks(events: Array<DepositedEvent | RedeemedEvent>) {
    const fetchBlockPromises: Promise<Block>[] = [];

    events.forEach(event => {
      fetchBlockPromises.push(event.getBlock());
    });

    this.eventBlockData = await Promise.all(fetchBlockPromises);
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

    const eventPoolBackingToken = await this.tempusPoolService.getBackingTokenTicker(event.address);
    const poolBackingTokenRate = await this.statisticsService.getRate(eventPoolBackingToken, {
      blockTag: eventBlock.number,
    });

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
