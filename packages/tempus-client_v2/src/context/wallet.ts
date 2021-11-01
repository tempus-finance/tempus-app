import React, { Dispatch, SetStateAction } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';

interface ContextData {
  userWalletConnected: boolean | null;
  userWalletAddress: string;
  userWalletSigner: JsonRpcSigner | null;
}

interface ContextActions {
  setWalletData: Dispatch<SetStateAction<ContextData>> | null;
}

interface ContextType extends ContextActions, ContextData {}

export const defaultWalletContextValue: ContextData = {
  userWalletConnected: null,
  userWalletAddress: '',
  userWalletSigner: null,
};

export const WalletContext = React.createContext<ContextType>({
  ...defaultWalletContextValue,
  setWalletData: null,
});
