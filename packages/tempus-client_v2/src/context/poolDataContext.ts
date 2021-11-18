import React, { Dispatch, SetStateAction } from 'react';
import { BigNumber } from 'ethers';
import { Ticker } from '../interfaces/Token';
import getConfig from '../utils/getConfig';
import { ProtocolName } from '../interfaces/ProtocolName';

export interface AvailableToDeposit {
  backingTokenValueInFiat: BigNumber | null;
  backingTokensAvailable: BigNumber | null;
  yieldBearingTokenValueInFiat: BigNumber | null;
  yieldBearingTokenValueInBackingToken: BigNumber | null;
}

export interface PoolData extends AvailableToDeposit {
  poolId: string;
  address: string;
  ammAddress: string;
  principalsAddress: string;
  yieldsAddress: string;
  protocol: ProtocolName;
  startDate: number;
  maturityDate: number;
  backingToken: Ticker;
  backingTokenAddress: string;
  yieldBearingToken: Ticker;
  yieldBearingTokenAddress: string;
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
  userBalanceInBackingToken: BigNumber | null;
  isNegativeYield: boolean;
  decimalsForUI: number;
  precision: {
    backingToken?: number;
  };
}

interface PoolDataContextData {
  poolData: PoolData[];
}

interface PoolDataContextActions {
  setPoolData: Dispatch<SetStateAction<PoolDataContextData>> | null;
}

interface PoolDataContextType extends PoolDataContextActions, PoolDataContextData {}

export const defaultPoolDataContextValue: PoolDataContextData = {
  poolData: getConfig().tempusPools.map(tempusPoolConfig => ({
    poolId: tempusPoolConfig.poolId,
    address: tempusPoolConfig.address,
    principalsAddress: tempusPoolConfig.principalsAddress,
    backingToken: tempusPoolConfig.backingToken,
    backingTokenAddress: tempusPoolConfig.backingTokenAddress,
    backingTokensAvailable: null,
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
    userBalanceInBackingToken: null,
    backingTokenValueInFiat: null,
    yieldBearingTokenValueInFiat: null,
    yieldBearingTokenValueInBackingToken: null,
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

const poolDataMap: { [address: string]: PoolData } = {};
export function getDataForPool(address: string, poolDataList: PoolData[]): PoolData {
  if (poolDataMap[address] !== undefined) {
    return poolDataMap[address];
  }

  const result = poolDataList.find(poolData => poolData.address === address);
  if (!result) {
    throw new Error('Context - getDataForPool() - Failed to fetch data for pool!');
  }

  poolDataMap[address] = result;
  return result;
}
