import { state, useStateObservable } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';

const [walletAddress$, setWalletAddress] = createSignal<string>();
const stateWalletAddress$ = state(walletAddress$, '');

export function useWalletAddress(): [string, (address: string) => void] {
  const walletAddress = useStateObservable(stateWalletAddress$);

  return [walletAddress, setWalletAddress];
}

export { walletAddress$ };
