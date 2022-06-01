import { bind } from '@react-rxjs/core';
import {
  catchError,
  combineLatest,
  debounce,
  interval,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  scan,
  startWith,
} from 'rxjs';
import { getServices, Decimal, ZERO, StatisticsService, TempusPool, Chain } from 'tempus-core-services';
import { poolList$ } from './useConfig';

interface PoolTvlMap {
  [chainPoolAddress: string]: Decimal;
}

const TVL_POLLING_INTERVAL_IN_MS = 120000;
const DEBOUNCE_IN_MS = 500;

const polling$: Observable<number> = interval(TVL_POLLING_INTERVAL_IN_MS).pipe(startWith(0));

export const poolTvls$: Observable<PoolTvlMap> = combineLatest([poolList$, polling$]).pipe(
  mergeMap<[TempusPool[], number], Observable<PoolTvlMap>>(([tempusPools]) => {
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
    return of({});
  }),
);

const totalTvl$: Observable<Decimal> = poolTvls$.pipe(
  map(poolTvls => {
    const allTvls = Object.values(poolTvls);
    return allTvls.reduce((sum, tvl) => sum.add(tvl), ZERO);
  }),
);

export const [useTvlData] = bind(poolTvls$, {});
export const [useTotalTvl] = bind(totalTvl$, ZERO);
