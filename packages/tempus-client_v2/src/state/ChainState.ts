import { createState } from '@hookstate/core';
import { Chain } from '../interfaces/Chain';

// Currently selected chain (ethereum or fantom for now)
export const selectedChainState = createState<Chain>('fantom');
