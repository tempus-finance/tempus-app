import { Chain, TempusPool, Ticker, ProtocolName } from 'tempus-core-services';

export interface DashboardRow {
  id: string;
  token: Ticker;
  chain: Chain;
  parentId: string | null;
}
export interface DashboardRowParent extends DashboardRow {
  maturityRange: (Date | null)[];
  protocols: ProtocolName[];
  parentId: null;
}

export interface DashboardRowChild extends DashboardRow {
  tempusPool: TempusPool;
  supportedTokens: Ticker[];
  startDate: Date;
  maturityDate: Date;
  parentId: string;
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
