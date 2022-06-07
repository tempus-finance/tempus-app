import { bind } from '@react-rxjs/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounce,
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
import {
  getServices,
  Decimal,
  StatisticsService,
  Chain,
  Ticker,
  TempusPoolService,
  TempusPool,
  ONE,
} from 'tempus-core-services';
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
  [chainTokenAddressString: string]: TokenInfo;
}

export interface TokenRateMap {
  [chainTokenAddressString: string]: Decimal | null;
}

const DEFAULT_VALUE: TokenRateMap = {};

const intervalBeat$: Observable<number> = interval(POLLING_INTERVAL_IN_MS).pipe(startWith(0));

export const tokenRates$ = new BehaviorSubject<TokenRateMap>(DEFAULT_VALUE);

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

const getConversionRate = ({ chain, address }: TempusPool): Observable<Decimal | null> => {
  const tempusPoolService = getServices(chain)?.TempusPoolService as TempusPoolService;
  const interestRate$ = from(tempusPoolService.currentInterestRate(address));
  return interestRate$.pipe(
    mergeMap(interestRate => from(tempusPoolService.numAssetsPerYieldToken(address, ONE, interestRate))),
    catchError(error => {
      console.error('useTokenRates - TempusPoolService.numAssetsPerYieldToken', error);
      return of(null);
    }),
  );
};

const fetchData = (tokenInfo: TokenInfo): Observable<TokenRateMap> => {
  const { chain, token, address, hasConversionRate, poolAddress } = tokenInfo;

  // TODO: conceptually chain+ticker is not unique, it should accept chain+address instead
  //       but currently chainlink and gecko API doesnt support that
  const tokenRate$ = (getServices(chain)?.StatisticsService as StatisticsService).getRate(chain, token);
  const conversionRate$ = hasConversionRate
    ? getConversionRate({ chain, address: poolAddress } as TempusPool)
    : of(ONE);
  return combineLatest([tokenRate$, conversionRate$]).pipe(
    map<[Decimal | null, Decimal | null], TokenRateMap>(([tokenRate, conversionRate]) =>
      tokenRate && conversionRate
        ? {
            [`${chain}-${address}`]: tokenRate?.mul(conversionRate),
          }
        : {},
    ),
  );
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
  catchError(error => {
    console.error('useTokenRates - StatisticsService.getRate', error);
    return of(DEFAULT_VALUE);
  }),
  tap(allRates => tokenRates$.next(allRates)),
);

export const [useTokenRates] = bind(tokenRates$, DEFAULT_VALUE);

let subscription: Subscription = stream$.subscribe();

export const subscribe = (): void => {
  unsubscribe();
  subscription = stream$.subscribe();
};
export const unsubscribe = (): void => subscription?.unsubscribe?.();
export const reset = (): void => tokenRates$.next(DEFAULT_VALUE);
