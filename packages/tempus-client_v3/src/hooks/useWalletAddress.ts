import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';

const [walletAddress$, setWalletAddress] = createSignal<string | null>();
const state$ = state(walletAddress$, null);

export function useWalletAddress(): [string | null, typeof setWalletAddress] {
  const walletAddress = useStateObservable(state$);

  return [walletAddress, setWalletAddress];
}
