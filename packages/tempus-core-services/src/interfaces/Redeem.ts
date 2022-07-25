import { Decimal } from '../datastructures';
import { Ticker } from './Token';

export type Redeem = {
  transactionHash: string;
  userWallet: string;
  amountRedeemed: Decimal;
  tokenRedeemed: Ticker;
  tokenRate: Decimal;
  date: Date;
  poolAddress: string;
};
