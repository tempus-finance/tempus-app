import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { Chain } from 'tempus-core-services';

export const [selectedChain$, setSelectedChain] = createSignal<Chain | null>();

export const [useSelectedChain] = bind<Chain | null>(selectedChain$, null);
