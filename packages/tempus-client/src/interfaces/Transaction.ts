export type TransactionAction = 'deposit' | 'swap' | 'redemption' | 'earlyRedemption';
export interface Transaction {
  id: number;
  pool: string;
  action: TransactionAction;
  totalValue: number;
  account: string;
  time: Date;
}
