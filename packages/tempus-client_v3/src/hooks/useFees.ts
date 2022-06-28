import { bind } from '@react-rxjs/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounce,
  distinctUntilChanged,
  filter,
  from,
  interval,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  scan,
  startWith,
  Subscription,
  tap,
} from 'rxjs';
import {
  Decimal,
  DEFAULT_TOKEN_PRECISION,
  getDefinedServices,
  getTempusAMMService,
  TempusPool,
} from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { DEBOUNCE_IN_MS, POLLING_INTERVAL_IN_MS } from '../constants';
import { poolList$ } from './usePoolList';
import { servicesLoaded$ } from './useServicesLoaded';

export interface Fees {
  deposit?: Decimal;
  redemption?: Decimal;
  earlyRedemption?: Decimal;
  swap?: Decimal;
}

interface PoolFeesMap {
  [chainPoolAddress: string]: Fees;
}

const DEFAULT_VALUE: PoolFeesMap = {};

const intervalBeat$: Observable<number> = interval(POLLING_INTERVAL_IN_MS).pipe(startWith(0));

const rawPoolFees$ = new BehaviorSubject<PoolFeesMap>(DEFAULT_VALUE);
export const poolFees$ = rawPoolFees$.pipe(
  distinctUntilChanged(
    (previous, current) =>
      Object.keys(current).length === Object.keys(previous).length &&
      Object.keys(current).every(chainPoolAddress => current[chainPoolAddress] === previous[chainPoolAddress]),
  ),
);

const fetchData = (tempusPool: TempusPool): Observable<PoolFeesMap> => {
  const { chain, address, ammAddress } = tempusPool;

  try {
    const { getChainConfig } = getConfigManager();
    const feesConfig$ = getDefinedServices(chain).TempusPoolService.getFeesConfig(address);
    const swapFee$ = from(getTempusAMMService(chain, getChainConfig).getSwapFeePercentage(ammAddress)).pipe(
      map(fee => new Decimal(fee, DEFAULT_TOKEN_PRECISION)),
    );

    return combineLatest([feesConfig$, swapFee$]).pipe(
      map(([feesConfig, swapFee]) => {
        const [deposit, earlyRedemption, redemption] = feesConfig;
        return {
          [`${chain}-${address}`]: {
            deposit,
            redemption,
            earlyRedemption,
            swap: swapFee,
          },
        } as PoolFeesMap;
      }),
      catchError(error => {
        console.error(`useFeesData - Fail to get the fees for pool ${address} on ${chain}`, error);
        return of(DEFAULT_VALUE);
      }),
    );
  } catch (error) {
    console.error(`useFeesData - Fail to get the fees for pool ${address} on ${chain}`, error);
    return of(DEFAULT_VALUE);
  }
};

// stream$ for periodic polling to fetch data
const periodicStream$ = combineLatest([poolList$, servicesLoaded$, intervalBeat$]).pipe(
  filter(([, servicesLoaded]) => servicesLoaded),
  mergeMap<[TempusPool[], boolean, number], Observable<PoolFeesMap>>(([tempusPools]) => {
    const poolFeesMaps = tempusPools.map(fetchData);

    return merge(...poolFeesMaps);
  }),
);

const stream$ = periodicStream$.pipe(
  scan(
    (allFees, poolFees) => ({
      ...allFees,
      ...poolFees,
    }),
    {} as PoolFeesMap,
  ),
  debounce<PoolFeesMap>(() => interval(DEBOUNCE_IN_MS)),
  tap(poolFees => rawPoolFees$.next(poolFees)),
);

export const [useFees] = bind(poolFees$, DEFAULT_VALUE);

let subscription: Subscription;

export const subscribeFeesData = (): void => {
  unsubscribeFeesData();
  subscription = stream$.subscribe();
};
export const unsubscribeFeesData = (): void => subscription?.unsubscribe?.();
export const resetFeesData = (): void => rawPoolFees$.next(DEFAULT_VALUE);
