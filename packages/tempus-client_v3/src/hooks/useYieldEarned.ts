import { bind } from '@react-rxjs/core';
import {
  BehaviorSubject,
  map,
  combineLatest,
  from,
  of,
  merge,
  mergeMap,
  Subscription,
  filter,
  Observable,
  catchError,
  scan,
  debounce,
  tap,
  interval,
} from 'rxjs';
import { Chain, Decimal, getDefinedServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { DEBOUNCE_IN_MS } from '../constants';
import { servicesLoaded$ } from './useServicesLoaded';

type PoolChainAddressId = string;

export interface PoolsYieldEarnedMap {
  [id: PoolChainAddressId]: Decimal | null;
}

export interface PoolYieldEarned {
  poolYieldEarned: Decimal | null;
  chain: Chain;
  address: string;
}

interface PoolYieldEarnedData {
  subject$: BehaviorSubject<PoolYieldEarned>;
  address: string;
  chain: Chain;
}

interface PoolYieldEarnedMap {
  [id: PoolChainAddressId]: PoolYieldEarned;
}

// Each pool will have a separate BehaviorSubject, and this map will store them with some additional pool data
export const poolYieldEarnedDataMap = new Map<PoolChainAddressId, PoolYieldEarnedData>();

const poolList = getConfigManager().getPoolList();
poolList.forEach(pool => {
  const poolChainAddressId = `${pool.chain}-${pool.address}`;

  poolYieldEarnedDataMap.set(poolChainAddressId, {
    subject$: new BehaviorSubject<PoolYieldEarned>({
      poolYieldEarned: null,
      address: pool.address,
      chain: pool.chain,
    }),
    address: pool.address,
    chain: pool.chain,
  });
});

/**
 * Function to fetch pool negative interest rate flag
 */
const fetchPoolYieldEarned = (chain: Chain, poolAddress: string): Observable<Decimal | null> => {
  try {
    const services = getDefinedServices(chain);
    return from(services.PoolInterestRateService.isPoolInterestRateNegative(poolAddress)).pipe(
      catchError(error => {
        console.error(
          'useNegativePoolInterestRate -' +
            `failed to check if pool interest rate is negative for pool ${poolAddress} on ${chain}`,
          error,
        );
        return of(null);
      }),
    );
  } catch (error) {
    console.error(
      'useNegativePoolInterestRate - ' +
        `failed to check if pool interest rate is negative for pool ${poolAddress} on ${chain}`,
      error,
    );
    return of(null);
  }
};

// Stream that goes over all pools and fetches interest rate negative flag - this happens only once on app load
const poolYieldEarnedStream$ = combineLatest([servicesLoaded$]).pipe(
  filter(([servicesLoaded]) => servicesLoaded),
  mergeMap<[boolean], Observable<PoolYieldEarnedMap | null>>(() => {
    const poolYieldEarnedFetchMap = [...poolYieldEarnedDataMap.values()].map(poolYieldEarnedData =>
      fetchPoolYieldEarned(poolYieldEarnedData.chain, poolYieldEarnedData.address).pipe(
        filter(poolYieldEarned => poolYieldEarned !== null),
        map(poolYieldEarned => ({
          [`${poolYieldEarnedData.chain}-${poolYieldEarnedData.address}`]: {
            poolYieldEarned,
            address: poolYieldEarnedData.address,
            chain: poolYieldEarnedData.chain,
          },
        })),
      ),
    );

    return merge(...poolYieldEarnedFetchMap);
  }),
);

// Merge all stream$ into one
const stream$ = merge(poolYieldEarnedStream$).pipe(
  filter(dataMap => Boolean(dataMap)),
  scan(
    (allDataMap, dataMap) => ({
      ...allDataMap,
      ...dataMap,
    }),
    {} as PoolYieldEarnedMap,
  ),
  debounce<PoolYieldEarnedMap>(() => interval(DEBOUNCE_IN_MS)),
  tap(dataMap => {
    if (dataMap === null) {
      return;
    }

    Object.keys(dataMap).forEach(key => {
      const negativePoolInterestRateData = dataMap[key];
      if (negativePoolInterestRateData.poolInterestRateNegative !== null) {
        const negativePoolInterestRate = poolYieldEarnedDataMap.get(
          `${negativePoolInterestRateData.chain}-${negativePoolInterestRateData.address}`,
        );
        if (negativePoolInterestRate) {
          negativePoolInterestRate.subject$.next({
            poolInterestRateNegative: negativePoolInterestRateData.poolInterestRateNegative,
            chain: negativePoolInterestRateData.chain,
            address: negativePoolInterestRateData.address,
          });
        }
      }
    });
  }),
);

// Combines all negative pool interest rate subjects into a single map
export const poolYieldEarnedMap$ = combineLatest(
  [...poolYieldEarnedDataMap.values()].map(negativePoolInterestRateData => negativePoolInterestRateData.subject$),
).pipe(
  map<PoolYieldEarned[], PoolsYieldEarnedMap>(poolsYieldEarnedData => {
    let poolYieldEarnedMap: { [id: PoolChainAddressId]: Decimal | null } = {};

    poolsYieldEarnedData.forEach(poolYieldEarnedData => {
      poolYieldEarnedMap = {
        ...poolYieldEarnedMap,
        [`${poolYieldEarnedData.chain}-${poolYieldEarnedData.address}`]: poolYieldEarnedData.poolYieldEarned,
      };
    });

    return poolYieldEarnedMap;
  }),
);

export const [usePoolsYieldEarned] = bind<PoolsYieldEarnedMap>(poolYieldEarnedMap$, {});

export const [usePoolYieldEarned] = bind((poolAddress: string, chain: Chain | null) => {
  if (!chain) {
    return of(null);
  }

  const poolYieldEarnedData = poolYieldEarnedDataMap.get(`${chain}-${poolAddress}`);
  if (poolYieldEarnedData) {
    return poolYieldEarnedData.subject$;
  }
  return of(null);
}, null);

let streamSubscription: Subscription = stream$.subscribe();

export const subscribePoolYieldEarned = (): void => {
  unsubscribePoolYieldEarned();
  streamSubscription = stream$.subscribe();
};
export const unsubscribePoolYieldEarned = (): void => {
  streamSubscription.unsubscribe();
};
export const resetPoolYieldEarned = (): void => {
  poolYieldEarnedDataMap.forEach(poolYieldEarnedData =>
    poolYieldEarnedData.subject$.next({
      poolYieldEarned: null,
      chain: poolYieldEarnedData.chain,
      address: poolYieldEarnedData.address,
    }),
  );
};
