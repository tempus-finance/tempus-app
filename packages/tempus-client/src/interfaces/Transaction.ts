import { BigNumber } from '@ethersproject/bignumber';

export type TransactionAction = 'Deposit' | 'Swap' | 'Redemption' | 'Early Redemption';
export interface Transaction {
  id: string;
  pool: string;
  action: TransactionAction;
  totalValue: BigNumber;
  account: string;
  time: Date;
}
