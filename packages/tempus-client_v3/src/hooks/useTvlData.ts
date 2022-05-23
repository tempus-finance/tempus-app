import { bind } from '@react-rxjs/core';
import { catchError, from, interval, map, mergeMap, Observable, of, startWith, zip } from 'rxjs';
import { getServices, Decimal, StatisticsService, TempusPool, Chain } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';

const ZERO = new Decimal(0);
const TVL_POLLING_INTERVAL_IN_MS = 10000;

const tvlData$: Observable<Decimal> = interval(TVL_POLLING_INTERVAL_IN_MS).pipe(
  startWith(0),
  map(() => getConfigManager().getPoolList()),
  mergeMap<TempusPool[], Observable<Decimal[]>>((tempusPools: TempusPool[]) =>
    zip<Decimal[]>(
      tempusPools.map(({ chain, address, backingToken }: TempusPool) =>
        from<Observable<Decimal>>(
          (getServices(chain as Chain)?.StatisticsService as StatisticsService).totalValueLockedUSD(
            chain as Chain,
            address,
            backingToken,
          ),
        ),
      ),
    ),
  ),
  map<Decimal[], Decimal>((poolLockedValues: Decimal[]) =>
    poolLockedValues.reduce((memo: Decimal, current: Decimal) => memo.add(current)),
  ),
  catchError(error => {
    console.error('useTvlData - getTempusPoolTVL', error);
    return of(ZERO);
  }),
);

export const [useTvlData] = bind(tvlData$, ZERO);
