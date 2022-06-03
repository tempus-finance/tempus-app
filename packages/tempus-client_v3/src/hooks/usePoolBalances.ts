import { bind } from '@react-rxjs/core';
import { catchError, combineLatest, debounce, interval, map, merge, mergeMap, Observable, of, scan } from 'rxjs';
import { Chain, Decimal, getServices, StatisticsService } from 'tempus-core-services';
import { poolList$ } from './usePoolList';
import { servicesLoaded$ } from './useServicesLoaded';
import { walletAddress$ } from './useWalletAddress';
import { walletBalances$ } from './useWalletBalances';

const DEBOUNCE_IN_MS = 500;

interface PoolBalanceMap {
  [chainPoolAddressString: string]: Decimal | null;
}

export const poolBalances$: Observable<PoolBalanceMap> = combineLatest([
  poolList$,
  walletAddress$,
  walletBalances$, // TODO - Instead of depending on all token balances (walletBalances$), this stream should
  // update only when TPS, TYS or LP token balance changes for specific pool
  servicesLoaded$,
]).pipe(
  mergeMap(([tempusPools, walletAddress, walletBalances]) => {
    const poolBalances = tempusPools.map(tempusPool => {
      const tokenBalances = {
        principalsBalance: walletBalances[`${tempusPool.chain}-${tempusPool.principalsAddress}`],
        yieldsBalance: walletBalances[`${tempusPool.chain}-${tempusPool.yieldsAddress}`],
        lpTokenBalance: walletBalances[`${tempusPool.chain}-${tempusPool.ammAddress}`],
      };
      const poolBalance = (
        getServices(tempusPool.chain as Chain)?.StatisticsService as StatisticsService
      ).getUserPoolBalanceUSD(tempusPool.chain as Chain, tempusPool, walletAddress, tokenBalances);
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
    {} as PoolBalanceMap,
  ),
  debounce<PoolBalanceMap>(() => interval(DEBOUNCE_IN_MS)),
  catchError(error => {
    console.error('usePoolBalances - StatisticsService.getUserPoolBalanceUSD', error);
    return of({});
  }),
);

export const [usePoolBalances] = bind(poolBalances$, {});
