import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';

export const [selectedChain$, setSelectedChain] = createSignal<string | null>();

export const [useSelectedChain] = bind<string | null>(selectedChain$, null);
