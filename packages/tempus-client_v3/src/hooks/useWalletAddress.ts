import { BehaviorSubject, of, combineLatestWith, filter, tap, take } from 'rxjs';
import { bind } from '@react-rxjs/core';

export const walletAddress$ = new BehaviorSubject<string>('');

export function setWalletAddress(address: string): void {
  of(address)
    .pipe(
      combineLatestWith(walletAddress$),
      filter(([newAddress, currentAddress]) => newAddress !== currentAddress),
      tap(([newAddress]) => walletAddress$.next(newAddress)),
      take(1),
    )
    .subscribe();
}
export const [useWalletAddress] = bind(walletAddress$);
