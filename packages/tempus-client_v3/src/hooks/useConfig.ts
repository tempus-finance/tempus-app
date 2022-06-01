import { bind } from '@react-rxjs/core';
import { BehaviorSubject } from 'rxjs';
import { Config } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';

const configSubject = new BehaviorSubject<Config>(getConfigManager().getConfig());
export const config$ = configSubject.asObservable();

export const [useConfig] = bind(config$, {});
