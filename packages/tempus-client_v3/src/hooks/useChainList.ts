import { BehaviorSubject } from 'rxjs';
import { bind } from '@react-rxjs/core';
import { Chain } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';

const chainListSubject$ = new BehaviorSubject<Chain[]>(getConfigManager().getChainList());

export const [useChainList] = bind(chainListSubject$, []);
