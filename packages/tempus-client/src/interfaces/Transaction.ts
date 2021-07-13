// to check
export interface Transaction {
  pool: string;
  action: string; // should be a type? deposit | swap | redemption | early redemption
  totalValue: number;
  account: string;
  time: Date; // or a string representing a date?
}
