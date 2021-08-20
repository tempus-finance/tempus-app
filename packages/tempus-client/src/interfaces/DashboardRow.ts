import { Ticker } from './Token';

export type DashboardRow = DashboardRowParent | DashboardRowChild;

export interface DashboardRowParent {
  id: string;
  // dx-react-grid library requires parentId on each row - even though parent rows don't actually need it and is always null.
  parentId: null;
  token: Ticker;
  maturity: Date[];
  fixedAPY: number[];
  variableAPY: number[];
  TVL: number;
  presentValue: number;
  availableToDeposit: string;
}

export interface DashboardRowChild {
  id: string;
  parentId: string;
  token: Ticker;
  protocol: string;
  supportedTokens: Ticker[];
  startDate: Date;
  maturityDate: Date;
  fixedAPY: number;
  variableAPY: number;
  TVL: number;
  presentValue: number;
  availableToDeposit: string;
}
