import getUserShareTokenBalanceProvider from './getUserShareTokenBalanceProvider';
import getUserBalanceProvider from './getBalanceProvider';
import getUserLPTokenBalanceProvider from './getUserLPTokenBalanceProvider';
import getUserYieldBearingTokenBalanceProvider from './getUserYieldBearingTokenBalanceProvider';
import getUserBackingTokenBalanceProvider from './getUserBackingTokenBalanceProvider';
import getAvailableToDepositProvider from './getAvailableToDepositProvider';

import { BalanceProviderParams } from './interfaces';

export const refreshBalances = (
  { chain, userWalletAddress, userWalletSigner }: BalanceProviderParams,
  selectedPoolAddress: string,
  txBlockNumber?: number,
) => {
  getUserShareTokenBalanceProvider({
    chain,
    userWalletAddress,
    userWalletSigner,
  }).fetchForPool(selectedPoolAddress, txBlockNumber);

  getUserBalanceProvider({
    chain,
    userWalletAddress,
    userWalletSigner,
  }).fetchForPool(selectedPoolAddress, txBlockNumber);

  getUserLPTokenBalanceProvider({
    chain,
    userWalletAddress,
    userWalletSigner,
  }).fetchForPool(selectedPoolAddress, txBlockNumber);

  getUserYieldBearingTokenBalanceProvider({
    chain,
    userWalletAddress,
    userWalletSigner,
  }).fetchForPool(selectedPoolAddress, txBlockNumber);

  getUserBackingTokenBalanceProvider({
    chain,
    userWalletAddress,
    userWalletSigner,
  }).fetchForPool(selectedPoolAddress, txBlockNumber);

  getAvailableToDepositProvider({
    chain,
    userWalletAddress,
    userWalletSigner,
  }).fetchForPool(selectedPoolAddress, txBlockNumber);
};
