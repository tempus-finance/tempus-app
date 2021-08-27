import { ethers } from 'ethers';
import format from 'date-fns/format';
import { formatDistanceToNow } from 'date-fns';
import { Block, JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import getTempusPoolService from '../services/getTempusPoolService';
import TempusPoolService from '../services/TempusPoolService';
import getStatisticsService from '../services/getStatisticsService';
import StatisticsService from '../services/StatisticsService';
import getDefaultProvider from '../services/getDefaultProvider';
import { isDepositEvent, isRedeemEvent } from '../services/EventUtils';
import { Ticker, Transaction, TransactionAction } from '../interfaces';
import TempusControllerService, { DepositedEvent, RedeemedEvent } from '../services/TempusControllerService';
import getTempusControllerService from '../services/getTempusControllerService';

type TransactionsDataAdapterParameters = {
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
};

class TransactionsDataAdapter {
  private tempusPoolService: TempusPoolService | null = null;
  private statisticsService: StatisticsService | null = null;
  private tempusControllerService: TempusControllerService | null = null;

  public init(params: TransactionsDataAdapterParameters): void {
    this.tempusPoolService = getTempusPoolService(params.signerOrProvider);
    this.statisticsService = getStatisticsService(params.signerOrProvider);
    this.tempusControllerService = getTempusControllerService(params.signerOrProvider);
  }

  public async generateData(): Promise<Transaction[]> {
    let events: (DepositedEvent | RedeemedEvent)[];
    try {
      events = await this.fetchEvents();
    } catch (error) {
      console.error('TransactionsDataAdapter - generateData() - Failed to fetch transaction events!');
      return Promise.reject(error);
    }

    let transactions: Transaction[];
    try {
      transactions = await this.fetchTransactionData(events);
    } catch (error) {
      console.error('TransactionsDataAdapter - generateData() - Failed to fetch transaction data!');
      return Promise.reject(error);
    }

    return transactions;
  }

  private async fetchEvents(): Promise<(DepositedEvent | RedeemedEvent)[]> {
    if (this.tempusControllerService === null) {
      console.error('Attempted to use TransactionsDataAdapter before initializing it!');
      return Promise.reject();
    }

    let depositEvents: DepositedEvent[];
    let redeemEvents: RedeemedEvent[];
    try {
      [depositEvents, redeemEvents] = await Promise.all([
        this.tempusControllerService.getDepositedEvents(),
        this.tempusControllerService.getRedeemedEvents(),
      ]);
    } catch (error) {
      console.error('TransactionsDataAdapter - fetchEvents() - Failed to fetch deposit and redeem events!');
      return Promise.reject(error);
    }

    return [...depositEvents, ...redeemEvents];
  }

  private async fetchTransactionData(events: (DepositedEvent | RedeemedEvent)[]): Promise<Transaction[]> {
    const eventDataFetchPromises: Promise<Transaction>[] = [];
    events.forEach(event => {
      eventDataFetchPromises.push(this.fetchEventData(event));
    });
    return Promise.all(eventDataFetchPromises);
  }

  private async fetchEventData(event: DepositedEvent | RedeemedEvent): Promise<Transaction> {
    if (!this.tempusPoolService) {
      console.error('Attempted to use TransactionsDataAdapter before initializing it!');
      return Promise.reject();
    }

    let transaction: Transaction;
    try {
      const [eventValue, eventDate, tokenTicker, poolMaturityDate] = await Promise.all([
        await this.getEventUSDValue(event),
        await this.getEventTime(event),
        await this.tempusPoolService.getYieldBearingTokenTicker(event.args.pool),
        await this.tempusPoolService.getMaturityTime(event.args.pool),
      ]);

      const formattedDate = format(poolMaturityDate, 'dd/MM/yyyy');

      transaction = {
        id: event.blockHash,
        pool: `${tokenTicker} ${formatDistanceToNow(poolMaturityDate)} ${formattedDate}`,
        action: this.getEventAction(event),
        totalValue: eventValue,
        account: this.getEventAccount(event),
        time: eventDate,
      };
    } catch (error) {
      console.error('TransactionsDataAdapter - fetchEventData() - Failed to fetch transaction data for event!');
      return Promise.reject(error);
    }

    return transaction;
  }

  private getEventAccount(event: DepositedEvent | RedeemedEvent): string {
    if (isDepositEvent(event)) {
      return event.args.depositor;
    }
    if (isRedeemEvent(event)) {
      return event.args.redeemer;
    }

    throw new Error('TransactionsDataAdapter - getEventAccount() - Invalid event type!');
  }

  private getEventAction(event: DepositedEvent | RedeemedEvent): TransactionAction {
    if (isDepositEvent(event)) {
      return 'Deposit';
    }
    if (isRedeemEvent(event)) {
      // TODO - Check if redeem event has 'early redemption' flag set, if yes, return 'Early Redemption'.
      // Waiting for backend team to add early Redemption flag.
      return 'Redemption';
    }

    throw new Error('TransactionsDataAdapter - getEventAccount() - Invalid event type!');
  }

  private async getEventTime(event: DepositedEvent | RedeemedEvent): Promise<Date> {
    const provider = getDefaultProvider();

    let eventBlock: Block;
    try {
      eventBlock = await provider.getBlock(event.blockNumber);
    } catch (error) {
      console.error('TransactionsDataAdapter - getEventTime() - Failed to fetch event block data!');
      return Promise.reject(error);
    }

    return new Date(eventBlock.timestamp * 1000);
  }

  private async getEventUSDValue(event: DepositedEvent | RedeemedEvent): Promise<number> {
    if (!this.tempusPoolService || !this.statisticsService) {
      console.error('Attempted to use TransactionsDataAdapter before initializing it!');
      return Promise.reject();
    }

    let eventPoolBackingToken: Ticker;
    try {
      eventPoolBackingToken = await this.tempusPoolService.getBackingTokenTicker(event.args.pool);
    } catch (error) {
      console.log(
        'TransactionsDataAdapter - getEventUSDValue() - Failed to fetch event tempus pool backing token ticker!',
      );
      return Promise.reject(error);
    }

    let poolBackingTokenRate: number;
    try {
      poolBackingTokenRate = await this.statisticsService.getRate(eventPoolBackingToken, {
        blockTag: event.blockNumber,
      });
    } catch (error) {
      console.error('TransactionsDataAdapter - getEventUSDValue() - Failed to fetch backing token rate!');
      return Promise.reject(error);
    }

    return Number(ethers.utils.formatEther(event.args.backingTokenValue)) * poolBackingTokenRate;
  }
}
export default TransactionsDataAdapter;
