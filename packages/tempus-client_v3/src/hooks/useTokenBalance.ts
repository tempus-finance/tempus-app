import { bind } from '@react-rxjs/core';
import { JsonRpcSigner } from '@ethersproject/providers';
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
import { signer$ } from './useSigner';
import { walletAddress$ } from './useWalletAddress';
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
  [chainPoolAddress: string]: TokenBalance;
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
const txnStream$ = combineLatest([walletAddress$, signer$, servicesLoaded$]).pipe(
  filter(([walletAddress, signer, servicesLoaded]) => Boolean(walletAddress) && Boolean(signer) && servicesLoaded),
  mergeMap<[string, JsonRpcSigner | null, boolean], Observable<TokenBalanceMap | null>>(([walletAddress, signer]) => {
    const tokenBalanceFetchMap = [...tokenBalanceDataMap.values()].map(tokenBalanceData => {
      try {
        const services = getDefinedServices(tokenBalanceData.chain);
        const erc20TokenService = services.ERC20TokenServiceGetter(
          tokenBalanceData.address,
          tokenBalanceData.chain,
          signer as JsonRpcSigner,
        );
        const subject$ = new BehaviorSubject<TokenBalance | null>(null);
        const transferListener = () => {
          fetchData(tokenBalanceData.chain, tokenBalanceData.address, walletAddress).subscribe(balance =>
            subject$.next({
              balance,
              address: tokenBalanceData.address,
              chain: tokenBalanceData.chain,
            }),
          );
        };

        // TODO: should we call offTransfer()? this stream will only run when wallet changes anyway
        erc20TokenService.onTransfer(walletAddress, null, transferListener);
        erc20TokenService.onTransfer(null, walletAddress, transferListener);

        return subject$.pipe(
          map(tokenBalance =>
            tokenBalance
              ? {
                  [`${tokenBalance.chain}-${tokenBalance.address}`]: {
                    balance: tokenBalance.balance,
                    address: tokenBalance.address,
                    chain: tokenBalance.chain,
                  },
                }
              : null,
          ),
        );
      } catch (error) {
        console.error(
          'useTokenBalances - cannot fetch token balance for ' +
            `${tokenBalanceData.address} on ${tokenBalanceData.chain} for $wallet ${walletAddress}`,
          error,
        );
        return of(null);
      }
    });

    return merge(...tokenBalanceFetchMap);
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
      map(tokenBalance =>
        tokenBalance
          ? {
              [`${chain}-${backingTokenAddress}`]: {
                balance: tokenBalance,
                address: backingTokenAddress,
                chain,
              },
            }
          : null,
      ),
    );
    const principalsTokenBalanceMap$ = principalsTokenBalance$.pipe(
      map(tokenBalance =>
        tokenBalance
          ? {
              [`${chain}-${principalsAddress}`]: {
                balance: tokenBalance,
                address: principalsAddress,
                chain,
              },
            }
          : null,
      ),
    );
    const yieldBearingTokenBalanceMap$ = yieldBearingTokenBalance$.pipe(
      map(tokenBalance =>
        tokenBalance
          ? {
              [`${chain}-${yieldBearingTokenAddress}`]: {
                balance: tokenBalance,
                address: yieldBearingTokenAddress,
                chain,
              },
            }
          : null,
      ),
    );
    const yieldsTokenBalanceMap$ = yieldsTokenBalance$.pipe(
      map(tokenBalance =>
        tokenBalance
          ? {
              [`${chain}-${yieldsAddress}`]: {
                balance: tokenBalance,
                address: yieldsAddress,
                chain,
              },
            }
          : null,
      ),
    );
    const ammTokenBalanceMap$ = ammTokenBalance$.pipe(
      map(tokenBalance =>
        tokenBalance
          ? {
              [`${chain}-${ammAddress}`]: {
                balance: tokenBalance,
                address: ammAddress,
                chain,
              },
            }
          : null,
      ),
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
const initStream$ = combineLatest([walletAddress$, selectedChain$, servicesLoaded$]).pipe(
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

      const balanceBalance$ = fetchData(tokenBalanceData.chain, tokenBalanceData.address, walletAddress);
      return balanceBalance$.pipe(
        map(tokenBalance =>
          tokenBalance
            ? {
                [`${tokenBalanceData.chain}-${tokenBalanceData.address}`]: {
                  balance: tokenBalance,
                  address: tokenBalanceData.address,
                  chain: tokenBalanceData.chain,
                },
              }
            : null,
        ),
      );
    });

    return merge(...tokenBalanceFetchMap);
  }),
);

// merge all stream$ into one if there are multiple
const stream$ = merge(initStream$, txnStream$, eventStream$).pipe(
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
