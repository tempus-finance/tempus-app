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
  Observable,
  withLatestFrom,
  catchError,
} from 'rxjs';
import { Chain, Decimal, getDefinedServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { selectedChain$ } from './useSelectedChain';
import { servicesLoaded$ } from './useServicesLoaded';
import { walletAddress$ } from './useWalletAddress';
import { transferStream$, TrasnferTransaction } from './useTransactions';
import { AppEvent, appEvent$ } from './useAppEvent';

// Improves readability of the code
type TokenChainAddressId = string;

export interface TokenBalance {
  balance: Decimal | null;
  chain: Chain;
  address: string;
}

interface TokenBalanceData {
  subject$: BehaviorSubject<TokenBalance>;
  address: string;
  chain: Chain;
}

interface TokenBalanceMap {
  [chainTokenAddress: string]: TokenBalance;
}

// Each token will have a separate BehaviorSubject, and this map will store them with some additional token data
export const tokenBalanceDataMap = new Map<TokenChainAddressId, TokenBalanceData>();

const tokenList = getConfigManager().getTokenList();
tokenList.forEach(token => {
  const tokenChainAddressId = `${token.chain}-${token.address}`;

  tokenBalanceDataMap.set(tokenChainAddressId, {
    subject$: new BehaviorSubject<TokenBalance>({
      balance: null,
      address: token.address,
      chain: token.chain,
    }),
    address: token.address,
    chain: token.chain,
  });
});

const fetchData = (chain: Chain, tokenAddress: string, walletAddress: string): Observable<Decimal | null> => {
  try {
    const services = getDefinedServices(chain);
    return from(services.WalletBalanceService.getTokenBalance(tokenAddress, walletAddress)).pipe(
      catchError(error => {
        console.error(
          `useTokenBalances - cannot fetch token balance for ${tokenAddress} on ${chain} for $wallet ${walletAddress}`,
          error,
        );
        return of(null);
      }),
    );
  } catch (error) {
    console.error(
      `useTokenBalances - cannot fetch token balance for ${tokenAddress} on ${chain} for $wallet ${walletAddress}`,
      error,
    );
    return of(null);
  }
};

// stream for listening chain events
const onChainStream$ = transferStream$.pipe(
  filter(transction => Boolean(transction)),
  mergeMap<TrasnferTransaction | null, Observable<TokenBalanceMap | null>>(transaction => {
    const { walletAddress, token } = transaction as TrasnferTransaction;
    const { chain, address: tokenAddress } = token;

    return fetchData(chain, tokenAddress, walletAddress).pipe(
      filter(balance => Boolean(balance)),
      map(balance => ({
        [`${chain}-${tokenAddress}`]: {
          balance,
          address: tokenAddress,
          chain,
        },
      })),
    );
  }),
);

// stream$ for listening to Tempus event to fetch specific pool data
const eventStream$ = appEvent$.pipe(
  withLatestFrom(walletAddress$, servicesLoaded$),
  filter(([, walletAddress, servicesLoaded]) => Boolean(walletAddress) && servicesLoaded),
  mergeMap<[AppEvent, string, boolean], Observable<TokenBalanceMap | null>>(([{ tempusPool }, walletAddress]) => {
    const { chain, backingTokenAddress, principalsAddress, yieldBearingTokenAddress, yieldsAddress, ammAddress } =
      tempusPool;

    const backingTokenBalance$ = fetchData(chain, backingTokenAddress, walletAddress);
    const principalsTokenBalance$ = fetchData(chain, principalsAddress, walletAddress);
    const yieldBearingTokenBalance$ = fetchData(chain, yieldBearingTokenAddress, walletAddress);
    const yieldsTokenBalance$ = fetchData(chain, yieldsAddress, walletAddress);
    const ammTokenBalance$ = fetchData(chain, ammAddress, walletAddress);

    const backingTokenBalanceMap$ = backingTokenBalance$.pipe(
      filter(balance => Boolean(balance)),
      map(balance => ({
        [`${chain}-${backingTokenAddress}`]: {
          balance,
          address: backingTokenAddress,
          chain,
        },
      })),
    );
    const principalsTokenBalanceMap$ = principalsTokenBalance$.pipe(
      filter(balance => Boolean(balance)),
      map(balance => ({
        [`${chain}-${principalsAddress}`]: {
          balance,
          address: principalsAddress,
          chain,
        },
      })),
    );
    const yieldBearingTokenBalanceMap$ = yieldBearingTokenBalance$.pipe(
      filter(balance => Boolean(balance)),
      map(balance => ({
        [`${chain}-${yieldBearingTokenAddress}`]: {
          balance,
          address: yieldBearingTokenAddress,
          chain,
        },
      })),
    );
    const yieldsTokenBalanceMap$ = yieldsTokenBalance$.pipe(
      filter(balance => Boolean(balance)),
      map(balance => ({
        [`${chain}-${yieldsAddress}`]: {
          balance,
          address: yieldsAddress,
          chain,
        },
      })),
    );
    const ammTokenBalanceMap$ = ammTokenBalance$.pipe(
      filter(balance => Boolean(balance)),
      map(balance => ({
        [`${chain}-${ammAddress}`]: {
          balance,
          address: ammAddress,
          chain,
        },
      })),
    );

    return merge(
      backingTokenBalanceMap$,
      principalsTokenBalanceMap$,
      yieldBearingTokenBalanceMap$,
      yieldsTokenBalanceMap$,
      ammTokenBalanceMap$,
    );
  }),
);

// Stream that goes over all tokens and fetches their balance, this happens only when wallet address changes
const walletStream$ = combineLatest([walletAddress$, selectedChain$, servicesLoaded$]).pipe(
  filter(
    ([walletAddress, selectedChain, servicesLoaded]) =>
      Boolean(walletAddress) && Boolean(selectedChain) && servicesLoaded,
  ),
  mergeMap<[string, Chain | null, boolean], Observable<TokenBalanceMap | null>>(([walletAddress, selectedChain]) => {
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

      return fetchData(tokenBalanceData.chain, tokenBalanceData.address, walletAddress).pipe(
        filter(balance => Boolean(balance)),
        map(balance => ({
          [`${tokenBalanceData.chain}-${tokenBalanceData.address}`]: {
            balance,
            address: tokenBalanceData.address,
            chain: tokenBalanceData.chain,
          },
        })),
      );
    });

    return merge(...tokenBalanceFetchMap);
  }),
);

// merge all stream$ into one if there are multiple
const stream$ = merge(walletStream$, onChainStream$, eventStream$).pipe(
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

export const tokenBalanceMap$ = combineLatest(
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

export const subscribeTokenBalance = (): void => {
  unsubscribeTokenBalance();
  streamSubscription = stream$.subscribe();
};
export const unsubscribeTokenBalance = (): void => {
  streamSubscription.unsubscribe();
};
export const resetTokenBalance = (): void => {
  tokenBalanceDataMap.forEach(tokenBalanceData =>
    tokenBalanceData.subject$.next({
      balance: null,
      chain: tokenBalanceData.chain,
      address: tokenBalanceData.address,
    }),
  );
};
