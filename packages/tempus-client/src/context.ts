import React, { Dispatch, SetStateAction } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { DashboardRowChild, Ticker } from './interfaces';

export interface ContextPoolData {
  address: string;
  backingTokenTicker: Ticker;
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
  poolData: [
    {
      address: '0x1c5AbE736C6CCb743Bc933241AB462e6b38c6EA4',
      backingTokenTicker: 'ETH',
      variableAPR: 0,
    },
    {
      address: '0x0749982cAD68506009C7f0341a9A7fD6107A40C2',
      backingTokenTicker: 'ETH',
      variableAPR: 0,
    },
    {
      address: '0x68Dbc29bf19Ce959859B828BFFAB4082Af8e38C5',
      backingTokenTicker: 'ETH',
      variableAPR: 0,
    },
  ],
};
export const Context = React.createContext<ContextType>({
  data: defaultContextValue,
  setData: null,
});
