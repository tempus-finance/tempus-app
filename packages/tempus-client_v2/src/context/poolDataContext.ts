import React, { Dispatch, SetStateAction } from 'react';
import { BigNumber } from 'ethers';
import { Ticker } from '../interfaces/Token';
import getConfig from '../utils/getConfig';
import { ProtocolName } from '../interfaces/ProtocolName';

export interface AvailableToDeposit {
  backingTokenAmount: BigNumber;
  yieldBearingTokenAmount: BigNumber;
}

export interface PoolData {
  poolId: string;
  address: string;
  ammAddress: string;
  principalsAddress: string;
  protocol: ProtocolName;
  startDate: number;
  maturityDate: number;
  backingToken: Ticker;
  backingTokenAddress: string;
  yieldBearingToken: Ticker;
  yieldBearingTokenAddress: string;
  yieldsAddress: string;
  userBackingTokenBalance: BigNumber | null;
  userYieldBearingTokenBalance: BigNumber | null;
  userPrincipalsBalance: BigNumber | null;
  userYieldsBalance: BigNumber | null;
  userLPTokenBalance: BigNumber | null;
  spotPrice: string;
  fixedAPR: number | null;
  variableAPR: number;
  tvl: BigNumber | null;
  userBalanceUSD: BigNumber | null;
  userAvailableToDepositUSD: AvailableToDeposit | null;
  isNegativeYield: boolean;
  decimalsForUI: number;
  precision: {
    backingToken?: number;
  };
}

interface PoolDataContextData {
  selectedPool: string; // is the address
  poolData: PoolData[];
}

interface PoolDataContextActions {
  setPoolData: Dispatch<SetStateAction<PoolDataContextData>> | null;
}

interface PoolDataContextType extends PoolDataContextActions, PoolDataContextData {}

export const defaultPoolDataContextValue: PoolDataContextData = {
  selectedPool: '',
  poolData: getConfig().tempusPools.map(tempusPoolConfig => ({
    poolId: tempusPoolConfig.poolId,
    address: tempusPoolConfig.address,
    principalsAddress: tempusPoolConfig.principalsAddress,
    backingToken: tempusPoolConfig.backingToken,
    backingTokenAddress: tempusPoolConfig.backingTokenAddress,
    yieldBearingToken: tempusPoolConfig.yieldBearingToken,
    yieldBearingTokenAddress: tempusPoolConfig.yieldBearingTokenAddress,
    yieldsAddress: tempusPoolConfig.yieldsAddress,
    decimalsForUI: tempusPoolConfig.decimalsForUI,
    ammAddress: tempusPoolConfig.ammAddress,
    protocol: tempusPoolConfig.protocol,
    startDate: tempusPoolConfig.startDate,
    maturityDate: tempusPoolConfig.maturityDate,
    spotPrice: tempusPoolConfig.spotPrice,
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
    precision: {
      backingToken: tempusPoolConfig.tokenPrecision?.backingToken,
    },
  })),
};

export const PoolDataContext = React.createContext<PoolDataContextType>({
  ...defaultPoolDataContextValue,
  setPoolData: null,
});

// TODO use a map to speedup retrieval
export function getDataForPool(address: string, poolData: PoolData[]): PoolData {
  const result = poolData.find(data => data.address === address);
  if (!result) {
    throw new Error('Context - getDataForPool() - Failed to fetch data for pool!');
  }
  return result;
}
