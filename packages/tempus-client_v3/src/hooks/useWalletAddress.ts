import { bind } from '@react-rxjs/core';
import { Subject } from 'rxjs';

const walletAddressSubject$ = new Subject<string>();
export const setWalletAddress = (walletAddress: string): void => {
  walletAddressSubject$.next(walletAddress);
};

export const [useWalletAddress, walletAddress$] = bind(walletAddressSubject$);

/* const [walletAddress$, setWalletAddress] = createSignal<string | null>();
const state$ = state(walletAddress$, null);

export function useWalletAddress(): [string | null, typeof setWalletAddress] {
  const walletAddress = useStateObservable(state$);

  return [walletAddress, setWalletAddress];
}

export default walletAddress$; */
