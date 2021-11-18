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
  userPrincipalsBalance: BigNumber | null;
  userYieldsBalance: BigNumber | null;
  userLPTokenBalance: BigNumber | null;
}

// Dynamic pool data state object
const dynamicPoolDataStateInitialValue: { [poolAddress: string]: DynamicPoolData } = {};
getConfig().tempusPools.forEach(tempusPoolConfig => {
  dynamicPoolDataStateInitialValue[tempusPoolConfig.address] = {
    userPrincipalsBalance: null,
    userYieldsBalance: null,
    userLPTokenBalance: null,
  };
});
export const dynamicPoolDataState = createState(dynamicPoolDataStateInitialValue);
