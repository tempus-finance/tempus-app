import { BigNumber } from 'ethers';
import { TempusPool } from './TempusPool';
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
  maturityRange: (Date | null)[];
  fixedAPR: (number | null)[];
  variableAPY: (number | null)[]; // TODO rename to variableAPR
  availableUSDToDeposit: BigNumber | undefined;
  protocols: ProtocolName[];
}

export interface DashboardRowChild extends DashboardRow {
  protocol: ProtocolName;
  tempusPool: TempusPool;
  supportedTokens: Ticker[];
  startDate: Date;
  maturityDate: Date;
  fixedAPR: number | null;
  variableAPY: number; // TODO rename to variableAPR
  availableTokensToDeposit: AvailableToDeposit | undefined;
  availableUSDToDeposit: AvailableToDeposit | undefined;
  principalTokenAddress: string;
  yieldTokenAddress: string;
  backingTokenAddress: string;
  yieldBearingTokenAddress: string;
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
