import { Protocol } from './Protocol';
import { Ticker } from './Token';

export interface DashboardRow {
  id: number;
  parentId: number;
  token: Ticker;
  supportedTokens?: Ticker[];
  defaultToken?: Ticker;
  protocol: Protocol[];
  maturity: Date;
  fixedAPY: number;
  variableAPY: number;
  TVL: number;
  presentValue: number;
  availableToDeposit: string;
}
