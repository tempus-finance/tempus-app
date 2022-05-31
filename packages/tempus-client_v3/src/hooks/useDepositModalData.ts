import { bind } from '@react-rxjs/core';
import { combineLatest, filter, map, Observable, switchMap } from 'rxjs';
import { Decimal, TempusPool } from 'tempus-core-services';
import { createSignal } from '@react-rxjs/utils';
import { MaturityTerm, TokenMetadataProp } from '../interfaces';
import { getConfigManager } from '../config/getConfigManager';
import { maturityTerm$ } from './useMaturityTerm';

export interface UseDepositModal {
  poolStartDate: Date;
  maturityTerms: MaturityTerm[];
  tokens: TokenMetadataProp;
}

export const [tempusPoolsForDepositModal$, setTempusPoolsForDepositModal] = createSignal<TempusPool[]>();

const depositModalPools$ = tempusPoolsForDepositModal$.pipe(
  filter(tempusPools => tempusPools.length > 0),
  map(tempusPools => ({
    tempusPools,
    obsMaturityTerms: tempusPools.map(tempusPool => maturityTerm$(tempusPool)),
  })),
  switchMap(
    ({ tempusPools, obsMaturityTerms }: { tempusPools: TempusPool[]; obsMaturityTerms: Observable<MaturityTerm>[] }) =>
      combineLatest(obsMaturityTerms).pipe(map(maturityTerms => ({ maturityTerms, tempusPools }))),
  ),
  map(maturityTermsAndPools => {
    const { maturityTerms, tempusPools } = maturityTermsAndPools;

    const tokens = tempusPools.map(pool => ({
      precision: pool.tokenPrecision.backingToken,
      ticker: pool.backingToken,
      // TODO needs proper hook
      rate: new Decimal('1'),
    }));

    return {
      poolStartDate: getConfigManager().getEarliestStartDate(
        tempusPools[0].chain,
        tempusPools[0].backingToken,
        tempusPools[0].protocol,
      ),
      maturityTerms,
      tokens: tokens as TokenMetadataProp,
    };
  }),
);

const [useDepositModalProps] = bind(depositModalPools$, null);
export const useDepositModalData = (): (() => UseDepositModal | null) => useDepositModalProps;
