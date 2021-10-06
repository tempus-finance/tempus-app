import { Ticker } from '.';

export type TempusPool = {
  address: string;
  ammAddress: string;
  backingToken: Ticker;
  spotPrice: string;
  maxLeftoverShares: string;
  decimalsForUI: number;
};
