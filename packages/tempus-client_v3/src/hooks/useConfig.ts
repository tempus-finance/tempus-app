import { bind } from '@react-rxjs/core';
import { BehaviorSubject, map } from 'rxjs';
import { Config } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';

const configSubject$ = new BehaviorSubject<Config>(getConfigManager().getConfig());

export const tokenList$ = configSubject$.pipe(map(() => getConfigManager().getTokenList()));

export const [useConfig] = bind(configSubject$, {});
export const [useTokenList] = bind(tokenList$, []);
