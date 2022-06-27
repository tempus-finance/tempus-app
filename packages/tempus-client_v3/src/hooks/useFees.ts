import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';
import {
  Chain,
  Decimal,
  DEFAULT_TOKEN_PRECISION,
  getDefinedServices,
  getTempusAMMService,
  TempusPool,
} from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';

export interface Fees {
  deposit?: Decimal;
  redemption?: Decimal;
  earlyRedemption?: Decimal;
  swap?: Decimal;
}

export const [poolForFees$, setPoolForFees] = createSignal<TempusPool>();

const poolFees$ = (chain: Chain, tempusPoolAddress: string): Observable<Decimal[]> =>
  getDefinedServices(chain).TempusPoolService.getFeesConfig(tempusPoolAddress);

const swapFee$ = (chain: Chain, tempusAmmAddress: string): Observable<Decimal> => {
  const { getChainConfig } = getConfigManager();
  return from(getTempusAMMService(chain, getChainConfig).getSwapFeePercentage(tempusAmmAddress)).pipe(
    map(fee => new Decimal(fee, DEFAULT_TOKEN_PRECISION)),
  );
};

const fees$ = poolForFees$.pipe(
  switchMap(poolForFees =>
    combineLatest([
      poolFees$(poolForFees.chain, poolForFees.address),
      swapFee$(poolForFees.chain, poolForFees.ammAddress),
    ]).pipe(
      map(([poolFees, swapFee]) => {
        const [deposit, earlyRedemption, redemption] = poolFees;
        return {
          deposit,
          redemption,
          earlyRedemption,
          swap: swapFee,
        } as Fees;
      }),
    ),
  ),
);

export const [useFees] = bind(fees$, {});
