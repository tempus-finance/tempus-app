import { Ticker } from './Token';
import { ProtocolDisplayName, ProtocolName } from './ProtocolName';
import { TokenPrecision } from './TokenPrecision';

export type TempusPool = {
  address: string;
  poolId: string;
  protocol: ProtocolName;
  protocolDisplayName: ProtocolDisplayName;
  startDate: number;
  maturityDate: number;
  ammAddress: string;
  principalsAddress: string;
  yieldsAddress: string;
  backingToken: Ticker;
  yieldBearingToken: Ticker;
  yieldBearingTokenAddress: string;
  backingTokenAddress: string;
  spotPrice: string;
  decimalsForUI: number;
  tokenPrecision: TokenPrecision;
  showEstimatesInBackingToken: boolean;
};
