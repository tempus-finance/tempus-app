import { bind } from '@react-rxjs/core';
import { BehaviorSubject, map, combineLatest, of, merge, mergeMap, Subscription, filter, tap } from 'rxjs';
import { Chain, Decimal } from 'tempus-core-services';
import { Deposit, Redeem } from 'tempus-core-services/dist/interfaces';
import { getConfigManager } from '../config/getConfigManager';
import { PoolBalance, poolBalances$ } from './usePoolBalance';
import { servicesLoaded$ } from './useServicesLoaded';
import { userDeposits$ } from './useUserDeposits';
import { userRedeems$ } from './useUserRedeems';

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
const getPoolYieldEarned = (
  chain: Chain,
  address: string,
  userDeposits: Deposit[] | null,
  userRedeems: Redeem[] | null,
  userPoolBalances: { [id: string]: PoolBalance },
): Decimal | null => {
  try {
    const currentBalance = userPoolBalances[`${chain}-${address}`].balanceInUsd;

    if (!currentBalance || !userDeposits || !userRedeems) {
      return null;
    }

    let totalDepositedUsd = new Decimal(0);
    userDeposits.forEach(deposit => {
      if (deposit.poolAddress.toLowerCase() !== address.toLowerCase()) {
        return;
      }

      const depositAmountUsd = deposit.amountDeposited.mul(deposit.tokenRate);

      totalDepositedUsd = totalDepositedUsd.add(depositAmountUsd);
    });

    let totalRedeemedUsd = new Decimal(0);
    userRedeems.forEach(redeem => {
      if (redeem.poolAddress.toLocaleLowerCase() !== address.toLowerCase()) {
        return;
      }

      const redeemedAmountUsd = redeem.amountRedeemed.mul(redeem.tokenRate);

      totalRedeemedUsd = totalRedeemedUsd.add(redeemedAmountUsd);
    });

    return totalRedeemedUsd.add(currentBalance).sub(totalDepositedUsd);
  } catch (error) {
    console.error(
      'useNegativePoolInterestRate - ' +
        `failed to check if pool interest rate is negative for pool ${address} on ${chain}`,
      error,
    );
    return null;
  }
};

// Stream that goes over all pools and calculates yield earned for all pools - this happens only once on app load
const poolYieldEarnedStream$ = combineLatest([servicesLoaded$, userDeposits$, userRedeems$, poolBalances$]).pipe(
  filter(
    ([servicesLoaded, userDeposits, userRedeems]) => servicesLoaded && Boolean(userDeposits) && Boolean(userRedeems),
  ),
  mergeMap(([, userDeposits, userRedeems, poolBalances]) => {
    const poolYieldEarnedFetchMap = [...poolYieldEarnedDataMap.values()].map(poolYieldEarnedData =>
      of(
        getPoolYieldEarned(
          poolYieldEarnedData.chain,
          poolYieldEarnedData.address,
          userDeposits,
          userRedeems,
          poolBalances,
        ),
      ).pipe(
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
  tap(dataMap => {
    if (dataMap === null) {
      return;
    }

    Object.keys(dataMap).forEach(key => {
      const poolYieldEarnedData = dataMap[key];
      if (poolYieldEarnedData.poolYieldEarned !== null) {
        const poolYieldEarned = poolYieldEarnedDataMap.get(
          `${poolYieldEarnedData.chain}-${poolYieldEarnedData.address}`,
        );
        if (poolYieldEarned) {
          poolYieldEarned.subject$.next({
            poolYieldEarned: poolYieldEarnedData.poolYieldEarned,
            chain: poolYieldEarnedData.chain,
            address: poolYieldEarnedData.address,
          });
        }
      }
    });
  }),
);

// Combines all pool yield earned subjects into a single map
export const poolYieldEarnedMap$ = combineLatest(
  [...poolYieldEarnedDataMap.values()].map(negativePoolInterestRateData => negativePoolInterestRateData.subject$),
).pipe(
  map<PoolYieldEarned[], PoolsYieldEarnedMap>(poolsYieldEarnedData => {
    let poolYieldEarnedMap: PoolsYieldEarnedMap = {};

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
