import { bind } from '@react-rxjs/core';
import {
  BehaviorSubject,
  map,
  combineLatest,
  from,
  of,
  merge,
  mergeMap,
  Subscription,
  tap,
  filter,
  catchError,
} from 'rxjs';
import { Chain, Decimal, getServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { selectedChain$ } from './useSelectedChain';
import { servicesLoaded$ } from './useServicesLoaded';
import { walletAddress$ } from './useWalletAddress';

// Improves readability of the code
type TokenChainAddressId = string;

interface TokenBalanceData {
  subject$: BehaviorSubject<{
    balance: Decimal | null;
    chain: Chain;
    address: string;
  }>;
  address: string;
  chain: Chain;
}

// Each token will have a separate BehaviorSubject, and this map will store them with some additional token data
export const tokenBalanceDataMap = new Map<TokenChainAddressId, TokenBalanceData>();

const tokenList = getConfigManager().getTokenList();
tokenList.forEach(token => {
  const tokenChainAddressId = `${token.chain}-${token.address}`;

  tokenBalanceDataMap.set(tokenChainAddressId, {
    subject$: new BehaviorSubject<{
      balance: Decimal | null;
      address: string;
      chain: Chain;
    }>({
      balance: null,
      address: token.address,
      chain: token.chain,
    }),
    address: token.address,
    chain: token.chain,
  });
});

// Stream that goes over all tokens and fetches their balance, this happens only when wallet address changes
const stream$ = combineLatest([walletAddress$, selectedChain$, servicesLoaded$]).pipe(
  filter(
    ([walletAddress, selectedChain, servicesLoaded]) =>
      Boolean(walletAddress) && Boolean(selectedChain) && servicesLoaded,
  ),
  mergeMap(([walletAddress, selectedChain]) => {
    const tokenBalanceFetchMap = [...tokenBalanceDataMap.values()].map(tokenBalanceData => {
      // Only fetch token balances for currently selected chain
      if (selectedChain && selectedChain !== tokenBalanceData.chain) {
        return of(null);
      }

      // If token balance was previously fetched, skip fetching it - token balance updates will happen in different
      // stream, this stream is only for initial token balance fetches
      const balanceData = tokenBalanceData.subject$.getValue();
      if (balanceData && balanceData.balance) {
        return of(null);
      }

      const services = getServices(tokenBalanceData.chain);
      if (!services) {
        throw new Error('useWalletBalances - stream$ - Failed to get services');
      }
      const balanceFetch$ = from(
        services.WalletBalanceService.getTokenBalance(tokenBalanceData.address, walletAddress),
      );

      return balanceFetch$.pipe(
        map(tokenBalance => ({
          [`${tokenBalanceData.chain}-${tokenBalanceData.address}`]: {
            balance: tokenBalance,
            address: tokenBalanceData.address,
            chain: tokenBalanceData.chain,
          },
        })),
      );
    });

    return merge(...tokenBalanceFetchMap);
  }),
  tap(tokenDataMap => {
    if (tokenDataMap === null) {
      return;
    }

    Object.keys(tokenDataMap).forEach(key => {
      const tokenData = tokenDataMap[key];
      if (tokenData.balance) {
        const tokenBalanceData = tokenBalanceDataMap.get(`${tokenData.chain}-${tokenData.address}`);
        if (tokenBalanceData) {
          tokenBalanceData.subject$.next({
            balance: tokenData.balance,
            chain: tokenBalanceData.chain,
            address: tokenBalanceData.address,
          });
        }
      }
    });
  }),
  catchError(error => {
    console.error('useTokenBalances - $stream - ', error);
    return of({});
  }),
);

export const [useTokenBalance] = bind((tokenAddress: string, tokenChain: Chain | null) => {
  if (!tokenChain) {
    return of(null);
  }

  const tokenBalanceData = tokenBalanceDataMap.get(`${tokenChain}-${tokenAddress}`);
  if (tokenBalanceData) {
    return tokenBalanceData.subject$;
  }
  return of(null);
}, null);

let streamSubscription: Subscription = stream$.subscribe();

const tokenBalanceMap$ = combineLatest(
  [...tokenBalanceDataMap.values()].map(tokenBalanceData => tokenBalanceData.subject$),
).pipe(
  map(tokenBalancesData => {
    let tokenBalanceMap: { [id: TokenChainAddressId]: Decimal | null } = {};

    tokenBalancesData.forEach(tokenBalanceData => {
      tokenBalanceMap = {
        ...tokenBalanceMap,
        [`${tokenBalanceData.chain}-${tokenBalanceData.address}`]: tokenBalanceData.balance,
      };
    });

    return tokenBalanceMap;
  }),
);

export const [useTokenBalances] = bind(tokenBalanceMap$, {});

export const subscribe = (): void => {
  unsubscribe();
  streamSubscription = stream$.subscribe();
};
export const unsubscribe = (): void => {
  streamSubscription.unsubscribe();
};
export const reset = (): void => {
  tokenBalanceDataMap.forEach(tokenBalanceData =>
    tokenBalanceData.subject$.next({
      balance: null,
      chain: tokenBalanceData.chain,
      address: tokenBalanceData.address,
    }),
  );
};
