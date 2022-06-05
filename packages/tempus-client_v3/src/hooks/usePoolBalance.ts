import { bind } from '@react-rxjs/core';
import {
  BehaviorSubject,
  combineLatest,
  map,
  mergeMap,
  merge,
  filter,
  tap,
  Subscription,
  Observable,
  of,
  scan,
} from 'rxjs';
import { Chain, Decimal, getServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { config$ } from './useConfig';
import { servicesLoaded$ } from './useServicesLoaded';
import { initTokenBalancesStream$, tokenBalanceDataMap } from './useTokenBalance';
import { walletAddress$ } from './useWalletAddress';

// Improves readability of the code
type PoolChainAddressId = string;

interface PoolBalanceData {
  subject$: BehaviorSubject<Decimal | null>;
  address: string;
  chain: Chain;
}

// Each pool will have a separate BehaviorSubject, and this map will store them with some additional pool data
export const poolBalanceDataMap = new Map<PoolChainAddressId, PoolBalanceData>();

// PoolBalance update stream subscriptions
const balanceUpdateStreams: Observable<void>[] = [];
let balanceUpdateSubscriptions: Subscription[] = [];

// Wait for config to load and create a BehaviorSubject and update stream for each pool in the config file
export const initPoolBalancesStream$ = combineLatest([config$, initTokenBalancesStream$]).pipe(
  tap(() => {
    const poolList = getConfigManager().getPoolList();
    poolList.forEach(pool => {
      const poolChainAddressId = `${pool.chain}-${pool.address}`;

      const poolBalanceSubject$ = new BehaviorSubject<Decimal | null>(null);

      poolBalanceDataMap.set(poolChainAddressId, {
        subject$: poolBalanceSubject$,
        address: pool.address,
        chain: pool.chain,
      });

      // Get token balance stream data for pool
      const capitalTokenStreamData = tokenBalanceDataMap.get(`${pool.chain}-${pool.principalsAddress}`);
      const yieldTokenStreamData = tokenBalanceDataMap.get(`${pool.chain}-${pool.yieldsAddress}`);
      const lpTokenStreamData = tokenBalanceDataMap.get(`${pool.chain}-${pool.ammAddress}`);

      if (capitalTokenStreamData && yieldTokenStreamData && lpTokenStreamData) {
        const updateStream$ = combineLatest([
          servicesLoaded$,
          walletAddress$,
          capitalTokenStreamData.subject$,
          yieldTokenStreamData.subject$,
          lpTokenStreamData.subject$,
        ]).pipe(
          filter(([servicesLoaded, walletAddress]) => Boolean(walletAddress) && servicesLoaded),
          mergeMap(([, walletAddress, capitalsBalance, yieldsBalance, lpBalance]) => {
            const services = getServices(pool.chain);
            if (!services) {
              throw new Error('usePoolBalance - initPoolBalancesStream$ - Failed to get services');
            }

            if (!capitalsBalance || !yieldsBalance || !lpBalance) {
              return of(null);
            }

            console.log(`Fetching pool ${pool.address} balance on chain ${pool.chain}`);
            return services.StatisticsService.getUserPoolBalanceUSD(pool.chain, pool, walletAddress, {
              principalsBalance: capitalsBalance || new Decimal(0),
              yieldsBalance: yieldsBalance || new Decimal(0),
              lpTokenBalance: lpBalance || new Decimal(0),
            });
          }),
          map(balance => {
            if (balance === null) {
              return;
            }

            console.log(`Updating pool ${pool.address} balance on chain ${pool.chain} to ${balance}`);
            poolBalanceSubject$.next(balance);
          }),
          tap(() => poolBalances$.next({})),
        );

        balanceUpdateStreams.push(updateStream$);
      }
    });
  }),
);

interface PoolBalanceMap {
  [chainPoolAddress: string]: Decimal | null;
}

export const poolBalances$ = new BehaviorSubject<PoolBalanceMap>({});

let poolBalanceMapStream$: Observable<BehaviorSubject<Decimal | null>>;
const poolBalanceMapStreamInit$ = combineLatest([initPoolBalancesStream$]).pipe(
  map(() => merge([...poolBalanceDataMap.values()].map(poolBalanceData => poolBalanceData.subject$))),
);

const poolBalanceMapStream$ = combineLatest([poolBalanceMapStreamInit$]).pipe(
  mergeMap(() => {
    const poolBalanceStreams = [...poolBalanceDataMap.values()].map(poolBalanceData => {
      console.log('test');

      return poolBalanceData.subject$.pipe(
        map(balance => ({
          [`${poolBalanceData.chain}-${poolBalanceData.address}`]: balance,
        })),
      );
    });

    return merge(...poolBalanceStreams);
  }),
  scan(
    (allPoolBalances, poolBalance) => ({
      ...allPoolBalances,
      ...poolBalance,
    }),
    {} as PoolBalanceMap,
  ),
  tap(poolBalances => {
    poolBalances$.next(poolBalances);
  }),
);

export const [usePoolBalance] = bind((poolAddress: string | undefined, poolChain: Chain | undefined) => {
  if (!poolChain || !poolAddress) {
    return of(null);
  }

  const poolBalanceData = poolBalanceDataMap.get(`${poolChain}-${poolAddress}`);
  if (poolBalanceData) {
    return poolBalanceData.subject$;
  }
  return of(null);
}, null);

let initSubscription = initPoolBalancesStream$.subscribe();
let poolBalanceMapSubscription = poolBalanceMapStream$.subscribe();
balanceUpdateStreams.forEach(stream => {
  balanceUpdateSubscriptions.push(stream.subscribe());
});

export const subscribe = (): void => {
  unsubscribe();
  balanceUpdateStreams.forEach(stream => {
    balanceUpdateSubscriptions.push(stream.subscribe());
  });
  initSubscription = initPoolBalancesStream$.subscribe();
  poolBalanceMapSubscription = poolBalanceMapStream$.subscribe();
};
export const unsubscribe = (): void => {
  initSubscription.unsubscribe();
  poolBalanceMapSubscription.unsubscribe();
  balanceUpdateSubscriptions.forEach(subscription => {
    subscription.unsubscribe();
  });
  balanceUpdateSubscriptions = [];
};
export const reset = (): void => {
  poolBalanceDataMap.forEach(poolBalanceData => poolBalanceData.subject$.next(null));
};
