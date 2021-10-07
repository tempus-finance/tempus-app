import { ProtocolName, Ticker } from '.';

export type TempusPool = {
  address: string;
  poolId: string;
  protocol: ProtocolName;
  startDate: number;
  maturityDate: number;
  ammAddress: string;
  principalsAddress: string;
  yieldsAddress: string;
  backingToken: Ticker;
  yieldBearingToken: Ticker;
  spotPrice: string;
  maxLeftoverShares: string;
  decimalsForUI: number;
};
