import React, { Dispatch, SetStateAction } from 'react';
import { BigNumber } from 'ethers';

interface ContextData {
  eth: BigNumber | null;
}

interface ContextActions {
  setETHBalance: Dispatch<SetStateAction<ContextData>> | null;
}

interface ContextType extends ContextActions, ContextData {}

export const defaultETHBalanceContextValue: ContextData = {
  eth: null,
};

export const ETHBalanceContext = React.createContext<ContextType>({
  ...defaultETHBalanceContextValue,
  setETHBalance: null,
});
