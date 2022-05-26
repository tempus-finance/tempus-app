import { bind } from '@react-rxjs/core';
import { catchError, combineLatest, debounce, interval, map, merge, Observable, of, scan } from 'rxjs';
import { Chain, Decimal, getServices, StatisticsService } from 'tempus-core-services';
import { poolList$ } from './useConfig';
import { walletAddress$ } from './useWalletAddress';

const DEBOUNCE_IN_MS = 500;

// TODO: this should be replaced by chain event or app event that trigger balance update
const someEvent$: Observable<number> = of(0);

interface PoolBalanceMap {
  [chainPoolAddressString: string]: Decimal | null;
}

export const poolBalances$: Observable<PoolBalanceMap> = combineLatest([poolList$, walletAddress$, someEvent$]).pipe(
  map(([tempusPools, walletAddress]) => {
    const poolBalances = tempusPools.map(tempusPool => {
      const poolBalance = (
        getServices(tempusPool.chain as Chain)?.StatisticsService as StatisticsService
      ).getUserPoolBalanceUSD(tempusPool.chain as Chain, tempusPool, walletAddress);
      return poolBalance.pipe(
        map(
          balance =>
            ({
              [`${tempusPool.chain}-${tempusPool.address}`]: balance,
            } as PoolBalanceMap),
        ),
      );
    });

    return merge(...poolBalances);
  }),
  scan(
    (allRates, tokenRates) => ({
      ...allRates,
      ...tokenRates,
    }),
    {},
  ),
  debounce<PoolBalanceMap>(() => interval(DEBOUNCE_IN_MS)),
  catchError(error => {
    console.error('usePoolBalances - StatisticsService.getUserPoolBalanceUSD', error);
    return of({});
  }),
);

export const [usePoolBalances] = bind(poolBalances$, {});
