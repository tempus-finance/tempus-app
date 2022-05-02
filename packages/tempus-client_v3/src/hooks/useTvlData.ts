import { useState, useEffect } from 'react';
import {
  catchError,
  from,
  interval,
  map,
  mergeMap,
  of,
  ReplaySubject,
  startWith,
  Subscription,
  switchMap,
  tap,
  zip,
} from 'rxjs';
import { getServices, ZERO, Config, TempusPool, Decimal, Chain } from 'tempus-core-services';
import { getConfig } from '../config/getConfig';

const TVL_POLLING_INTERVAL_IN_MS = 10000;
const tvlSubject = new ReplaySubject<Decimal>(1);

type ExtendedTempusPool = TempusPool & { chain: Chain };

const mapConfigToPools = (config: Config): ExtendedTempusPool[] => {
  const pools: ExtendedTempusPool[] = [];

  Object.keys(config).forEach((chain: string) => {
    config[chain].tempusPools.forEach((pool: TempusPool) => {
      const extendedPool: ExtendedTempusPool = { ...pool, chain: chain as Chain };
      pools.push(extendedPool);
    });
  });

  return pools;
};

export const useTvlData = (): [Decimal] => {
  const [tvlData, setTvlData] = useState<Decimal>(new Decimal(0));

  useEffect(() => {
    const tvlInterval$: Subscription = interval(TVL_POLLING_INTERVAL_IN_MS)
      .pipe(
        startWith(0),
        switchMap(() => getConfig()),
        map<Config, ExtendedTempusPool[]>((config: Config) => mapConfigToPools(config)),
        mergeMap((tempusPools: ExtendedTempusPool[]) =>
          zip<Decimal[]>(
            tempusPools.map(({ chain, address, backingToken }: ExtendedTempusPool) =>
              from<Promise<Decimal>>(
                getServices(chain)?.StatisticsService.totalValueLockedUSD(chain, address, backingToken),
              ),
            ),
          ),
        ),
        map((poolLockedValues: Decimal[]) =>
          poolLockedValues.reduce((memo: Decimal, current: Decimal) => memo.add(current)),
        ),
        tap((tvl: Decimal) => tvlSubject.next(tvl)),
        catchError(error => {
          console.error('useTvlData - getTempusPoolTVL', error);
          return of(ZERO);
        }),
      )
      .subscribe();

    return () => tvlInterval$?.unsubscribe();
  }, []);

  useEffect(() => {
    const subscribeToTvlData = () => {
      tvlSubject.subscribe(data => {
        setTvlData(data);
      });
    };

    subscribeToTvlData();

    return () => {
      tvlSubject.unsubscribe();
    };
  }, []);

  return [tvlData];
};
