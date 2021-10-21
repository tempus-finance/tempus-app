import React, { Dispatch, SetStateAction } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { DashboardRowChild, Ticker } from './interfaces';
import getConfig from './utils/get-config';

export interface ContextPoolData {
  address: string;
  backingTokenTicker: Ticker;
  fixedAPR: number | null;
  variableAPR: number;
}

interface ContextDataType {
  userWalletConnected: boolean | null;
  userWalletAddress: string;
  userWalletSigner: JsonRpcSigner | null;
  userBackingTokenBalance: BigNumber | null;
  userYieldBearingTokenBalance: BigNumber | null;
  userPrincipalsBalance: BigNumber | null;
  userYieldsBalance: BigNumber | null;
  userLPBalance: BigNumber | null;
  pendingTransactions: string[];
  selectedRow: DashboardRowChild | null;
  userCurrentPoolPresentValue: BigNumber | null;
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
  userBackingTokenBalance: null,
  userYieldBearingTokenBalance: null,
  userPrincipalsBalance: null,
  userYieldsBalance: null,
  userLPBalance: null,
  pendingTransactions: [],
  selectedRow: null,
  userCurrentPoolPresentValue: null,
  userEthBalance: null,
  poolData: getConfig().tempusPools.map(tempusPoolConfig => ({
    address: tempusPoolConfig.address,
    backingTokenTicker: tempusPoolConfig.backingToken,
    variableAPR: 0,
    fixedAPR: null,
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
