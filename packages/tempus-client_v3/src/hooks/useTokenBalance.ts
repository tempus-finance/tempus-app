import { DefaultedStateObservable, state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { Observable } from 'rxjs';
import { useCallback, useEffect } from 'react';
import { Chain, Decimal, getServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { useWalletAddress } from './useWalletAddress';

// Token ID is chainName+tokenAddress
type TokenData = {
  signal: {
    observable: Observable<Decimal>;
    setter: (payload: Decimal) => void;
  };
  state: DefaultedStateObservable<Decimal | null>;
};

const tokenDataMap = new Map<string, TokenData>();

// Cannot use top-level await (using then as a fallback)
getConfigManager()
  .getConfigAsync()
  .then(() => {
    const tokenList = getConfigManager().getTokenList();
    tokenList.forEach(token => {
      const [tokenBalance$, setTokenBalance] = createSignal<Decimal>();

      tokenDataMap.set(token, {
        signal: {
          observable: tokenBalance$,
          setter: setTokenBalance,
        },
        state: state(tokenBalance$, null),
      });
    });
  });

/**
 * React hook that fetches and returns balance of requested token
 * @param tokenId Token we want to get balance for
 * @returns Returns balance of the token
 */
export function useTokenBalance(tokenId: string): [Decimal | null] {
  const tokenData = tokenDataMap.get(tokenId);

  // If token data is not yet initialized - use empty observable while waiting for token data to initialize
  const tokenBalance = useStateObservable(tokenData ? tokenData.state : state(createSignal<Decimal>()[0], null));

  const [walletAddress] = useWalletAddress();

  const fetchBalance = useCallback(async () => {
    if (!walletAddress || !tokenData) {
      return;
    }

    const tokenChain = tokenId.split('-')[0] as Chain;
    const tokenAddress = tokenId.split('-')[1];

    const services = getServices(tokenChain);
    if (services) {
      const balance = await services.WalletBalanceService.getTokenBalance(tokenAddress, walletAddress);

      tokenData.signal.setter(balance);
    }
  }, [tokenData, tokenId, walletAddress]);

  /**
   * Fetch balance on mount
   */
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return [tokenBalance];
}
