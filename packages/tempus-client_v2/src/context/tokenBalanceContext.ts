import React, { Dispatch, SetStateAction } from 'react';
import { BigNumber } from 'ethers';

interface TokenBalanceContextData {
  tokenBalance: BigNumber | null;
}

interface TokenBalanceContextActions {
  setTokenBalance: Dispatch<SetStateAction<TokenBalanceContextData>> | null;
}

interface TokenBalanceContextType extends TokenBalanceContextActions, TokenBalanceContextData {}

export const defaultTokenBalanceContextValue: TokenBalanceContextData = {
  tokenBalance: null,
};

export const TokenBalanceContext = React.createContext<TokenBalanceContextType>({
  ...defaultTokenBalanceContextValue,
  setTokenBalance: null,
});
