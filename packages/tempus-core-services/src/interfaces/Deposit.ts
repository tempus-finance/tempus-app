import { Decimal } from '../datastructures';
import { Ticker } from './Token';

export type Deposit = {
  transactionHash: string;
  userWallet: string;
  amountDeposited: Decimal;
  tokenDeposited: Ticker;
  tokenRate: Decimal;
  date: Date;
};
