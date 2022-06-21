import { bind } from '@react-rxjs/core';
import { combineLatest, map } from 'rxjs';
import { ZERO } from 'tempus-core-services';
import { poolList$ } from './usePoolList';
import { tokenBalanceMap$ } from './useTokenBalance';

export const userDepositedPools$ = combineLatest([poolList$, tokenBalanceMap$]).pipe(
  map(([poolList, tokenBalanceMap]) => {
    const filteredPools = poolList.filter(tempusPool => {
      const principalsBalance = tokenBalanceMap[`${tempusPool.chain}-${tempusPool.principalsAddress}`];
      const yieldsBalance = tokenBalanceMap[`${tempusPool.chain}-${tempusPool.yieldsAddress}`];
      const lpTokenBalance = tokenBalanceMap[`${tempusPool.chain}-${tempusPool.ammAddress}`];

      return principalsBalance?.gt(ZERO) || yieldsBalance?.gt(ZERO) || lpTokenBalance?.gt(ZERO);
    });

    return filteredPools;
  }),
);

export const [useUserDepositedPools] = bind(userDepositedPools$, []);
