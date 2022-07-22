import { bind, state, useStateObservable } from '@react-rxjs/core';
import {
  BehaviorSubject,
  map,
  combineLatest,
  of,
  merge,
  mergeMap,
  Subscription,
  tap,
  filter,
  Observable,
  catchError,
  debounce,
  interval,
  scan,
  retry,
} from 'rxjs';
import { Chain, getDefinedServices, TempusPool, Ticker } from 'tempus-core-services';
import { servicesLoaded$ } from './useServicesLoaded';
import { poolList$ } from './usePoolList';
import { DEBOUNCE_IN_MS } from '../constants';

interface TokenSymbolMap {
  [chainTokenAddress: string]: Ticker;
}

const DEFAULT_VALUE: TokenSymbolMap = {};
const tokenSymbols$ = new BehaviorSubject<TokenSymbolMap>(DEFAULT_VALUE);
const state$ = state(tokenSymbols$, DEFAULT_VALUE);

const fetchData = (chain: Chain, tokenAddress: string): Observable<TokenSymbolMap | null> => {
  try {
    const erc20Service = getDefinedServices(chain).ERC20TokenServiceGetter(tokenAddress, chain);
    return of(erc20Service).pipe(
      mergeMap(service => service.symbol()),
      map(
        tokenSymbol =>
          ({
            [`${chain}-${tokenAddress}`]: tokenSymbol,
          } as TokenSymbolMap),
      ),
      retry(3),
      catchError(error => {
        console.error(`useTokenSymbols - cannot fetch token symbol for ${tokenAddress} on ${chain}`, error);
        return of(null);
      }),
    );
  } catch (error) {
    console.error(`useTokenSymbols - cannot fetch token symbol for ${tokenAddress} on ${chain}`, error);
    return of(null);
  }
};

// stream$ for initial polling to fetch data
const initialStream$ = combineLatest([poolList$, servicesLoaded$]).pipe(
  filter(([, servicesLoaded]) => servicesLoaded),
  mergeMap<[TempusPool[], boolean], Observable<TokenSymbolMap | null>>(([tempusPools]) => {
    const tokenSymbolMap: { [chainTokenAddress: string]: Observable<TokenSymbolMap | null> } = {};
    tempusPools.forEach(tempusPool => {
      const {
        chain,
        backingToken,
        backingTokenAddress,
        yieldBearingToken,
        yieldBearingTokenAddress,
        ammAddress,
        principalsAddress,
        yieldsAddress,
      } = tempusPool;

      if (!tokenSymbolMap[`${chain}-${backingTokenAddress}`]) {
        tokenSymbolMap[`${chain}-${backingTokenAddress}`] = of({
          [`${chain}-${backingTokenAddress}`]: backingToken,
        });
      }

      if (!tokenSymbolMap[`${chain}-${yieldBearingTokenAddress}`]) {
        tokenSymbolMap[`${chain}-${yieldBearingTokenAddress}`] = of({
          [`${chain}-${yieldBearingTokenAddress}`]: yieldBearingToken,
        });
      }

      if (!tokenSymbolMap[`${chain}-${ammAddress}`]) {
        tokenSymbolMap[`${chain}-${ammAddress}`] = fetchData(chain, ammAddress);
      }

      if (!tokenSymbolMap[`${chain}-${principalsAddress}`]) {
        tokenSymbolMap[`${chain}-${principalsAddress}`] = fetchData(chain, principalsAddress);
      }

      if (!tokenSymbolMap[`${chain}-${yieldsAddress}`]) {
        tokenSymbolMap[`${chain}-${yieldsAddress}`] = fetchData(chain, yieldsAddress);
      }
    });

    return merge(...Object.values(tokenSymbolMap));
  }),
);

// merge all stream$ into one
const stream$ = merge(initialStream$).pipe(
  scan(
    (allSymbols, poolSymbol) => ({
      ...allSymbols,
      ...poolSymbol,
    }),
    {} as TokenSymbolMap,
  ),
  debounce<TokenSymbolMap>(() => interval(DEBOUNCE_IN_MS)),
  tap(poolSymbols => tokenSymbols$.next(poolSymbols)),
);

export const [useTokenSymbols] = bind(tokenSymbols$, {});
export const useTokenSymbol = (chain: Chain, tokenAddress: string): string | null => {
  const tokenSymbols = useStateObservable(state$);
  return tokenSymbols[`${chain}-${tokenAddress}`] ?? null;
};

let subscription: Subscription;

export const subscribeTokenSymbols = (): void => {
  unsubscribeTokenSymbols();
  subscription = stream$.subscribe();
};
export const unsubscribeTokenSymbols = (): void => subscription?.unsubscribe?.();
export const resetTokenSymbols = (): void => tokenSymbols$.next(DEFAULT_VALUE);
