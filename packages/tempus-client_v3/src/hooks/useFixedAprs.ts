import { bind } from '@react-rxjs/core';
import {
  catchError,
  combineLatest,
  concatMap,
  debounce,
  from,
  interval,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  scan,
  startWith,
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
} from 'tempus-core-services';
import { poolList$ } from './useConfig';

interface PoolFixedAprMap {
  [chainPoolAddress: string]: Decimal | null;
}

// TODO all polling interval constants in a file?
const APR_POLLING_INTERVAL_IN_MS = 120000;
const DEBOUNCE_IN_MS = 500;

const intervalBeat$: Observable<number> = interval(APR_POLLING_INTERVAL_IN_MS).pipe(startWith(0));

const poolAprs$: Observable<PoolFixedAprMap> = combineLatest([poolList$, intervalBeat$]).pipe(
  mergeMap<[TempusPool[], number], Observable<PoolFixedAprMap>>(([tempusPools]) => {
    const poolAprMaps = tempusPools.map(pool => {
      const { address, poolId, chain, spotPrice, maturityDate } = pool;

      if (maturityDate < Date.now()) {
        return of({
          [`${chain}-${address}`]: null,
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
            pool,
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
    });

    return merge(...poolAprMaps);
  }),
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
);

export const [useFixedAprs] = bind(poolAprs$, {});
