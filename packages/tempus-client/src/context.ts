import React, { Dispatch, SetStateAction } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';

interface ContextDataType {
  userWalletAddress: string;
  userWalletSigner: JsonRpcSigner | null;
}

interface ContextType {
  data: ContextDataType;
  setData: Dispatch<SetStateAction<ContextDataType>> | null;
}

export const defaultContextValue: ContextDataType = {
  userWalletAddress: '',
  userWalletSigner: null,
};
export const Context = React.createContext<ContextType>({
  data: defaultContextValue,
  setData: null,
});
