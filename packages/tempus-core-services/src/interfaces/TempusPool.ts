import { Ticker } from './Token';
import { ProtocolDisplayName, ProtocolName } from './ProtocolName';
import { TokenPrecision } from './TokenPrecision';
import { TransactionView } from './TransactionView';
import { Chain } from './Chain';

export type TempusPool = {
  chain: Chain;
  address: string;
  poolId: string;
  protocol: ProtocolName;
  protocolDisplayName: ProtocolDisplayName;
  startDate: number; // in milliseconds
  maturityDate: number; // in milliseconds
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
  disabledOperations: {
    [key in TransactionView]?: boolean;
  };
  rippleColor?: string;
};
