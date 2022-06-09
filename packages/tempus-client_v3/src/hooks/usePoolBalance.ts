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

// Improves readability of the code
type PoolChainAddressId = string;

interface PoolBalanceData {
  subject$: BehaviorSubject<{
    balanceInBackingToken: Decimal | null;
    balanceInYieldBearingToken: Decimal | null;
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
      balanceInBackingToken: Decimal | null;
      balanceInYieldBearingToken: Decimal | null;
      address: string;
      chain: Chain;
    }>({
      balanceInBackingToken: null,
      balanceInYieldBearingToken: null,
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
    ]).pipe(
      filter(([servicesLoaded]) => servicesLoaded),
      mergeMap(([, capitalsBalanceData, yieldsBalanceData, lpBalanceData]) => {
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

        return combineLatest([balanceInBackingTokenFetch$, balanceInYieldBearingTokenFetch$]);
      }),
      map(poolBalances => {
        if (poolBalances === null) {
          return;
        }

        const balanceInBackingToken = poolBalances[0];
        const balanceInYieldBearingToken = poolBalances[1];

        const poolBalanceData = poolBalanceDataMap.get(`${chain}-${address}`);
        if (poolBalanceData) {
          poolBalanceData.subject$.next({
            balanceInBackingToken,
            balanceInYieldBearingToken,
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
    let poolBalanceMap: {
      [id: PoolChainAddressId]: {
        balanceInBackingToken: Decimal | null;
        balanceInYieldBearingToken: Decimal | null;
      };
    } = {};

    poolBalancesData.forEach(poolBalanceData => {
      poolBalanceMap = {
        ...poolBalanceMap,
        [`${poolBalanceData.chain}-${poolBalanceData.address}`]: {
          balanceInBackingToken: poolBalanceData.balanceInBackingToken,
          balanceInYieldBearingToken: poolBalanceData.balanceInYieldBearingToken,
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
      address: poolBalanceData.address,
      chain: poolBalanceData.chain,
    }),
  );
};
