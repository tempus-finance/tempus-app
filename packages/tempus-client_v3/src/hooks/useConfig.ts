import { bind } from '@react-rxjs/core';
import { filter, interval, map, startWith, take } from 'rxjs';
import { getConfigManager } from '../config/getConfigManager';

const CONFIG_RETRYING_INTERVAL_IN_MS = 5000;

export const config$ = interval(CONFIG_RETRYING_INTERVAL_IN_MS).pipe(
  startWith(0),
  map(() => {
    console.log('Fetching config!');
    return getConfigManager().getConfig();
  }),
  filter(config => {
    console.log('debug');

    return Object.keys(config).length > 0;
  }),
  take(1),
  map(() => console.log('Returning config!')),
);
export const chainList$ = config$.pipe(
  take(1),
  map(() => getConfigManager().getChainList()),
);
export const poolList$ = config$.pipe(
  take(1),
  map(() => getConfigManager().getPoolList()),
);
export const tokenList$ = config$.pipe(
  take(1),
  map(() => getConfigManager().getTokenList()),
);

export const [useConfig] = bind(config$, null);
export const [useChainList] = bind(chainList$, []);
export const [usePoolList] = bind(poolList$, []);
export const [useTokenList] = bind(tokenList$, []);
