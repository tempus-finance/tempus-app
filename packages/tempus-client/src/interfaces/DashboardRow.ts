import { BigNumber } from '@ethersproject/bignumber';
import { Ticker } from './Token';
import { ProtocolName } from '.';

export interface DashboardRow {
  id: string;
  parentId: string | null;
  token: Ticker;
  TVL: number;
  presentValue: BigNumber | undefined;
}

export interface DashboardRowParent extends DashboardRow {
  maturityRange: Date[];
  fixedAPR: number[];
  variableAPY: number[];
  availableToDeposit: BigNumber | undefined;
  protocols: ProtocolName[];
}

export interface DashboardRowChild extends DashboardRow {
  poolAddress: string;
  protocol: ProtocolName;
  supportedTokens: Ticker[];
  startDate: Date;
  maturityDate: Date;
  fixedAPR: number;
  variableAPY: number;
  availableTokensToDeposit: AvailableToDeposit | undefined;
  availableToDepositInUSD: AvailableToDeposit | undefined;
}

export interface AvailableToDeposit {
  backingToken: BigNumber;
  backingTokenTicker: Ticker;
  yieldBearingToken: BigNumber;
  yieldBearingTokenTicker: Ticker;
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
