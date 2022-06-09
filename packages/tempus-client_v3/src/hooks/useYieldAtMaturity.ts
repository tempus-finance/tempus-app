import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { combineLatest, map, mergeMap, of } from 'rxjs';
import { Decimal, getServices, StatisticsService, TempusPool, ZERO } from 'tempus-core-services';

export const [poolForYieldAtMaturity$, setPoolForYieldAtMaturity] = createSignal<TempusPool>();
export const [tokenAmountForYieldAtMaturity$, setTokenAmountForYieldAtMaturity] = createSignal<Decimal>();

const yieldAtMaturity$ = combineLatest([poolForYieldAtMaturity$, tokenAmountForYieldAtMaturity$]).pipe(
  mergeMap(([tempusPool, tokenAmount]) => {
    if (tokenAmount.lte(0)) {
      return of(ZERO);
    }

    return (getServices(tempusPool.chain)?.StatisticsService as StatisticsService)
      .estimatedDepositAndFix(tempusPool, tokenAmount, true)
      .pipe(map(principals => principals.sub(tokenAmount)));
  }),
);

export const [useYieldAtMaturity] = bind(yieldAtMaturity$, ZERO);
