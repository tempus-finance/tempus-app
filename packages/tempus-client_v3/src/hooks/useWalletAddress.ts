import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';

export const [walletAddress$, setWalletAddress] = createSignal<string>();

export const [useWalletAddress] = bind<string>(walletAddress$, '');
