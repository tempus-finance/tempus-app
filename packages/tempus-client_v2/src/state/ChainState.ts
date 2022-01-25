import { createState } from '@hookstate/core';

type Chains = 'ethereum' | 'fantom';

// Currently selected chain (ethereum or fantom for now)
export const selectedChainState = createState<Chains>('fantom');
