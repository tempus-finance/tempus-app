import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { useCallback, useEffect, useMemo } from 'react';
import { useConnectWallet } from '@web3-onboard/react';
import { Chain, Decimal } from 'tempus-core-services';
// TODO - Replace by TokenBalance service (needs to be created)
import { getERC20TokenService } from 'tempus-core-services/dist/services';
import { getConfigManager } from '../config/getConfigManager';

// Token ID is chainName+tokenAddress
type WalletBalancesMap = { [tokenId: string]: Decimal | undefined };

const [walletBalances$, setWalletBalances] = createSignal<WalletBalancesMap>();

const state$ = state(walletBalances$, {});

export function useWalletBalances(): [WalletBalancesMap] {
  const walletBalances = useStateObservable(state$);

  const [{ wallet }] = useConnectWallet();

  // TODO - Store wallet address in react-rxjs hook and use it here
  const walletAddress = useMemo(() => {
    if (!wallet) {
      return null;
    }
    return wallet.accounts[0].address;
  }, [wallet]);

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

      const tokenService = getERC20TokenService(tokenAddress, tokenChain, getConfigManager().getChainConfig);

      // TODO - Create TokenBalance service that will convert fetched balance into a 18 decimal BigNumber
      const balance = await tokenService.balanceOf(walletAddress);

      setWalletBalances({
        ...state$.getValue(),
        [tokenId]: new Decimal(balance),
      });
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
