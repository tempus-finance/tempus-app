import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { useCallback, useEffect } from 'react';
import { Chain, Decimal, getServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { useWalletAddress } from './useWalletAddress';

// Token ID is chainName+tokenAddress
type WalletBalancesMap = { [tokenId: string]: Decimal | undefined };

const [walletBalances$, setWalletBalances] = createSignal<WalletBalancesMap>();

const state$ = state(walletBalances$, {});

export function useWalletBalances(): [WalletBalancesMap] {
  const walletBalances = useStateObservable(state$);

  const [walletAddress] = useWalletAddress();

  /**
   * Fetch balance for specified token and update state observable
   */
  const fetchTokenBalance = useCallback(
    async (tokenId: string) => {
      if (!walletAddress) {
        return;
      }

      const tokenChain = tokenId.split('-')[0] as Chain;
      const tokenAddress = tokenId.split('-')[1];

      const services = getServices(tokenChain);
      if (services) {
        const balance = await services?.WalletBalanceService.getTokenBalance(tokenAddress, walletAddress);

        setWalletBalances({
          ...state$.getValue(),
          [tokenId]: balance,
        });
      }
    },
    [walletAddress],
  );

  /**
   * Fetch all token balances on mount that are not yet loaded.
   */
  useEffect(() => {
    const tokenMap = state$.getValue();

    // TODO - Fetch native token balances for each supported network as well

    const tempusPools = getConfigManager().getPoolList();
    tempusPools.forEach(pool => {
      const poolChain = pool.chain;

      // Fetch pool backing token balance
      const backingTokenId = `${poolChain}-${pool.backingTokenAddress}`;
      if (!tokenMap[backingTokenId]) {
        fetchTokenBalance(backingTokenId);
      }

      // Fetch pool yield bearing token balance
      const yieldBearingTokenId = `${poolChain}-${pool.yieldBearingTokenAddress}`;
      if (!tokenMap[yieldBearingTokenId]) {
        fetchTokenBalance(yieldBearingTokenId);
      }

      // Fetch pool capital token balance
      const capitalTokenId = `${poolChain}-${pool.principalsAddress}`;
      if (!tokenMap[capitalTokenId]) {
        fetchTokenBalance(capitalTokenId);
      }

      // Fetch pool yield token balance
      const yieldTokenId = `${poolChain}-${pool.yieldsAddress}`;
      if (!tokenMap[yieldTokenId]) {
        fetchTokenBalance(yieldTokenId);
      }

      // Fetch LP token balance
      const lpTokenId = `${poolChain}-${pool.ammAddress}`;
      if (!tokenMap[lpTokenId]) {
        fetchTokenBalance(lpTokenId);
      }
    });
  }, [fetchTokenBalance]);

  return [walletBalances];
}
