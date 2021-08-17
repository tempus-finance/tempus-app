import { DateTime } from 'luxon';
import { formatDistanceToNow } from 'date-fns';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import getTempusPoolService from '../services/getTempusPoolService';
import TempusPoolService, { DepositedEvent, RedeemedEvent } from '../services/TempusPoolService';
import getStatisticsService from '../services/getStatisticsService';
import StatisticsService from '../services/StatisticsService';
import getDefaultProvider from '../services/getDefaultProvider';
import { getEventValue, isDepositEvent, isRedeemEvent } from '../services/EventUtils';
import { Transaction, TransactionAction } from '../interfaces';
import getConfig from '../utils/get-config';

type TransactionsDataAdapterParameters = {
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
};

class TransactionsDataAdapter {
  private tempusPoolService: TempusPoolService | null = null;
  private statisticsService: StatisticsService | null = null;

  public init(params: TransactionsDataAdapterParameters): void {
    this.tempusPoolService = getTempusPoolService(params.signerOrProvider);
    this.statisticsService = getStatisticsService(params.signerOrProvider);
  }

  public async generateData(): Promise<Transaction[]> {
    const events = await this.fetchEvents();
    const transactions = await this.fetchTransactionData(events);

    return transactions;
  }

  private async fetchEvents(): Promise<(DepositedEvent | RedeemedEvent)[]> {
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

    const [eventValue, eventDate, tokenTicker, poolMaturityDate] = await Promise.all([
      await this.getEventUSDValue(event),
      await this.getEventTime(event),
      await this.tempusPoolService.getYieldBearingTokenTicker(event.address),
      await this.tempusPoolService.getMaturityTime(event.address),
    ]);

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

    return getEventValue(event) * poolBackingTokenRate;
  }
}
export default TransactionsDataAdapter;
