import { BigNumber } from 'ethers';
import { createState } from '@hookstate/core';
import getConfig from '../utils/getConfig';
import { TempusPool } from '../interfaces/TempusPool';

// Currently selected pool (Pool Address)
export const selectedPoolState = createState('');

export interface StaticPoolDataMap {
  [poolAddress: string]: TempusPool;
}

// Static pool data state object
const staticPoolDataStateInitialValue: StaticPoolDataMap = {};
getConfig().tempusPools.forEach(tempusPoolConfig => {
  staticPoolDataStateInitialValue[tempusPoolConfig.address] = { ...tempusPoolConfig };
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
  userBackingTokenBalance: BigNumber | null;
  userBalanceInBackingToken: BigNumber | null;
  userYieldBearingTokenBalance: BigNumber | null;
  tvl: BigNumber | null;
  variableAPR: number | null;
  fixedAPR: number | null | 'unavailable';
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
    userBackingTokenBalance: null,
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
