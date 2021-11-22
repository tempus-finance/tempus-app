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
  address: string;
  protocol: ProtocolName;
  startDate: number;
  maturityDate: number;
  backingTokenAddress: string;
  yieldBearingToken: Ticker;
  yieldBearingTokenAddress: string;
  userBackingTokenBalance: BigNumber | null;
  userYieldBearingTokenBalance: BigNumber | null;
  spotPrice: string;
  userBalanceInBackingToken: BigNumber | null;
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
    address: tempusPoolConfig.address,
    backingTokenAddress: tempusPoolConfig.backingTokenAddress,
    backingTokensAvailable: null,
    yieldBearingToken: tempusPoolConfig.yieldBearingToken,
    yieldBearingTokenAddress: tempusPoolConfig.yieldBearingTokenAddress,
    decimalsForUI: tempusPoolConfig.decimalsForUI,
    protocol: tempusPoolConfig.protocol,
    startDate: tempusPoolConfig.startDate,
    maturityDate: tempusPoolConfig.maturityDate,
    spotPrice: tempusPoolConfig.spotPrice,
    userBalanceInBackingToken: null,
    backingTokenValueInFiat: null,
    yieldBearingTokenValueInFiat: null,
    yieldBearingTokenValueInBackingToken: null,
    userBackingTokenBalance: null,
    userYieldBearingTokenBalance: null,
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
