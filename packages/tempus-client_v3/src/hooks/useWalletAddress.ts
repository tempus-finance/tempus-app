import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { distinctUntilChanged } from 'rxjs';

const [rawWalletAddress$, setWalletAddress] = createSignal<string>();
export const walletAddress$ = rawWalletAddress$.pipe(distinctUntilChanged());
const stateWalletAddress$ = state(walletAddress$, '');

export function useWalletAddress(): [string, (address: string) => void] {
  const walletAddress = useStateObservable(stateWalletAddress$);

  return [walletAddress, setWalletAddress];
}
