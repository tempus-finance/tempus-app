import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { combineLatest, map, mergeMap, of } from 'rxjs';
import { Decimal, getDefinedServices, TempusPool, ZERO } from 'tempus-core-services';

export const [poolForYieldAtMaturity$, setPoolForYieldAtMaturity] = createSignal<TempusPool>();
export const [tokenAmountForYieldAtMaturity$, setTokenAmountForYieldAtMaturity] = createSignal<Decimal>();

const yieldAtMaturity$ = combineLatest([poolForYieldAtMaturity$, tokenAmountForYieldAtMaturity$]).pipe(
  mergeMap(([tempusPool, tokenAmount]) => {
    if (tokenAmount.lte(0)) {
      return of(ZERO);
    }

    const isBackingToken = true;

    try {
      const services = getDefinedServices(tempusPool.chain);
      const estimated$ = services.StatisticsService.estimatedDepositAndFix(tempusPool, tokenAmount, isBackingToken);
      return estimated$.pipe(map(principals => principals.sub(tokenAmount)));
    } catch (error) {
      console.error(
        `useYieldAtMaturity - Fail to get the Yield at Maturity for ${tempusPool.address} on ${tempusPool.chain}`,
        error,
      );
      return of(ZERO);
    }
  }),
);

export const [useYieldAtMaturity] = bind(yieldAtMaturity$, ZERO);
