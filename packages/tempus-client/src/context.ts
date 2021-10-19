import React, { Dispatch, SetStateAction } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { DashboardRowChild } from './interfaces';

interface ContextPoolData {
  address: string;
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
  poolData: [],
};
export const Context = React.createContext<ContextType>({
  data: defaultContextValue,
  setData: null,
});
