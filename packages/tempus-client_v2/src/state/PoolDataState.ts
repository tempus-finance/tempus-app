import { BigNumber } from 'ethers';
import { createState } from '@hookstate/core';
import getConfig from '../utils/getConfig';

// Currently selected pool (Pool Address)
export const selectedPoolState = createState('');

// Static pool data
interface StaticPoolData {
  address: string;
  maturityDate: number;
  startDate: number;
}

// Static pool data state object
const staticPoolDataStateInitialValue: { [poolAddress: string]: StaticPoolData } = {};
getConfig().tempusPools.forEach(tempusPoolConfig => {
  staticPoolDataStateInitialValue[tempusPoolConfig.address] = {
    address: tempusPoolConfig.address,
    maturityDate: tempusPoolConfig.maturityDate,
    startDate: tempusPoolConfig.startDate,
  };
});
export const staticPoolDataState = createState(staticPoolDataStateInitialValue);

// Dynamic pool data
interface DynamicPoolData {
  userBalanceUSD: BigNumber | null;
  userPrincipalsBalance: BigNumber | null;
  userYieldsBalance: BigNumber | null;
  userLPTokenBalance: BigNumber | null;
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
