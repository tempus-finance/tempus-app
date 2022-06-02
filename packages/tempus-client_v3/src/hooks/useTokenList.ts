import { BehaviorSubject } from 'rxjs';
import { bind } from '@react-rxjs/core';
import { getConfigManager } from '../config/getConfigManager';
import { TokenListItem } from '../config/ConfigManager';

export const tokenList$ = new BehaviorSubject<TokenListItem[]>(getConfigManager().getTokenList());

export const [useTokenList] = bind(tokenList$, []);
