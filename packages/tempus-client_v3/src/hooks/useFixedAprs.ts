import { bind } from '@react-rxjs/core';
import {
  catchError,
  combineLatest,
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
import { getServices, Decimal, StatisticsService, TempusPool, Chain, ZERO, ONE } from 'tempus-core-services';
import { poolList$ } from './useConfig';

interface PoolFixedAprMap {
  [chainPoolAddress: string]: Decimal;
}

// TODO all polling interval constants in a file?
const APR_POLLING_INTERVAL_IN_MS = 120000;
const DEBOUNCE_IN_MS = 500;

const intervalBeat$: Observable<number> = interval(APR_POLLING_INTERVAL_IN_MS).pipe(startWith(0));

const estimatedDepositAndFix$ = (
  statisticsService: StatisticsService,
  tempusAMMAddress: string,
  tokenAmount: Decimal,
  isBackingToken: boolean,
): Observable<Decimal> =>
  from(
    (statisticsService as StatisticsService).estimatedDepositAndFix(
      tempusAMMAddress,
      tokenAmount.toBigNumber(),
      isBackingToken,
    ),
  ).pipe(map(value => new Decimal(value)));

const estimatedMintedShares$ = (
  statisticsService: StatisticsService,
  tempusPoolAddress: string,
  tokenAmount: Decimal,
  isBackingToken: boolean,
  callOverrideData?: { blockTag: number },
): Observable<Decimal> =>
  from(
    (statisticsService as StatisticsService).estimatedMintedShares(
      tempusPoolAddress,
      tokenAmount.toBigNumber(),
      isBackingToken,
      callOverrideData,
    ),
  ).pipe(map(value => new Decimal(value)));

export const poolAprs$: Observable<PoolFixedAprMap> = combineLatest([poolList$, intervalBeat$]).pipe(
  mergeMap<[TempusPool[], number], Observable<PoolFixedAprMap>>(([tempusPools]) => {
    const poolAprMaps = tempusPools.map(({ ammAddress, address, chain, spotPrice }) => {
      const tokenAmount = new Decimal(spotPrice);
      const statisticsService = getServices(chain as Chain)?.StatisticsService as StatisticsService;

      const principals$ = estimatedDepositAndFix$(statisticsService, ammAddress, tokenAmount, true);
      const mintShares$ = estimatedMintedShares$(statisticsService, address, tokenAmount, true);

      const fixedApr$ = combineLatest([principals$, mintShares$]).pipe(
        map(([principals, estimatedMintedShares]) => {
          const ratio = principals.gt(ZERO) ? principals.div(estimatedMintedShares) : ZERO;
          const pureInterest = ratio.sub(ONE);

          // TODO needs to be calculated properly
          const scaleFactor = ONE;
          return pureInterest.mul(scaleFactor);
        }),
      );

      return fixedApr$.pipe(
        map(
          apr =>
            ({
              [`${chain}-${address}`]: apr,
            } as PoolFixedAprMap),
        ),
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
