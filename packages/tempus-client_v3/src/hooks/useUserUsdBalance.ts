import { bind } from '@react-rxjs/core';
import { map } from 'rxjs';
import { Decimal, ZERO } from 'tempus-core-services';
import { poolBalances$ } from './usePoolBalance';

const userUsdBalance$ = poolBalances$.pipe(
  map(poolBalances =>
    Object.values(poolBalances).reduce(
      (sum, balance) => (balance.balanceInUsd ? balance.balanceInUsd.add(sum ?? ZERO) : sum),
      null as Decimal | null,
    ),
  ),
);

export const [useUserUsdBalance] = bind<Decimal | null>(userUsdBalance$, null);
