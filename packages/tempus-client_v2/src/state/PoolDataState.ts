import { BigNumber } from 'ethers';
import { createState } from '@hookstate/core';
import { getChainConfig } from '../utils/getConfig';
import { TempusPool } from '../interfaces/TempusPool';

// Currently selected pool (Pool Address)
export const selectedPoolState = createState('');

export interface StaticPoolDataMap {
  [poolAddress: string]: TempusPool;
}

// Static pool data state object
const staticPoolDataStateInitialValue: StaticPoolDataMap = {};
getChainConfig('ethereum').tempusPools.forEach(tempusPoolConfig => {
  staticPoolDataStateInitialValue[tempusPoolConfig.address] = { ...tempusPoolConfig };
});
getChainConfig('fantom').tempusPools.forEach(tempusPoolConfig => {
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
  poolShareBalance: {
    principals: BigNumber | null;
    yields: BigNumber | null;
  };
  userBalanceUSD: BigNumber | null;
  userPrincipalsBalance: BigNumber | null;
  userYieldsBalance: BigNumber | null;
  userLPTokenBalance: BigNumber | null;
  userBackingTokenBalance: BigNumber | null;
  userBalanceInBackingToken: BigNumber | null;
  userYieldBearingTokenBalance: BigNumber | null;
  tvl: BigNumber | null;
  variableAPR: number | null;
  fixedAPR: number | null | 'fetching';
  negativeYield: boolean;
}

export interface DynamicPoolStateData {
  [poolAddress: string]: DynamicPoolData;
}

// Dynamic pool data state object
const dynamicPoolDataStateInitialValue: DynamicPoolStateData = {};

getChainConfig('ethereum').tempusPools.forEach(tempusPoolConfig => {
  dynamicPoolDataStateInitialValue[tempusPoolConfig.address] = {
    poolShareBalance: {
      principals: null,
      yields: null,
    },
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
    fixedAPR: 'fetching',
    negativeYield: true,
  };
});

getChainConfig('fantom').tempusPools.forEach(tempusPoolConfig => {
  dynamicPoolDataStateInitialValue[tempusPoolConfig.address] = {
    poolShareBalance: {
      principals: null,
      yields: null,
    },
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
    fixedAPR: 'fetching',
    negativeYield: true,
  };
});
export const dynamicPoolDataState = createState(dynamicPoolDataStateInitialValue);
