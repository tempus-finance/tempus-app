import React, { Dispatch, SetStateAction } from 'react';
import { BigNumber } from 'ethers';
import { Ticker } from '../interfaces/Token';
import getConfig from '../utils/getConfig';

export interface ContextPoolData {
  address: string;
  backingTokenTicker: Ticker;
  fixedAPR: number | null;
  variableAPR: number;
  tvl: BigNumber | null;
  balance: BigNumber | null;
}

interface ContextData {
  selectedPool: string;
  poolData: ContextPoolData[];
}

interface ContextActions {
  setPoolData: Dispatch<SetStateAction<ContextData>> | null;
}

interface ContextType extends ContextActions, ContextData {}

export const defaultPoolDataContextValue: ContextData = {
  selectedPool: '',
  poolData: getConfig().tempusPools.map(tempusPoolConfig => ({
    address: tempusPoolConfig.address,
    backingTokenTicker: tempusPoolConfig.backingToken,
    variableAPR: 0,
    tvl: null,
    fixedAPR: null,
    balance: null,
  })),
};

export const PoolDataContext = React.createContext<ContextType>({
  ...defaultPoolDataContextValue,
  setPoolData: null,
});

export function getDataForPool(address: string, poolData: ContextPoolData[]): ContextPoolData {
  const result = poolData.find(data => data.address === address);
  if (!result) {
    throw new Error('Context - getDataForPool() - Failed to fetch data for pool!');
  }
  return result;
}
