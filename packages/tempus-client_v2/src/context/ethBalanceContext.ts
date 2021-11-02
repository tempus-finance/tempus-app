import React, { Dispatch, SetStateAction } from 'react';
import { BigNumber } from 'ethers';

interface ETHBalanceContextData {
  eth: BigNumber | null;
}

interface ETHBalanceContextActions {
  setETHBalance: Dispatch<SetStateAction<ETHBalanceContextData>> | null;
}

interface ETHBalanceContextType extends ETHBalanceContextActions, ETHBalanceContextData {}

export const defaultETHBalanceContextValue: ETHBalanceContextData = {
  eth: null,
};

export const ETHBalanceContext = React.createContext<ETHBalanceContextType>({
  ...defaultETHBalanceContextValue,
  setETHBalance: null,
});
