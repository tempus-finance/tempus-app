import { bind } from '@react-rxjs/core';
import {
  BehaviorSubject,
  combineLatest,
  debounce,
  filter,
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
import { getServices, Decimal, ZERO, TempusPool, Chain } from 'tempus-core-services';
import { POLLING_INTERVAL_IN_MS, DEBOUNCE_IN_MS } from '../constants';
import { poolList$ } from './usePoolList';
import { servicesLoaded$ } from './useServicesLoaded';
import { appEvent$ } from './useAppEvent';

interface PoolTvlMap {
  [chainPoolAddress: string]: Decimal;
}

const DEFAULT_VALUE: PoolTvlMap = {};

const intervalBeat$: Observable<number> = interval(POLLING_INTERVAL_IN_MS).pipe(startWith(0));

export const poolTvls$ = new BehaviorSubject<PoolTvlMap>(DEFAULT_VALUE);

const getDefinedServices = (chain: Chain) => {
  const services = getServices(chain);
  if (!services) {
    throw new Error(`Cannot get service map for ${chain}`);
  }
  return services;
};

const fetchData = (tempusPool: TempusPool): Observable<PoolTvlMap> => {
  const { chain, address, backingToken } = tempusPool;

  try {
    const tvl$ = getDefinedServices(chain).StatisticsService.totalValueLockedUSD(chain, address, backingToken);
    return tvl$.pipe(
      map(
        tvl =>
          ({
            [`${chain}-${address}`]: tvl,
          } as PoolTvlMap),
      ),
    );
  } catch (error) {
    console.error(`useTvlData - Fail to get the TVL for pool ${address} on ${chain}`, error);
    return of(DEFAULT_VALUE);
  }
};

// stream$ for periodic polling to fetch data
const periodicStream$ = combineLatest([poolList$, servicesLoaded$, intervalBeat$]).pipe(
  filter(([, servicesLoaded]) => servicesLoaded),
  mergeMap<[TempusPool[], boolean, number], Observable<PoolTvlMap>>(([tempusPools]) => {
    const poolTvlMaps = tempusPools.map(fetchData);

    return merge(...poolTvlMaps);
  }),
);

// stream$ for listening to Tempus event to fetch specific pool data
const eventStream$ = combineLatest([appEvent$, servicesLoaded$]).pipe(
  filter(([, servicesLoaded]) => servicesLoaded),
  mergeMap<[{ tempusPool: TempusPool }, boolean], Observable<PoolTvlMap>>(([{ tempusPool }]) => fetchData(tempusPool)),
);

// merge all stream$ into one
const stream$ = merge(periodicStream$, eventStream$).pipe(
  scan(
    (allTvls, poolTvl) => ({
      ...allTvls,
      ...poolTvl,
    }),
    {} as PoolTvlMap,
  ),
  debounce<PoolTvlMap>(() => interval(DEBOUNCE_IN_MS)),
  tap(poolTvls => poolTvls$.next(poolTvls)),
);

const totalTvl$: Observable<Decimal> = poolTvls$.pipe(
  map(poolTvls => {
    const allTvls = Object.values(poolTvls);
    return allTvls.reduce((sum, tvl) => sum.add(tvl), ZERO);
  }),
);

export const [useTvlData] = bind(poolTvls$, {});
export const [useTotalTvl] = bind(totalTvl$, ZERO);

let subscription: Subscription = stream$.subscribe();

export const subscribe = (): void => {
  unsubscribe();
  subscription = stream$.subscribe();
};
export const unsubscribe = (): void => subscription?.unsubscribe?.();
export const reset = (): void => poolTvls$.next(DEFAULT_VALUE);
