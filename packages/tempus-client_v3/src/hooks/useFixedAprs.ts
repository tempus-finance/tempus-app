import { bind } from '@react-rxjs/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concatMap,
  debounce,
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
  getServices,
  Decimal,
  StatisticsService,
  TempusPool,
  Chain,
  ONE,
  TempusControllerService,
  VaultService,
  SECONDS_IN_A_DAY,
  DAYS_IN_A_YEAR,
  getDefaultProvider,
  ZERO,
} from 'tempus-core-services';
import { POLLING_INTERVAL_IN_MS, DEBOUNCE_IN_MS } from '../constants';
import { poolList$ } from './usePoolList';
import { servicesLoaded$ } from './useServicesLoaded';
import { appEvent$ } from './useAppEvent';

export interface PoolFixedAprMap {
  [chainPoolAddress: string]: Decimal;
}

const DEFAULT_VALUE: PoolFixedAprMap = {};

const intervalBeat$: Observable<number> = interval(POLLING_INTERVAL_IN_MS).pipe(startWith(0));

export const poolAprs$ = new BehaviorSubject<PoolFixedAprMap>(DEFAULT_VALUE);

const fetchData = (tempusPool: TempusPool): Observable<PoolFixedAprMap> => {
  const { address, poolId, chain, spotPrice, maturityDate } = tempusPool;

  if (maturityDate < Date.now()) {
    return of({
      [`${chain}-${address}`]: ZERO,
    } as PoolFixedAprMap);
  }

  const tempusControllerService = getServices(chain as Chain)?.TempusControllerService as TempusControllerService;
  const vaultService = getServices(chain as Chain)?.VaultService as VaultService;
  const statisticsService = getServices(chain as Chain)?.StatisticsService as StatisticsService;

  const tokenAmount = new Decimal(spotPrice);

  const latestEventBlock$ = from(
    Promise.all([
      tempusControllerService.getDepositedEvents({ forPool: address }),
      vaultService.getSwapEvents({ forPoolId: poolId }),
      tempusControllerService.getRedeemedEvents({ forPool: address }),
    ]).then(([depositedEvents, swapEvents, redeemedEvents]) => {
      const allEvents = [...depositedEvents, ...swapEvents, ...redeemedEvents];
      const latestEventBlockNumber = Math.max(0, ...allEvents.map(event => event.blockNumber));
      const provider = getDefaultProvider(chain as Chain);

      if (latestEventBlockNumber > 0) {
        return provider.getBlock(latestEventBlockNumber);
      }

      return undefined;
    }),
  );

  const principals$ = latestEventBlock$.pipe(
    concatMap(latestEventBlock => {
      const estimateCallOverrides =
        latestEventBlock && latestEventBlock.number > 0 ? { blockTag: latestEventBlock.number } : undefined;
      const estimateDepositAndFixFromBackingToken = true;

      return statisticsService.estimatedDepositAndFix(
        tempusPool,
        tokenAmount,
        estimateDepositAndFixFromBackingToken,
        estimateCallOverrides,
      );
    }),
  );

  return combineLatest([latestEventBlock$, principals$]).pipe(
    map(([latestEventBlock, principals]) => {
      const currentFixedAPRTime = latestEventBlock ? latestEventBlock.timestamp * 1000 : Date.now();
      const poolTimeRemaining = (maturityDate - currentFixedAPRTime) / 1000;
      const scaleFactor = new Decimal((SECONDS_IN_A_DAY * DAYS_IN_A_YEAR) / poolTimeRemaining);
      const ratio = principals.div(tokenAmount);
      const pureInterest = ratio.sub(ONE);

      return {
        [`${chain}-${address}`]: pureInterest.mul(scaleFactor),
      } as PoolFixedAprMap;
    }),
  );
};

// stream$ for periodic polling to fetch data
const periodicStream$: Observable<PoolFixedAprMap> = combineLatest([poolList$, servicesLoaded$, intervalBeat$]).pipe(
  filter(([, servicesLoaded]) => servicesLoaded),
  mergeMap<[TempusPool[], boolean, number], Observable<PoolFixedAprMap>>(([tempusPools]) => {
    const poolAprMaps = tempusPools.map(fetchData);
    return merge(...poolAprMaps);
  }),
);

// stream$ for listening to Tempus event to fetch specific pool data
const eventStream$ = combineLatest([appEvent$, servicesLoaded$]).pipe(
  filter(([, servicesLoaded]) => servicesLoaded),
  mergeMap<[{ tempusPool: TempusPool }, boolean], Observable<PoolFixedAprMap>>(([{ tempusPool }]) =>
    fetchData(tempusPool),
  ),
);

// merge all stream$ into one
const stream$ = merge(periodicStream$, eventStream$).pipe(
  scan(
    (allAprs, poolApr) => ({
      ...allAprs,
      ...poolApr,
    }),
    {} as PoolFixedAprMap,
  ),
  debounce(() => interval(DEBOUNCE_IN_MS)),
  catchError(error => {
    console.error('useFixedAprs - Failed to fetch fixed APR for pools', error);
    return of({});
  }),
  tap(poolTvls => poolAprs$.next(poolTvls)),
);

export const [useFixedAprs] = bind(poolAprs$, {});

let subscription: Subscription = stream$.subscribe();

export const subscribe = (): void => {
  unsubscribe();
  subscription = stream$.subscribe();
};
export const unsubscribe = (): void => subscription?.unsubscribe?.();
export const reset = (): void => poolAprs$.next(DEFAULT_VALUE);
