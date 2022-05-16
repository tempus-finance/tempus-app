import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import {
  catchError,
  combineLatest,
  filter,
  from,
  interval,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { getServices, Decimal, StatisticsService, TempusPool, Chain } from 'tempus-core-services';

const ZERO = new Decimal(0);
const APR_POLLING_INTERVAL_IN_MS = 10000;

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

  return combineLatest([intervalBeat$, tempusPool$, tokenAmount$]).pipe(
    tap(([i, tempusPool, tokenAmount]) => console.log('tap 1 ===>', i, tempusPool, tokenAmount)),
    map(([, tempusPool, tokenAmount]) => ({ tempusPool, tokenAmount })),

    map(({ tempusPool, tokenAmount }) => ({
      tempusPool,
      tokenAmount: tokenAmount || new Decimal(tempusPool.spotPrice),
      statisticsService: getServices(tempusPool.chain as Chain)?.StatisticsService,
    })),
    tap((result: { tempusPool: TempusPool; tokenAmount: Decimal; statisticsService: StatisticsService }) =>
      console.log('service ===>', result.statisticsService),
    ),
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
      const ratio = principals.toString() !== '0' ? principals.div(estimatedMintedShares) : ZERO;
      const pureInterest = ratio.sub(new Decimal('1'));

      // TODO needs to be calculated
      const scaleFactor = new Decimal('1');
      return pureInterest.mul(scaleFactor);
    }),
    catchError(error => {
      console.error('useFixedApr - aprData', error);
      return of(ZERO);
    }),
  );
};

export const useFixedApr = (): [() => Decimal, (tempusPool: TempusPool) => void, (tokenAmount: Decimal) => void] => {
  const [useApr] = bind(aprData$(), ZERO);
  console.log('useFixedApr');
  return [useApr, setTempusPool, setTokenAmount];
};
