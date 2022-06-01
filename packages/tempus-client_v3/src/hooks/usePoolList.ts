import { BehaviorSubject } from 'rxjs';
import { bind } from '@react-rxjs/core';
import { TempusPool } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';

export const poolList$ = new BehaviorSubject<TempusPool[]>(getConfigManager().getPoolList());

export const [usePoolList] = bind(poolList$, []);
