import { of, combineLatest, mergeMap } from 'rxjs';
import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { DEFAULT_DECIMAL_PRECISION, Decimal } from 'tempus-core-services';
import { TokenMetadataProp } from '../interfaces';
// import { tokenRates$ } from './useTokenRates';
import { poolList$ } from './useConfig';

export const [tempusPoolForWithdrawModal$, setTempusPoolForWithdrawModal] = createSignal<string>();

const withdrawModalProps$ = combineLatest([tempusPoolForWithdrawModal$, poolList$]).pipe(
  mergeMap(([tempusPoolAddress, tempusPools]) => {
    const tempusPool = tempusPools.find(value => value.address === tempusPoolAddress);
    if (!tempusPool) {
      return of(null);
    }

    // const yieldBearingTokenId = `${tempusPool.chain}-${tempusPool.yieldBearingTokenAddress}`;

    const tokens: TokenMetadataProp = [
      {
        precision: DEFAULT_DECIMAL_PRECISION,
        rate: new Decimal(0),
        ticker: tempusPool.yieldBearingToken,
      },
    ];

    // We do not support withdrawals to ETH
    if (tempusPool.backingToken !== 'ETH') {
      // const backingTokenId = `${tempusPool.chain}-${tempusPool.backingTokenAddress}`;

      tokens.unshift({
        precision: DEFAULT_DECIMAL_PRECISION,
        rate: new Decimal(0),
        ticker: tempusPool.backingToken,
      });
    }

    return of(tokens);
  }),
);

export const [useWithdrawModalProps] = bind(withdrawModalProps$, null);
