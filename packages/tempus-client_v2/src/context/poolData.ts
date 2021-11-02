import React, { Dispatch, SetStateAction } from 'react';
import { BigNumber } from 'ethers';
import { Ticker } from '../interfaces/Token';
import getConfig from '../utils/getConfig';

export interface AvailableToDeposit {
  backingTokenAmount: BigNumber;
  yieldBearingTokenAmount: BigNumber;
}

export interface ContextPoolData {
  address: string;
  ammAddress: string;
  backingTokenTicker: Ticker;
  yieldBearingTokenTicker: Ticker;
  userBackingTokenBalance: BigNumber | null;
  userYieldBearingTokenBalance: BigNumber | null;
  userPrincipalsBalance: BigNumber | null;
  userYieldsBalance: BigNumber | null;
  userLPTokenBalance: BigNumber | null;
  fixedAPR: number | null;
  variableAPR: number;
  tvl: BigNumber | null;
  userBalanceUSD: BigNumber | null;
  userAvailableToDepositUSD: AvailableToDeposit | null;
  isNegativeYield: boolean;
  decimalsForUI: number;
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
    yieldBearingTokenTicker: tempusPoolConfig.yieldBearingToken,
    decimalsForUI: tempusPoolConfig.decimalsForUI,
    ammAddress: tempusPoolConfig.ammAddress,
    variableAPR: 0,
    tvl: null,
    fixedAPR: null,
    userBalanceUSD: null,
    userAvailableToDepositUSD: null,
    userBackingTokenBalance: null,
    userYieldBearingTokenBalance: null,
    userPrincipalsBalance: null,
    userYieldsBalance: null,
    userLPTokenBalance: null,
    isNegativeYield: true,
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
