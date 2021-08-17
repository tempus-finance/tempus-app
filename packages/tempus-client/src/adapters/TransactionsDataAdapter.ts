import { ethers } from 'ethers';
import { DateTime } from 'luxon';
import { formatDistanceToNow } from 'date-fns';
import { getDefaultProvider, JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import getTempusPoolService from '../services/getTempusPoolService';
import TempusPoolService, { DepositedEvent, RedeemedEvent } from '../services/TempusPoolService';
import getStatisticsService from '../services/getStatisticsService';
import StatisticsService from '../services/StatisticsService';
import { Transaction, TransactionAction } from '../interfaces';
import getConfig from '../utils/get-config';

type TransactionsDataAdapterParameters = {
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
};

class TransactionsDataAdapter {
  private events: (DepositedEvent | RedeemedEvent)[] = [];

  private tempusPoolService: TempusPoolService | null = null;
  private statisticsService: StatisticsService | null = null;

  public init(params: TransactionsDataAdapterParameters): void {
    this.tempusPoolService = getTempusPoolService(params.signerOrProvider);
    this.statisticsService = getStatisticsService(params.signerOrProvider);
  }

  public async generateData(): Promise<Transaction[]> {
    await this.fetchEvents();

    const transactions = await this.fetchTransactionData();

    return transactions;
  }

  private async fetchEvents() {
    const fetchDepositEventsPromises: Promise<DepositedEvent[]>[] = [];
    const fetchRedeemEventsPromises: Promise<RedeemedEvent[]>[] = [];
    getConfig().tempusPools.forEach(tempusPool => {
      if (this.tempusPoolService === null) {
        console.error('Attempted to use TransactionsDataAdapter before initializing it!');
        return Promise.reject();
      }

      fetchDepositEventsPromises.push(this.tempusPoolService.getDepositedEvents(tempusPool.address));
      fetchRedeemEventsPromises.push(this.tempusPoolService.getRedeemedEvents(tempusPool.address));
    });
    const depositEvents = (await Promise.all(fetchDepositEventsPromises)).flat();
    const redeemEvents = (await Promise.all(fetchRedeemEventsPromises)).flat();

    this.events = [...depositEvents, ...redeemEvents];
  }

  private async fetchTransactionData(): Promise<Transaction[]> {
    const eventDataFetchPromises: Promise<Transaction>[] = [];
    this.events.forEach(event => {
      eventDataFetchPromises.push(this.fetchEventData(event));
    });
    return Promise.all(eventDataFetchPromises);
  }

  private async fetchEventData(event: DepositedEvent | RedeemedEvent): Promise<Transaction> {
    if (!this.tempusPoolService) {
      console.error('Attempted to use TransactionsDataAdapter before initializing it!');
      return Promise.reject();
    }

    const eventValue = await this.getEventUSDValue(event);
    const eventDate = await this.getEventTime(event);
    const tokenTicker = await this.tempusPoolService.getYieldBearingTokenTicker(event.address);
    const poolMaturityDate = await this.tempusPoolService.getMaturityTime(event.address);
    const formattedDate = DateTime.fromJSDate(poolMaturityDate).toFormat('D');

    const transaction: Transaction = {
      id: event.blockHash,
      pool: `${tokenTicker} ${formatDistanceToNow(poolMaturityDate)} ${formattedDate}`,
      action: this.getEventAction(event),
      totalValue: eventValue,
      account: this.getEventAccount(event),
      time: eventDate,
    };

    return transaction;
  }

  private getEventAccount(event: DepositedEvent | RedeemedEvent): string {
    if (this.isDepositEvent(event)) {
      return event.args.depositor;
    }
    if (this.isRedeemEvent(event)) {
      return event.args.redeemer;
    }

    throw new Error('TransactionsDataAdapter - getEventAccount() - Invalid event type!');
  }

  private getEventAction(event: DepositedEvent | RedeemedEvent): TransactionAction {
    if (this.isDepositEvent(event)) {
      return 'Deposit';
    }
    if (this.isRedeemEvent(event)) {
      // TODO - Check if redeem event has 'early redemption' flag set, if yes, return 'Early Redemption'.
      // Waiting for backend team to add early Redemption flag.
      return 'Redemption';
    }

    throw new Error('TransactionsDataAdapter - getEventAccount() - Invalid event type!');
  }

  private async getEventTime(event: DepositedEvent | RedeemedEvent): Promise<Date> {
    const provider = getDefaultProvider();

    const eventBlock = await provider.getBlock(event.blockNumber);

    return new Date(eventBlock.timestamp * 1000);
  }

  private async getEventUSDValue(event: DepositedEvent | RedeemedEvent): Promise<number> {
    if (!this.tempusPoolService || !this.statisticsService) {
      console.error('Attempted to use TransactionsDataAdapter before initializing it!');
      return Promise.reject();
    }

    const eventPoolBackingToken = await this.tempusPoolService.getBackingTokenTicker(event.address);
    const poolBackingTokenRate = await this.statisticsService.getRate(eventPoolBackingToken, {
      blockTag: event.blockNumber,
    });

    return this.getEventTokenValue(event) * poolBackingTokenRate;
  }

  /**
   * Returns event value in terms of the event Tempus Pool backing token count.
   */
  private getEventTokenValue(event: DepositedEvent | RedeemedEvent): number {
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
export default TransactionsDataAdapter;
