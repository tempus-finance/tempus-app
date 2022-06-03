import { BehaviorSubject } from 'rxjs';
import { bind } from '@react-rxjs/core';

export const walletAddress$ = new BehaviorSubject<string>('');

export function setWalletAddress(address: string): void {
  const currentAddress = walletAddress$.getValue();

  // We don't want to set same address multiple times because that would
  // trigger unnecessary fetch in other hooks that depend on wallet address
  if (currentAddress !== address) {
    walletAddress$.next(address);
  }
}
export const [useWalletAddress] = bind(walletAddress$);
