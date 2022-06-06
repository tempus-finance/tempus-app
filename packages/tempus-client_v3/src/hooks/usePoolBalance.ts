import { bind } from '@react-rxjs/core';
import { BehaviorSubject, combineLatest, map, mergeMap, filter, Subscription, Observable, of } from 'rxjs';
import { Chain, Decimal, getServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { servicesLoaded$ } from './useServicesLoaded';
import { tokenBalanceDataMap } from './useTokenBalance';
import { walletAddress$ } from './useWalletAddress';

// Improves readability of the code
type PoolChainAddressId = string;

interface PoolBalanceData {
  subject$: BehaviorSubject<{
    balance: Decimal | null;
    chain: Chain;
    address: string;
  }>;
  address: string;
  chain: Chain;
}

// Each pool will have a separate BehaviorSubject, and this map will store them with some additional pool data
export const poolBalanceDataMap = new Map<PoolChainAddressId, PoolBalanceData>();

// PoolBalance update stream subscriptions
const balanceUpdateStreams: Observable<void>[] = [];
let balanceUpdateSubscriptions: Subscription[] = [];

const poolList = getConfigManager().getPoolList();
poolList.forEach(pool => {
  const poolChainAddressId = `${pool.chain}-${pool.address}`;

  poolBalanceDataMap.set(poolChainAddressId, {
    subject$: new BehaviorSubject<{
      balance: Decimal | null;
      address: string;
      chain: Chain;
    }>({
      balance: null,
      address: pool.address,
      chain: pool.chain,
    }),
    address: pool.address,
    chain: pool.chain,
  });
});

poolList.forEach(tempusPool => {
  const { chain, address, principalsAddress, yieldsAddress, ammAddress } = tempusPool;

  const capitalTokenStreamData = tokenBalanceDataMap.get(`${chain}-${principalsAddress}`);
  const yieldTokenStreamData = tokenBalanceDataMap.get(`${chain}-${yieldsAddress}`);
  const lpTokenStreamData = tokenBalanceDataMap.get(`${chain}-${ammAddress}`);

  if (capitalTokenStreamData && yieldTokenStreamData && lpTokenStreamData) {
    const updateStream$ = combineLatest([
      servicesLoaded$,
      walletAddress$,
      capitalTokenStreamData.subject$,
      yieldTokenStreamData.subject$,
      lpTokenStreamData.subject$,
    ]).pipe(
      filter(([servicesLoaded, walletAddress]) => servicesLoaded && Boolean(walletAddress)),
      mergeMap(([, walletAddress, capitalsBalance, yieldsBalance, lpBalance]) => {
        const services = getServices(chain);
        if (!services) {
          throw new Error('usePoolBalance - updateStream$ - Failed to get services');
        }

        if (!capitalsBalance || !yieldsBalance || !lpBalance) {
          return of(null);
        }

        console.log(`Fetching pool ${address} balance on chain ${chain}`);

        return services.StatisticsService.getUserPoolBalanceUSD(chain, tempusPool, walletAddress, {
          principalsBalance: capitalsBalance,
          yieldsBalance,
          lpTokenBalance: lpBalance,
        });
      }),
      map(balance => {
        if (balance === null) {
          return;
        }

        console.log(`Updating pool ${address} balance on chain ${chain} to ${balance}`);

        const poolBalanceData = poolBalanceDataMap.get(`${chain}-${address}`);
        if (poolBalanceData) {
          poolBalanceData.subject$.next({
            balance,
            address,
            chain,
          });
        }
      }),
    );
    balanceUpdateStreams.push(updateStream$);
  }
});

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

balanceUpdateStreams.forEach(stream => {
  balanceUpdateSubscriptions.push(stream.subscribe());
});

export const poolBalancesStream$ = combineLatest(
  [...poolBalanceDataMap.values()].map(poolBalanceData => poolBalanceData.subject$),
);

export const subscribe = (): void => {
  unsubscribe();
  balanceUpdateStreams.forEach(stream => {
    balanceUpdateSubscriptions.push(stream.subscribe());
  });
};
export const unsubscribe = (): void => {
  balanceUpdateSubscriptions.forEach(subscription => {
    subscription.unsubscribe();
  });
  balanceUpdateSubscriptions = [];
};
export const reset = (): void => {
  poolBalanceDataMap.forEach(poolBalanceData =>
    poolBalanceData.subject$.next({
      balance: null,
      address: poolBalanceData.address,
      chain: poolBalanceData.chain,
    }),
  );
};
