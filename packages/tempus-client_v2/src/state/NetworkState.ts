import { createState } from '@hookstate/core';

export type Networks = 'ethereum-mainnet' | 'fantom-mainnet';

// Currently selected chain (ethereum or fantom for now)
export const selectedNetworkState = createState<Networks>('fantom-mainnet');
