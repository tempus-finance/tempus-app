export type TransactionAction = 'Deposit' | 'Swap' | 'Redemption' | 'Early Redemption';
export interface Transaction {
  id: string;
  pool: string;
  action: TransactionAction;
  totalValue: number;
  account: string;
  time: Date;
}
