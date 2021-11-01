import React, { Dispatch, SetStateAction } from 'react';
import { BigNumber } from 'ethers';
import { Ticker } from '../interfaces/Token';

export interface ContextPoolData {
  address: string;
  backingTokenTicker: Ticker;
  fixedAPR: number | null;
  variableAPR: number;
  tvl: BigNumber | null;
  balance: BigNumber | null;
}

interface ContextData {
  poolData: ContextPoolData[];
}

interface ContextActions {
  setPoolData: Dispatch<SetStateAction<ContextData>> | null;
}

interface ContextType extends ContextActions, ContextData {}

export const defaultPoolDataContextValue: ContextData = {
  poolData: [],
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
