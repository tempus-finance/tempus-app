import { bind } from '@react-rxjs/core';
import {
  BehaviorSubject,
  combineLatest,
  map,
  mergeMap,
  filter,
  Subscription,
  Observable,
  of,
  catchError,
  from,
} from 'rxjs';
import { Chain, Decimal, getServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { servicesLoaded$ } from './useServicesLoaded';
import { tokenBalanceDataMap } from './useTokenBalance';
import { walletAddress$ } from './useWalletAddress';

// Improves readability of the code
type PoolChainAddressId = string;

export interface PoolBalance {
  balanceInBackingToken: Decimal | null;
  balanceInYieldBearingToken: Decimal | null;
  balanceInUsd: Decimal | null;
}

interface PoolBalanceDataSubject extends PoolBalance {
  chain: Chain;
  address: string;
}

interface PoolBalanceData {
  subject$: BehaviorSubject<PoolBalanceDataSubject>;
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
    subject$: new BehaviorSubject<PoolBalanceDataSubject>({
      balanceInBackingToken: null,
      balanceInYieldBearingToken: null,
      balanceInUsd: null,
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
      capitalTokenStreamData.subject$,
      yieldTokenStreamData.subject$,
      lpTokenStreamData.subject$,
      walletAddress$,
    ]).pipe(
      filter(([servicesLoaded]) => servicesLoaded),
      mergeMap(([, capitalsBalanceData, yieldsBalanceData, lpBalanceData, walletAddress]) => {
        if (!capitalsBalanceData.balance || !yieldsBalanceData.balance || !lpBalanceData.balance) {
          return of(null);
        }

        const services = getServices(chain);
        if (!services) {
          throw new Error('usePoolBalance - updateStream$ - Failed to get services');
        }

        const balanceInBackingTokenFetch$ = from(
          services.PoolBalanceService.getPoolBalance(
            tempusPool.address,
            {
              capitalsBalance: capitalsBalanceData.balance,
              yieldsBalance: yieldsBalanceData.balance,
              lpBalance: lpBalanceData.balance,
            },
            'backing',
          ),
        );
        const balanceInYieldBearingTokenFetch$ = from(
          services.PoolBalanceService.getPoolBalance(
            tempusPool.address,
            {
              capitalsBalance: capitalsBalanceData.balance,
              yieldsBalance: yieldsBalanceData.balance,
              lpBalance: lpBalanceData.balance,
            },
            'yield-bearing',
          ),
        );
        const balanceInUsdFetch$ = from(
          services.StatisticsService.getUserPoolBalanceUSD(chain, tempusPool, walletAddress),
        );

        return combineLatest([balanceInBackingTokenFetch$, balanceInYieldBearingTokenFetch$, balanceInUsdFetch$]);
      }),
      map(poolBalances => {
        if (poolBalances === null) {
          return;
        }

        const [balanceInBackingToken, balanceInYieldBearingToken, balanceInUsd] = poolBalances;

        const poolBalanceData = poolBalanceDataMap.get(`${chain}-${address}`);
        if (poolBalanceData) {
          poolBalanceData.subject$.next({
            balanceInBackingToken,
            balanceInYieldBearingToken,
            balanceInUsd,
            address,
            chain,
          });
        }
      }),
      catchError(error => {
        console.error('usePoolBalance - updateStream$ - ', error);
        return of();
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

export const poolBalances$ = combineLatest(
  [...poolBalanceDataMap.values()].map(poolBalanceData => poolBalanceData.subject$),
).pipe(
  map(poolBalancesData => {
    let poolBalanceMap: { [id: PoolChainAddressId]: PoolBalance } = {};

    poolBalancesData.forEach(poolBalanceData => {
      poolBalanceMap = {
        ...poolBalanceMap,
        [`${poolBalanceData.chain}-${poolBalanceData.address}`]: {
          balanceInBackingToken: poolBalanceData.balanceInBackingToken,
          balanceInYieldBearingToken: poolBalanceData.balanceInYieldBearingToken,
          balanceInUsd: poolBalanceData.balanceInUsd,
        },
      };
    });

    return poolBalanceMap;
  }),
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
      balanceInBackingToken: null,
      balanceInYieldBearingToken: null,
      balanceInUsd: null,
      address: poolBalanceData.address,
      chain: poolBalanceData.chain,
    }),
  );
};
