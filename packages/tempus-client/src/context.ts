import React, { Dispatch, SetStateAction } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { DashboardRowChild, Ticker } from './interfaces';
import getConfig from './utils/get-config';

export interface AvailableToDeposit {
  backingTokenAmount: BigNumber;
  yieldBearingTokenAmount: BigNumber;
}

export interface ContextPoolData {
  address: string;
  backingTokenTicker: Ticker;
  yieldBearingTokenTicker: Ticker;
  userBackingTokenBalance: BigNumber | null;
  userYieldBearingTokenBalance: BigNumber | null;
  fixedAPR: number | null;
  variableAPR: number;
  tvl: BigNumber | null;
  userBalanceUSD: BigNumber | null;
  userAvailableToDepositUSD: AvailableToDeposit | null;
}

interface ContextDataType {
  userWalletConnected: boolean | null;
  userWalletAddress: string;
  userWalletSigner: JsonRpcSigner | null;
  userPrincipalsBalance: BigNumber | null;
  userYieldsBalance: BigNumber | null;
  userLPBalance: BigNumber | null;
  pendingTransactions: string[];
  selectedRow: DashboardRowChild | null;
  userEthBalance: BigNumber | null;
  poolData: ContextPoolData[];
}

interface ContextType {
  data: ContextDataType;
  setData: Dispatch<SetStateAction<ContextDataType>> | null;
}

export const defaultContextValue: ContextDataType = {
  userWalletConnected: null,
  userWalletAddress: '',
  userWalletSigner: null,
  userPrincipalsBalance: null,
  userYieldsBalance: null,
  userLPBalance: null,
  pendingTransactions: [],
  selectedRow: null,
  userEthBalance: null,
  poolData: getConfig().tempusPools.map(tempusPoolConfig => ({
    address: tempusPoolConfig.address,
    backingTokenTicker: tempusPoolConfig.backingToken,
    yieldBearingTokenTicker: tempusPoolConfig.yieldBearingToken,
    variableAPR: 0,
    tvl: null,
    fixedAPR: null,
    userBalanceUSD: null,
    userAvailableToDepositUSD: null,
    userBackingTokenBalance: null,
    userYieldBearingTokenBalance: null,
  })),
};
export const Context = React.createContext<ContextType>({
  data: defaultContextValue,
  setData: null,
});

export function getDataForPool(address: string, poolData: ContextPoolData[]): ContextPoolData {
  const result = poolData.find(data => data.address === address);
  if (!result) {
    throw new Error('Context - getDataForPool() - Failed to fetch data for pool!');
  }
  return result;
}
