import { bind } from '@react-rxjs/core';
import { catchError, from, interval, map, mergeMap, Observable, of, startWith, switchMap, zip } from 'rxjs';
import { getServices, Config, TempusPool, Decimal, Chain } from 'tempus-core-services';
import { getConfig } from '../config/getConfig';

const ZERO = new Decimal(0);
const TVL_POLLING_INTERVAL_IN_MS = 10000;

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

const tvlData$: Observable<Decimal> = interval(TVL_POLLING_INTERVAL_IN_MS).pipe(
  startWith(0),
  switchMap(() => getConfig()),
  map<Config, ExtendedTempusPool[]>((config: Config) => mapConfigToPools(config)),
  mergeMap((tempusPools: ExtendedTempusPool[]) =>
    zip<Decimal[]>(
      tempusPools.map(({ chain, address, backingToken }: ExtendedTempusPool) =>
        from<Promise<Decimal>>(getServices(chain)?.StatisticsService.totalValueLockedUSD(chain, address, backingToken)),
      ),
    ),
  ),
  map((poolLockedValues: Decimal[]) => poolLockedValues.reduce((memo: Decimal, current: Decimal) => memo.add(current))),
  catchError(error => {
    console.error('useTvlData - getTempusPoolTVL', error);
    return of(ZERO);
  }),
);

export const [useTvlData] = bind(tvlData$, ZERO);