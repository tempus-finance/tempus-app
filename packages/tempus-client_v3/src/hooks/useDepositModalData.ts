import { bind } from '@react-rxjs/core';
import { combineLatest, filter, map, Observable, switchMap } from 'rxjs';
import { TempusPool, ZERO } from 'tempus-core-services';
import { createSignal } from '@react-rxjs/utils';
import { MaturityTerm, TokenMetadataProp } from '../interfaces';
import { getConfigManager } from '../config/getConfigManager';
import { maturityTerm$ } from './useMaturityTerm';
import { TokenRateMap, tokenRates$ } from './useTokenRates';

export interface UseDepositModal {
  tempusPools: TempusPool[];
  poolStartDate: Date;
  maturityTerms: MaturityTerm[];
  tokens: TokenMetadataProp;
}

export const [tempusPoolsForDepositModal$, setTempusPoolsForDepositModal] = createSignal<TempusPool[]>();

const depositModalPools$ = combineLatest([tempusPoolsForDepositModal$, tokenRates$]).pipe(
  filter(([tempusPools]) => tempusPools.length > 0),
  map(([tempusPools, tokenRates]) => ({
    tempusPools,
    tokenRates,
    obsMaturityTerms: tempusPools.map(tempusPool => maturityTerm$(tempusPool)),
  })),
  switchMap(
    ({
      tempusPools,
      tokenRates,
      obsMaturityTerms,
    }: {
      tempusPools: TempusPool[];
      tokenRates: TokenRateMap;
      obsMaturityTerms: Observable<MaturityTerm>[];
    }) => combineLatest(obsMaturityTerms).pipe(map(maturityTerms => ({ maturityTerms, tokenRates, tempusPools }))),
  ),
  map(maturityTermsAndPools => {
    const { maturityTerms, tokenRates, tempusPools } = maturityTermsAndPools;

    const tokens = [
      {
        precision: tempusPools[0].tokenPrecision.backingToken,
        precisionForUI: tempusPools[0].decimalsForUI,
        address: tempusPools[0].backingTokenAddress,
        ticker: tempusPools[0].backingToken,
        rate: tokenRates[`${tempusPools[0].chain}-${tempusPools[0].backingTokenAddress}`] ?? ZERO,
      },
      {
        precision: tempusPools[0].tokenPrecision.yieldBearingToken,
        precisionForUI: tempusPools[0].decimalsForUI,
        address: tempusPools[0].yieldBearingTokenAddress,
        ticker: tempusPools[0].yieldBearingToken,
        rate: tokenRates[`${tempusPools[0].chain}-${tempusPools[0].yieldBearingTokenAddress}`] ?? ZERO,
      },
    ];

    return {
      tempusPools,
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
