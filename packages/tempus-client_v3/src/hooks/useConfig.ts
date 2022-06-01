import { bind } from '@react-rxjs/core';
import { BehaviorSubject, map } from 'rxjs';
import { Config } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';

const configSubject$ = new BehaviorSubject<Config>(getConfigManager().getConfig());

export const chainList$ = configSubject$.pipe(map(() => getConfigManager().getChainList()));
export const poolList$ = configSubject$.pipe(map(() => getConfigManager().getPoolList()));
export const tokenList$ = configSubject$.pipe(map(() => getConfigManager().getTokenList()));

export const [useConfig] = bind(configSubject$, {});
export const [useChainList] = bind(chainList$, []);
export const [usePoolList] = bind(poolList$, []);
export const [useTokenList] = bind(tokenList$, []);
