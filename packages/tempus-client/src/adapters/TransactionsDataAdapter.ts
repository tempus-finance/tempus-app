import { BigNumber } from 'ethers';
import { formatDate } from '../utils/formatDate';
import { formatDistanceToNow } from 'date-fns';
import { v1 as uuid } from 'uuid';
import { Block, JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import getTempusPoolService from '../services/getTempusPoolService';
import TempusPoolService from '../services/TempusPoolService';
import getStatisticsService from '../services/getStatisticsService';
import StatisticsService from '../services/StatisticsService';
import getDefaultProvider from '../services/getDefaultProvider';
import {
  getEventBackingTokenValue,
  getEventPoolAddress,
  isDepositEvent,
  isRedeemEvent,
  isSwapEvent,
} from '../services/EventUtils';
import TempusControllerService, { DepositedEvent, RedeemedEvent } from '../services/TempusControllerService';
import getTempusControllerService from '../services/getTempusControllerService';
import VaultService, { SwapEvent } from '../services/VaultService';
import getVaultService from '../services/getVaultService';
import getTempusAMMService from '../services/getTempusAMMService';
import TempusAMMService from '../services/TempusAMMService';
import { Ticker, Transaction, TransactionAction } from '../interfaces';
import { mul18f } from '../utils/wei-math';

type TransactionsDataAdapterParameters = {
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
};

class TransactionsDataAdapter {
  private tempusPoolService: TempusPoolService | null = null;
  private statisticsService: StatisticsService | null = null;
  private tempusControllerService: TempusControllerService | null = null;
  private vaultService: VaultService | null = null;
  private tempusAMMService: TempusAMMService | null = null;

  public init(params: TransactionsDataAdapterParameters): void {
    this.tempusPoolService = getTempusPoolService(params.signerOrProvider);
    this.statisticsService = getStatisticsService(params.signerOrProvider);
    this.tempusControllerService = getTempusControllerService(params.signerOrProvider);
    this.vaultService = getVaultService(params.signerOrProvider);
    this.tempusAMMService = getTempusAMMService(params.signerOrProvider);
  }

  public async generateData(): Promise<Transaction[]> {
    let events: (DepositedEvent | RedeemedEvent | SwapEvent)[];
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

    return this.sortTransactions(transactions);
  }

  private async fetchEvents(): Promise<(DepositedEvent | RedeemedEvent | SwapEvent)[]> {
    if (!this.tempusControllerService || !this.vaultService) {
      console.error('Attempted to use TransactionsDataAdapter before initializing it!');
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
      console.error('TransactionsDataAdapter - fetchEvents() - Failed to fetch deposit and redeem events!');
      return Promise.reject(error);
    }

    return [...depositEvents, ...redeemEvents, ...swapEvents];
  }

  private async fetchTransactionData(events: (DepositedEvent | RedeemedEvent | SwapEvent)[]): Promise<Transaction[]> {
    const eventDataFetchPromises: Promise<Transaction>[] = [];
    events.forEach(event => {
      eventDataFetchPromises.push(this.fetchEventData(event));
    });
    return Promise.all(eventDataFetchPromises);
  }

  private async fetchEventData(event: DepositedEvent | RedeemedEvent | SwapEvent): Promise<Transaction> {
    if (!this.tempusPoolService || !this.tempusAMMService) {
      console.error('Attempted to use TransactionsDataAdapter before initializing it!');
      return Promise.reject();
    }

    let transaction: Transaction;
    try {
      const eventPoolAddress = await getEventPoolAddress(event, this.tempusAMMService);

      const [eventValue, eventDate, tokenTicker, poolMaturityDate] = await Promise.all([
        await this.getEventUSDValue(event),
        await this.getEventTime(event),
        await this.tempusPoolService.getYieldBearingTokenTicker(eventPoolAddress),
        await this.tempusPoolService.getMaturityTime(eventPoolAddress),
      ]);

      const formattedDate = formatDate(poolMaturityDate, 'dd/MM/yyyy');

      transaction = {
        id: uuid(),
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

  private getEventAccount(event: DepositedEvent | RedeemedEvent | SwapEvent): string {
    if (isDepositEvent(event)) {
      return event.args.depositor;
    }
    if (isRedeemEvent(event)) {
      return event.args.redeemer;
    }
    if (isSwapEvent(event)) {
      // TODO - Use address of the user that executed the swap once it's added to swap event data.
      return '-';
    }

    throw new Error('TransactionsDataAdapter - getEventAccount() - Invalid event type!');
  }

  private getEventAction(event: DepositedEvent | RedeemedEvent | SwapEvent): TransactionAction {
    if (isDepositEvent(event)) {
      return 'Deposit';
    }
    if (isRedeemEvent(event)) {
      if (event.args.isEarlyRedeem) {
        return 'Early Redemption';
      }
      return 'Redemption';
    }
    if (isSwapEvent(event)) {
      return 'Swap';
    }

    throw new Error('TransactionsDataAdapter - getEventAccount() - Invalid event type!');
  }

  private async getEventTime(event: DepositedEvent | RedeemedEvent | SwapEvent): Promise<Date> {
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

  private async getEventUSDValue(event: DepositedEvent | RedeemedEvent | SwapEvent): Promise<BigNumber> {
    if (!this.tempusPoolService || !this.statisticsService || !this.tempusAMMService) {
      console.error('Attempted to use TransactionsDataAdapter before initializing it!');
      return Promise.reject();
    }

    let eventPoolBackingToken: Ticker;
    try {
      const eventPoolAddress = await getEventPoolAddress(event, this.tempusAMMService);

      eventPoolBackingToken = await this.tempusPoolService.getBackingTokenTicker(eventPoolAddress);
    } catch (error) {
      console.log(
        'TransactionsDataAdapter - getEventUSDValue() - Failed to fetch event tempus pool backing token ticker!',
      );
      return Promise.reject(error);
    }

    let poolBackingTokenRate: BigNumber;
    try {
      poolBackingTokenRate = await this.statisticsService.getRate(eventPoolBackingToken, {
        blockTag: event.blockNumber,
      });
    } catch (error) {
      console.error('TransactionsDataAdapter - getEventUSDValue() - Failed to fetch backing token rate!');
      return Promise.reject(error);
    }

    let eventBackingTokenValue: BigNumber;
    try {
      eventBackingTokenValue = await getEventBackingTokenValue(event, this.tempusAMMService, this.tempusPoolService);
    } catch (error) {
      console.error(
        'TransactionsDataAdapter - getEventUSDValue() - Failed to get event value in backing tokes!',
        error,
      );
      return Promise.reject(error);
    }

    return mul18f(eventBackingTokenValue, poolBackingTokenRate);
  }

  private sortTransactions(transactions: Transaction[]): Transaction[] {
    return transactions.sort((a, b) => b.time.getTime() - a.time.getTime());
  }
}
export default TransactionsDataAdapter;
