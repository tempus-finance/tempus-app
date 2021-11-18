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
