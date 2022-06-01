import { bind } from '@react-rxjs/core';
import { BehaviorSubject, filter, interval, map, startWith, take, tap } from 'rxjs';
import { Config } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';

const CONFIG_RETRYING_INTERVAL_IN_MS = 5000;

const configSubject$ = new BehaviorSubject<Config>({});

interval(CONFIG_RETRYING_INTERVAL_IN_MS)
  .pipe(
    startWith(0),
    map(() => getConfigManager().getConfig()),
    filter(config => Object.keys(config).length > 0),
    tap(config => configSubject$.next(config)),
    take(1),
  )
  .subscribe();

export const [useConfig] = bind(configSubject$, {});
export const chainList$ = configSubject$.pipe(map(() => getConfigManager().getChainList()));
export const poolList$ = configSubject$.pipe(map(() => getConfigManager().getPoolList()));
export const tokenList$ = configSubject$.pipe(map(() => getConfigManager().getTokenList()));

export const [useChainList] = bind(chainList$, []);
export const [usePoolList] = bind(poolList$, []);
export const [useTokenList] = bind(tokenList$, []);
