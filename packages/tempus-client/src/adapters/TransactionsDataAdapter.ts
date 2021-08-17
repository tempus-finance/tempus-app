import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import getTempusPoolService from '../services/getTempusPoolService';
import TempusPoolService, { DepositedEvent, RedeemedEvent } from '../services/TempusPoolService';
import { Transaction } from '../interfaces';
import getConfig from '../utils/get-config';

type TransactionsDataAdapterParameters = {
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
};

class TransactionsDataAdapter {
  private tempusPoolService: TempusPoolService | null = null;

  public init(params: TransactionsDataAdapterParameters): void {
    this.tempusPoolService = getTempusPoolService(params.signerOrProvider);
  }

  public async generateData(): Promise<Transaction[]> {
    const transactions: Transaction[] = [];

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

    return transactions;
  }
}
export default TransactionsDataAdapter;
