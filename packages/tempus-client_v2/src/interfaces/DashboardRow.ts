import { TempusPool } from './TempusPool';
import { Ticker } from './Token';
import { ProtocolName } from './ProtocolName';

export interface DashboardRow {
  id: string;
  parentId: string | null;
  token: Ticker;
}
export interface DashboardRowParent extends DashboardRow {
  maturityRange: (Date | null)[];
  protocols: ProtocolName[];
}

export interface DashboardRowChild extends DashboardRow {
  tempusPool: TempusPool;
  supportedTokens: Ticker[];
  startDate: Date;
  maturityDate: Date;
}

/**
 * Type guard - Checks if provided row is parent
 */
export function isParentRow(row: DashboardRow): row is DashboardRowParent {
  return 'maturityRange' in row;
}

/**
 * Type guard - Checks if provided row is child
 */
export function isChildRow(row: DashboardRow): row is DashboardRowChild {
  return 'maturityDate' in row;
}
