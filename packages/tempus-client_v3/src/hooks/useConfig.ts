import { bind } from '@react-rxjs/core';
import { BehaviorSubject } from 'rxjs';
import { Config } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';

export const config$ = new BehaviorSubject<Config>(getConfigManager().getConfig());

export const [useConfig] = bind(config$, {});
