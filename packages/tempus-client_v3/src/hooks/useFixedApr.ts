import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import {
  catchError,
  combineLatest,
  combineLatestWith,
  filter,
  from,
  interval,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  take,
} from 'rxjs';
import { getServices, Decimal, StatisticsService, TempusPool, Chain } from 'tempus-core-services';

// TODO move to constants
const ZERO = new Decimal(0);
const ONE = new Decimal('1');

// TODO all polling interval constants in a file?
const APR_POLLING_INTERVAL_IN_MS = 5000;

const [tempusPool$, setTempusPool] = createSignal<TempusPool>();
const [tokenAmount$, setTokenAmount] = createSignal<Decimal>();

const aprData$ = (): Observable<Decimal> => {
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
    ).pipe(switchMap(value => of(new Decimal(value))));

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
    ).pipe(switchMap(value => of(new Decimal(value))));

  return combineLatest([tempusPool$, intervalBeat$]).pipe(
    map(([tempusPool]) => tempusPool),
    combineLatestWith(tokenAmount$.pipe(startWith(ZERO))),
    map(([tempusPool, tokenAmount]) => ({
      tempusPool,
      tokenAmount: tokenAmount.gt(ZERO) ? tokenAmount : new Decimal(tempusPool.spotPrice),
      statisticsService: getServices(tempusPool.chain as Chain)?.StatisticsService as StatisticsService,
    })),
    filter(
      (result: { tempusPool: TempusPool; tokenAmount: Decimal; statisticsService: StatisticsService }) =>
        !!result.statisticsService,
    ),
    take(1),
    switchMap(
      ({
        tempusPool,
        tokenAmount,
        statisticsService,
      }: {
        tempusPool: TempusPool;
        tokenAmount: Decimal;
        statisticsService: StatisticsService;
      }) =>
        combineLatest([
          intervalBeat$,
          estimatedDepositAndFix$(statisticsService, tempusPool.ammAddress, tokenAmount, true),
          estimatedMintedShares$(statisticsService, tempusPool.address, tokenAmount, true),
        ]),
    ),
    map(([, principals, estimatedMintedShares]) => {
      const ratio = principals.gt(ZERO) ? principals.div(estimatedMintedShares) : ZERO;
      const pureInterest = ratio.sub(ONE);

      // TODO needs to be calculated properly
      const scaleFactor = ONE;
      return pureInterest.mul(scaleFactor);
    }),
    catchError(error => {
      console.error('useFixedApr - aprData', error);
      return of(ZERO);
    }),
  );
};

export const useFixedApr = (tp: TempusPool): [() => Decimal, (tokenAmount: Decimal) => void] => {
  const [useApr] = bind(aprData$(), ZERO);
  setTimeout(() => {
    setTempusPool(tp);
  }, 0);
  return [useApr, setTokenAmount];
};
