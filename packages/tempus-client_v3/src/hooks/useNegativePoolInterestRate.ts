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
import { Chain, getDefinedServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { DEBOUNCE_IN_MS } from '../constants';
import { servicesLoaded$ } from './useServicesLoaded';

type PoolChainAddressId = string;

export interface NegativePoolInterestRatesMap {
  [id: PoolChainAddressId]: boolean | null;
}

export interface NegativePoolInterestRate {
  poolInterestRateNegative: boolean | null;
  chain: Chain;
  address: string;
}

interface NegativePoolInterestRateData {
  subject$: BehaviorSubject<NegativePoolInterestRate>;
  address: string;
  chain: Chain;
}

interface NegativePoolInterestRateMap {
  [id: PoolChainAddressId]: NegativePoolInterestRate;
}

// Each pool will have a separate BehaviorSubject, and this map will store them with some additional pool data
export const negativePoolInterestRateDataMap = new Map<PoolChainAddressId, NegativePoolInterestRateData>();

const poolList = getConfigManager().getPoolList();
poolList.forEach(pool => {
  // Skip fetching negative interest rate flag for mature pools
  if (pool.maturityDate < Date.now()) {
    return;
  }

  const poolChainAddressId = `${pool.chain}-${pool.address}`;

  negativePoolInterestRateDataMap.set(poolChainAddressId, {
    subject$: new BehaviorSubject<NegativePoolInterestRate>({
      poolInterestRateNegative: null,
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
const fetchIsPoolInterestRateNegative = (chain: Chain, poolAddress: string): Observable<boolean | null> => {
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
const negativePoolInterestRateStream$ = combineLatest([servicesLoaded$]).pipe(
  filter(([servicesLoaded]) => servicesLoaded),
  mergeMap<[boolean], Observable<NegativePoolInterestRateMap | null>>(() => {
    const negativePoolInterestRateFetchMap = [...negativePoolInterestRateDataMap.values()].map(
      negativePoolInterestRateData =>
        fetchIsPoolInterestRateNegative(negativePoolInterestRateData.chain, negativePoolInterestRateData.address).pipe(
          filter(poolInterestRateNegative => poolInterestRateNegative !== null),
          map(poolInterestRateNegative => ({
            [`${negativePoolInterestRateData.chain}-${negativePoolInterestRateData.address}`]: {
              poolInterestRateNegative,
              address: negativePoolInterestRateData.address,
              chain: negativePoolInterestRateData.chain,
            },
          })),
        ),
    );

    return merge(...negativePoolInterestRateFetchMap);
  }),
);

// Merge all stream$ into one
const stream$ = merge(negativePoolInterestRateStream$).pipe(
  filter(dataMap => Boolean(dataMap)),
  scan(
    (allDataMap, dataMap) => ({
      ...allDataMap,
      ...dataMap,
    }),
    {} as NegativePoolInterestRateMap,
  ),
  debounce<NegativePoolInterestRateMap>(() => interval(DEBOUNCE_IN_MS)),
  tap(dataMap => {
    if (dataMap === null) {
      return;
    }

    Object.keys(dataMap).forEach(key => {
      const negativePoolInterestRateData = dataMap[key];
      if (negativePoolInterestRateData.poolInterestRateNegative !== null) {
        const negativePoolInterestRate = negativePoolInterestRateDataMap.get(
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
export const negativePoolInterestRateMap$ = combineLatest(
  [...negativePoolInterestRateDataMap.values()].map(
    negativePoolInterestRateData => negativePoolInterestRateData.subject$,
  ),
).pipe(
  map<NegativePoolInterestRate[], NegativePoolInterestRatesMap>(negativePoolInterestRatesData => {
    let negativePoolInterestRateMap: { [id: PoolChainAddressId]: boolean | null } = {};

    negativePoolInterestRatesData.forEach(negativePoolInterestRateData => {
      negativePoolInterestRateMap = {
        ...negativePoolInterestRateMap,
        [`${negativePoolInterestRateData.chain}-${negativePoolInterestRateData.address}`]:
          negativePoolInterestRateData.poolInterestRateNegative,
      };
    });

    return negativePoolInterestRateMap;
  }),
);

export const [useNegativePoolInterestRates] = bind<NegativePoolInterestRatesMap>(negativePoolInterestRateMap$, {});

export const [useNegativePoolInterestRate] = bind((poolAddress: string, chain: Chain | null) => {
  if (!chain) {
    return of(null);
  }

  const negativePoolInterestRateData = negativePoolInterestRateDataMap.get(`${chain}-${poolAddress}`);
  if (negativePoolInterestRateData) {
    return negativePoolInterestRateData.subject$;
  }
  return of(null);
}, null);

let streamSubscription: Subscription = stream$.subscribe();

export const subscribeNegativePoolInterestRate = (): void => {
  unsubscribeNegativePoolInterestRate();
  streamSubscription = stream$.subscribe();
};
export const unsubscribeNegativePoolInterestRate = (): void => {
  streamSubscription.unsubscribe();
};
export const resetNegativePoolInterestRate = (): void => {
  negativePoolInterestRateDataMap.forEach(poolInterestRateData =>
    poolInterestRateData.subject$.next({
      poolInterestRateNegative: null,
      chain: poolInterestRateData.chain,
      address: poolInterestRateData.address,
    }),
  );
};
