import React, { Dispatch, SetStateAction } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Chain } from '../interfaces/Chain';

interface WalletContextData {
  userWalletConnected: boolean | null;
  userWalletAddress: string;
  userWalletSigner: JsonRpcSigner | null;
  userWalletChain: Chain | null;
}

interface WalletContextActions {
  setWalletData: Dispatch<SetStateAction<WalletContextData>> | null;
}

interface WalletContextType extends WalletContextActions, WalletContextData {}

export const defaultWalletContextValue: WalletContextData = {
  userWalletConnected: null,
  userWalletAddress: '',
  userWalletSigner: null,
  userWalletChain: null,
};

export const WalletContext = React.createContext<WalletContextType>({
  ...defaultWalletContextValue,
  setWalletData: null,
});
