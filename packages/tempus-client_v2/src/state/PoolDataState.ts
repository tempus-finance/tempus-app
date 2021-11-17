import { createState } from '@hookstate/core';
import getConfig from '../utils/getConfig';

// Currently selected pool (Pool Address)
export const selectedPoolState = createState('');

// Maturity data for all Tempus Pools
const poolMaturityStateData: { [poolAddress: string]: number } = {};
getConfig().tempusPools.forEach(tempusPoolConfig => {
  poolMaturityStateData[tempusPoolConfig.address] = tempusPoolConfig.maturityDate;
});
export const poolMaturityDateState = createState(poolMaturityStateData);

// Start date data for all Tempus Pools
const poolStartDateStateData: { [poolAddress: string]: number } = {};
getConfig().tempusPools.forEach(tempusPoolConfig => {
  poolStartDateStateData[tempusPoolConfig.address] = tempusPoolConfig.startDate;
});
export const poolStartDateState = createState(poolStartDateStateData);
