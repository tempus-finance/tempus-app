import { Protocol } from './Protocol';
import { Token } from './Token';

export interface DashboardRow {
  id: number;
  parentId: number;
  token: Token;
  protocol: Protocol[];
  maturity: Date;
  fixedAPY: number;
  variableAPY: number;
  TVL: number;
  presentValue: number;
  availableToDeposit: string;
}
