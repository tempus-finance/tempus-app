import { bind } from '@react-rxjs/core';
import {
  BehaviorSubject,
  catchError,
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
import { getServices, Decimal, ZERO, StatisticsService, TempusPool, Chain } from 'tempus-core-services';
import { poolList$ } from './usePoolList';
import { servicesLoaded$ } from './useServicesLoaded';

interface PoolTvlMap {
  [chainPoolAddress: string]: Decimal;
}

const DEFAULT_VALUE = {};
const TVL_POLLING_INTERVAL_IN_MS = 2 * 60 * 1000;
const DEBOUNCE_IN_MS = 500;

const polling$: Observable<number> = interval(TVL_POLLING_INTERVAL_IN_MS).pipe(startWith(0));

export const poolTvls$ = new BehaviorSubject<PoolTvlMap>(DEFAULT_VALUE);

const stream$ = combineLatest([poolList$, servicesLoaded$, polling$]).pipe(
  filter(([, servicesLoaded]) => servicesLoaded),
  mergeMap<[TempusPool[], boolean, number], Observable<PoolTvlMap>>(([tempusPools]) => {
    const poolTvlMaps = tempusPools.map(({ chain, address, backingToken }: TempusPool) => {
      const poolTvl$ = (getServices(chain as Chain)?.StatisticsService as StatisticsService).totalValueLockedUSD(
        chain as Chain,
        address,
        backingToken,
      );
      return poolTvl$.pipe(
        map(
          tvl =>
            ({
              [`${chain}-${address}`]: tvl,
            } as PoolTvlMap),
        ),
      );
    });

    return merge(...poolTvlMaps);
  }),
  scan(
    (allTvls, poolTvl) => ({
      ...allTvls,
      ...poolTvl,
    }),
    {} as PoolTvlMap,
  ),
  debounce<PoolTvlMap>(() => interval(DEBOUNCE_IN_MS)),
  catchError(error => {
    console.error('useTvlData - getTempusPoolTVL', error);
    return of(DEFAULT_VALUE);
  }),
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
