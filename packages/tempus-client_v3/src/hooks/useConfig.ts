import { bind } from '@react-rxjs/core';
import { filter, interval, map, take } from 'rxjs';
import { getConfigManager } from '../config/getConfigManager';

const CONFIG_RETRYING_INTERVAL_IN_MS = 5000;

export const config$ = interval(CONFIG_RETRYING_INTERVAL_IN_MS).pipe(
  map(() => getConfigManager().getConfig()),
  filter(config => Object.keys(config).length > 0),
  take(1),
);

export const [useConfig] = bind(config$, null);
