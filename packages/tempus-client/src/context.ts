import React, { Dispatch, SetStateAction } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

interface ContextDataType {
  userWalletAddress: string;
  userWalletSigner: JsonRpcSigner | null;
  userPrincipalsBalance: BigNumber | null;
  userYieldsBalance: BigNumber | null;
  userLPBalance: BigNumber | null;
  pendingTransactions: string[];
}

interface ContextType {
  data: ContextDataType;
  setData: Dispatch<SetStateAction<ContextDataType>> | null;
}

export const defaultContextValue: ContextDataType = {
  userWalletAddress: '',
  userWalletSigner: null,
  userPrincipalsBalance: null,
  userYieldsBalance: null,
  userLPBalance: null,
  pendingTransactions: [],
};
export const Context = React.createContext<ContextType>({
  data: defaultContextValue,
  setData: null,
});
