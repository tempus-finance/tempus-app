import { Ticker } from './Token';

export interface DashboardRow {
  id: string;
  token: Ticker;
  TVL: number;
  presentValue: number | undefined;
  availableToDeposit: string | undefined;
}

export interface DashboardRowParent extends DashboardRow {
  // dx-react-grid library requires parentId on each row - even though parent rows don't actually need it and is always null.
  parentId: null;
  maturity: Date[];
  fixedAPY: number[];
  variableAPY: number[];
}

export interface DashboardRowChild extends DashboardRow {
  parentId: string;
  protocol: string;
  supportedTokens: Ticker[];
  startDate: Date;
  maturityDate: Date;
  fixedAPY: number;
  variableAPY: number;
}
