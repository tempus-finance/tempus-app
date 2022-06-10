import { bind } from '@react-rxjs/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounce,
  distinctUntilChanged,
  filter,
  from,
  interval,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  scan,
  startWith,
  Subscription,
  tap,
} from 'rxjs';
import { getServices, Decimal, Chain, Ticker, TempusPool, ONE } from 'tempus-core-services';
import { POLLING_INTERVAL_IN_MS, DEBOUNCE_IN_MS } from '../constants';
import { poolList$ } from './usePoolList';
import { servicesLoaded$ } from './useServicesLoaded';
import { appEvent$ } from './useAppEvent';

interface TokenInfo {
  chain: Chain;
  token: Ticker;
  address: string;
  hasConversionRate?: boolean; // for yieldBearingToken only
  poolAddress?: string; // for yieldBearingToken only
}

interface TokenInfoMap {
  [chainTokenAddress: string]: TokenInfo;
}

export interface TokenRateMap {
  [chainTokenAddress: string]: Decimal | null;
}

const DEFAULT_VALUE: TokenRateMap = {};

const intervalBeat$: Observable<number> = interval(POLLING_INTERVAL_IN_MS).pipe(startWith(0));

const rawTokenRates$ = new BehaviorSubject<TokenRateMap>(DEFAULT_VALUE);
export const tokenRates$ = rawTokenRates$.pipe(
  // TODO: we can set the throttle for comparison as TVL if necessary
  distinctUntilChanged(
    (previous, current) =>
      Object.keys(current).length === Object.keys(previous).length &&
      Object.keys(current).every(chainTokenAddress => {
        if (current[chainTokenAddress] === null) {
          return previous[chainTokenAddress] === null;
        }
        if (previous[chainTokenAddress] === null) {
          return false;
        }
        return (current[chainTokenAddress] as Decimal).equals(previous[chainTokenAddress] as Decimal);
      }),
  ),
);

const tokenInfoMap$ = poolList$.pipe(
  map(tempusPools =>
    tempusPools.reduce(
      (obj, { chain, address, backingToken, backingTokenAddress, yieldBearingTokenAddress }) => ({
        ...obj,
        [`${chain}-${backingTokenAddress}`]: {
          chain,
          token: backingToken,
          address: backingTokenAddress,
        },
        [`${chain}-${yieldBearingTokenAddress}`]: {
          chain,
          token: backingToken,
          address: yieldBearingTokenAddress,
          hasConversionRate: true,
          poolAddress: address,
        },
      }),
      {} as TokenInfoMap,
    ),
  ),
);

const getDefinedServices = (chain: Chain) => {
  const services = getServices(chain);
  if (!services) {
    throw new Error(`Cannot get service map for ${chain}`);
  }
  return services;
};

const getConversionRate = ({ chain, address }: TempusPool): Observable<Decimal> => {
  const services = getDefinedServices(chain);
  const interestRate$ = from(services.TempusPoolService.currentInterestRate(address));
  return interestRate$.pipe(
    mergeMap(interestRate => from(services.TempusPoolService.numAssetsPerYieldToken(address, ONE, interestRate))),
  );
};

const fetchData = (tokenInfo: TokenInfo): Observable<TokenRateMap> => {
  const { chain, token, address, hasConversionRate, poolAddress } = tokenInfo;

  try {
    // TODO: conceptually chain+ticker is not unique, it should accept chain+address instead
    //       but currently chainlink and gecko API doesnt support that
    const tokenRate$ = getDefinedServices(chain).StatisticsService.getRate(chain, token);
    const conversionRate$ = hasConversionRate
      ? getConversionRate({ chain, address: poolAddress } as TempusPool)
      : of(ONE);

    return combineLatest([tokenRate$, conversionRate$]).pipe(
      map<[Decimal | null, Decimal], TokenRateMap>(([tokenRate, conversionRate]) =>
        tokenRate
          ? {
              [`${chain}-${address}`]: tokenRate?.mul(conversionRate),
            }
          : {},
      ),
      catchError(error => {
        console.error(`useTokenRates - Fail to get token rate for ${token} on ${chain}`, error);
        return of(DEFAULT_VALUE);
      }),
    );
  } catch (error) {
    console.error(`useTokenRates - Fail to get token rate for ${token} on ${chain}`, error);
    return of(DEFAULT_VALUE);
  }
};

// stream$ for periodic polling to fetch data
const periodicStream$: Observable<TokenRateMap> = combineLatest([tokenInfoMap$, servicesLoaded$, intervalBeat$]).pipe(
  filter(([, servicesLoaded]) => servicesLoaded),
  mergeMap<[TokenInfoMap, boolean, number], Observable<TokenRateMap>>(([tokenInfoMap]) => {
    const tokenRateMaps = Object.values(tokenInfoMap).map(fetchData);

    return merge(...tokenRateMaps);
  }),
);

// stream$ for listening to Tempus event to fetch specific pool data
const eventStream$ = combineLatest([appEvent$, servicesLoaded$]).pipe(
  filter(([, servicesLoaded]) => servicesLoaded),
  mergeMap<[{ tempusPool: TempusPool }, boolean], Observable<TokenRateMap>>(([{ tempusPool }]) => {
    const backingTokenInfo = {
      chain: tempusPool.chain,
      token: tempusPool.backingToken,
      address: tempusPool.backingTokenAddress,
    };
    const yieldBearingTokenInfo = {
      chain: tempusPool.chain,
      token: tempusPool.backingToken,
      address: tempusPool.backingTokenAddress,
      hasConversionRate: true,
      poolAddress: tempusPool.address,
    };

    const backingTokenRate$ = fetchData(backingTokenInfo);
    const yieldBearingTokenRate$ = fetchData(yieldBearingTokenInfo);

    return merge(backingTokenRate$, yieldBearingTokenRate$);
  }),
);

// merge all stream$ into one
const stream$ = merge(periodicStream$, eventStream$).pipe(
  scan(
    (allRates, tokenRates) => ({
      ...allRates,
      ...tokenRates,
    }),
    {} as TokenRateMap,
  ),
  debounce<TokenRateMap>(() => interval(DEBOUNCE_IN_MS)),
  tap(allRates => rawTokenRates$.next(allRates)),
);

export const [useTokenRates] = bind(tokenRates$, DEFAULT_VALUE);

let subscription: Subscription;

export const subscribeTakenRates = (): void => {
  unsubscribeTakenRates();
  subscription = stream$.subscribe();
};
export const unsubscribeTakenRates = (): void => subscription?.unsubscribe?.();
export const resetTakenRates = (): void => rawTokenRates$.next(DEFAULT_VALUE);
