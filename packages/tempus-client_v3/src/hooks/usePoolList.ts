import { BehaviorSubject, map } from 'rxjs';
import { bind } from '@react-rxjs/core';
import { TempusPool } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';

interface PoolMap {
  [chainPoolAddress: string]: TempusPool;
}

export const poolList$ = new BehaviorSubject<TempusPool[]>(getConfigManager().getPoolList());
export const poolMap$ = poolList$.pipe(
  map(poolList => poolList.reduce((m, pool) => ({ ...m, [`${pool.chain}-${pool.address}`]: pool }), {} as PoolMap)),
);

export const [usePoolList] = bind(poolList$, []);
export const [usePoolMap] = bind(poolMap$, {});
