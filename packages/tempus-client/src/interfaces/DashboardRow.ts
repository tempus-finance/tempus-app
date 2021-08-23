import { Ticker } from './Token';

export interface DashboardRow {
  id: string;
  parentId: string | null;
  token: Ticker;
  TVL: number;
  presentValue: number | undefined;
  availableToDeposit: string | undefined;
}

export interface DashboardRowParent extends DashboardRow {
  maturityRange: Date[];
  fixedAPY: number[];
  variableAPY: number[];
}

export interface DashboardRowChild extends DashboardRow {
  protocol: string;
  supportedTokens: Ticker[];
  startDate: Date;
  maturityDate: Date;
  fixedAPY: number;
  variableAPY: number;
}
