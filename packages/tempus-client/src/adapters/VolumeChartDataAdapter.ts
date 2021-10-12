import { BigNumber, ethers } from 'ethers';
import { Block, JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import ChartDataPoint from '../interfaces/ChartDataPoint';
import StatisticsService from '../services/StatisticsService';
import TempusPoolService from '../services/TempusPoolService';
import TempusControllerService, { DepositedEvent, RedeemedEvent } from '../services/TempusControllerService';
import VaultService, { SwapEvent } from '../services/VaultService';
import { getEventBackingTokenValue, getEventPoolAddress } from '../services/EventUtils';
import TempusAMMService from '../services/TempusAMMService';
import { div18f, mul18f } from '../utils/wei-math';
import { Ticker } from '../interfaces';

type VolumeChartDataAdapterParameters = {
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
  tempusPoolService: TempusPoolService;
  statisticsService: StatisticsService;
  tempusControllerService: TempusControllerService;
  vaultService: VaultService;
  tempusAMMService: TempusAMMService;
};

interface EventChartData {
  value: BigNumber;
  date: Date;
}

class VolumeChartDataAdapter {
  private readonly NUMBER_OF_PAST_DAYS = 30;
  private readonly MILLISECONDS_IN_A_DAY = 86400000;

  private eventBlockData: Block[] = [];
  private chartData: EventChartData[] = [];

  private tempusPoolService: TempusPoolService | null = null;
  private statisticsService: StatisticsService | null = null;
  private tempusControllerService: TempusControllerService | null = null;
  private vaultService: VaultService | null = null;
  private tempusAMMService: TempusAMMService | null = null;

  public init(params: VolumeChartDataAdapterParameters): void {
    this.tempusPoolService = params.tempusPoolService;
    this.statisticsService = params.statisticsService;
    this.tempusControllerService = params.tempusControllerService;
    this.vaultService = params.vaultService;
    this.tempusAMMService = params.tempusAMMService;
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
    const currentTime = Date.now();
    for (let i = this.NUMBER_OF_PAST_DAYS; i > 0; i--) {
      const startDate = new Date(currentTime - this.MILLISECONDS_IN_A_DAY * i);
      const endDate = new Date(currentTime - this.MILLISECONDS_IN_A_DAY * (i - 1));

      chartDataPoints.push(this.getChartDataPoint(startDate, endDate, chartDataPoints[chartDataPoints.length - 1]));
    }

    return chartDataPoints;
  }

  private getChartDataPoint(dateFrom: Date, dateTo: Date, previous: ChartDataPoint): ChartDataPoint {
    let value = BigNumber.from('0');
    this.chartData.forEach(data => {
      if (data.date > dateFrom && data.date < dateTo) {
        value = value.add(data.value);
      }
    });

    let valueIncrease = BigNumber.from('0');
    if (previous && previous.value && !ethers.utils.parseEther(previous.value.toString()).isZero()) {
      const valueDiff = value.sub(ethers.utils.parseEther(previous.value.toString()));
      const valueRatio = div18f(valueDiff, ethers.utils.parseEther(previous.value.toString()));

      valueIncrease = mul18f(valueRatio, ethers.utils.parseEther('100'));
    }

    return {
      value: Number(ethers.utils.formatEther(value)),
      date: dateTo,
      valueIncrease: ethers.utils.formatEther(valueIncrease),
    };
  }

  /**
   * Fetches all required data from contracts in order to build data structure for Volume chart
   */
  private async fetchData(): Promise<void> {
    if (!this.tempusControllerService || !this.vaultService) {
      console.error(
        'VolumeChartDataAdapter - fetchData() - Attempted to use VolumeChartDataAdapter before initalizing it!',
      );
      return Promise.reject();
    }

    let depositEvents: DepositedEvent[];
    let redeemEvents: RedeemedEvent[];
    let swapEvents: SwapEvent[];
    try {
      [depositEvents, redeemEvents, swapEvents] = await Promise.all([
        this.tempusControllerService.getDepositedEvents(),
        this.tempusControllerService.getRedeemedEvents(),
        this.vaultService.getSwapEvents(),
      ]);
    } catch (error) {
      console.error('Failed to fetch deposit and redeem events for volume chart', error);
      return Promise.reject(error);
    }

    try {
      await this.fetchEventBlocks([...depositEvents, ...redeemEvents, ...swapEvents]);
    } catch (error) {
      console.error('Failed to fetch block data for deposit and redeem events', error);
      return Promise.reject(error);
    }

    try {
      await this.fetchChartData([...depositEvents, ...redeemEvents, ...swapEvents]);
    } catch (error) {
      console.error('Failed to fetch chart data for deposit and redeem events', error);
      return Promise.reject(error);
    }
  }

  /**
   * Fetches chart data for all passed events.
   */
  private async fetchChartData(events: Array<DepositedEvent | RedeemedEvent | SwapEvent>): Promise<void> {
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
  private async fetchEventBlocks(events: Array<DepositedEvent | RedeemedEvent | SwapEvent>): Promise<void> {
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
  private getEventBlock(event: DepositedEvent | RedeemedEvent | SwapEvent): Block {
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
  private async getEventChartData(event: DepositedEvent | RedeemedEvent | SwapEvent): Promise<EventChartData> {
    if (!this.tempusPoolService || !this.statisticsService || !this.tempusAMMService) {
      console.error('Attempted to use VolumeChartDataAdapter before initializing it!');
      return Promise.reject();
    }

    let eventPoolBackingToken: Ticker;
    try {
      const eventPoolAddress = await getEventPoolAddress(event, this.tempusAMMService);
      eventPoolBackingToken = await this.tempusPoolService.getBackingTokenTicker(eventPoolAddress);
    } catch (error) {
      console.error('Failed to get tempus pool backing token ticker!', error);
      return Promise.reject(error);
    }

    let poolBackingTokenRate: BigNumber;
    try {
      poolBackingTokenRate = await this.statisticsService.getRate(eventPoolBackingToken, {
        blockTag: event.blockNumber,
      });
    } catch (error) {
      console.error('Failed to get tempus pool exchange rate to USD!');
      return Promise.reject(error);
    }

    let eventBackingTokenValue: BigNumber;
    try {
      eventBackingTokenValue = await getEventBackingTokenValue(event, this.tempusAMMService, this.tempusPoolService);
    } catch (error) {
      console.error(
        'VolumeChartDataAdapter - getEventChartData() - Failed to get event value in backing tokes!',
        error,
      );
      return Promise.reject(error);
    }

    return {
      date: new Date(this.getEventBlock(event).timestamp * 1000),
      value: mul18f(eventBackingTokenValue, poolBackingTokenRate),
    };
  }
}
export default VolumeChartDataAdapter;
