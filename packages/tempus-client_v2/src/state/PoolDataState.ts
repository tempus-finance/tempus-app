import { BigNumber } from 'ethers';
import { createState } from '@hookstate/core';
import getConfig from '../utils/getConfig';
import { Ticker } from '../interfaces/Token';
import { ProtocolName } from '../interfaces/ProtocolName';

// Currently selected pool (Pool Address)
export const selectedPoolState = createState('');

// Static pool data
export interface StaticPoolData {
  address: string;
  poolId: string;
  protocol: ProtocolName;
  ammAddress: string;
  maturityDate: number;
  startDate: number;
  principalsAddress: string;
  yieldsAddress: string;
  backingToken: Ticker;
  yieldBearingToken: Ticker;
  backingTokenAddress: string;
  yieldBearingTokenAddress: string;
  decimalsForUI: number;
  precision: {
    backingToken?: number;
  };
}

export interface StaticPoolStateData {
  [poolAddress: string]: StaticPoolData;
}

// Static pool data state object
const staticPoolDataStateInitialValue: StaticPoolStateData = {};
getConfig().tempusPools.forEach(tempusPoolConfig => {
  staticPoolDataStateInitialValue[tempusPoolConfig.address] = {
    address: tempusPoolConfig.address,
    poolId: tempusPoolConfig.poolId,
    protocol: tempusPoolConfig.protocol,
    ammAddress: tempusPoolConfig.ammAddress,
    maturityDate: tempusPoolConfig.maturityDate,
    startDate: tempusPoolConfig.startDate,
    principalsAddress: tempusPoolConfig.principalsAddress,
    yieldsAddress: tempusPoolConfig.yieldsAddress,
    backingToken: tempusPoolConfig.backingToken,
    yieldBearingToken: tempusPoolConfig.yieldBearingToken,
    backingTokenAddress: tempusPoolConfig.backingTokenAddress,
    yieldBearingTokenAddress: tempusPoolConfig.yieldBearingTokenAddress,
    decimalsForUI: tempusPoolConfig.decimalsForUI,
    precision: {
      backingToken: tempusPoolConfig.tokenPrecision?.backingToken,
    },
  };
});
export const staticPoolDataState = createState(staticPoolDataStateInitialValue);

// Dynamic pool data
export interface AvailableToDeposit {
  backingTokenValueInFiat: BigNumber | null;
  backingTokensAvailable: BigNumber | null;
  yieldBearingTokenValueInFiat: BigNumber | null;
  yieldBearingTokenValueInBackingToken: BigNumber | null;
}

export interface DynamicPoolData extends AvailableToDeposit {
  userBalanceUSD: BigNumber | null;
  userPrincipalsBalance: BigNumber | null;
  userYieldsBalance: BigNumber | null;
  userLPTokenBalance: BigNumber | null;
  userBalanceInBackingToken: BigNumber | null;
  userYieldBearingTokenBalance: BigNumber | null;
  tvl: BigNumber | null;
  variableAPR: number | null;
  fixedAPR: number | null;
}

export interface DynamicPoolStateData {
  [poolAddress: string]: DynamicPoolData;
}

// Dynamic pool data state object
const dynamicPoolDataStateInitialValue: DynamicPoolStateData = {};
getConfig().tempusPools.forEach(tempusPoolConfig => {
  dynamicPoolDataStateInitialValue[tempusPoolConfig.address] = {
    userBalanceUSD: null,
    userPrincipalsBalance: null,
    userYieldsBalance: null,
    userLPTokenBalance: null,
    backingTokenValueInFiat: null,
    yieldBearingTokenValueInFiat: null,
    userBalanceInBackingToken: null,
    backingTokensAvailable: null,
    yieldBearingTokenValueInBackingToken: null,
    userYieldBearingTokenBalance: null,
    tvl: null,
    variableAPR: null,
    fixedAPR: null,
  };
});
export const dynamicPoolDataState = createState(dynamicPoolDataStateInitialValue);

export interface NegativeYieldStateData {
  [poolAddress: string]: boolean;
}
const negativeYieldPoolDataStateInitialVale: NegativeYieldStateData = {};
getConfig().tempusPools.forEach(tempusPoolConfig => {
  negativeYieldPoolDataStateInitialVale[tempusPoolConfig.address] = true;
});
export const negativeYieldPoolDataState = createState(negativeYieldPoolDataStateInitialVale);
