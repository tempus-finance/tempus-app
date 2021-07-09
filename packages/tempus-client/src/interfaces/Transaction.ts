export type TransactionAction = 'deposit' | 'swap' | 'redemption' | 'earlyRedemption';
export interface Transaction {
  pool: string;
  action: TransactionAction;
  totalValue: number;
  account: string;
  time: Date;
}
