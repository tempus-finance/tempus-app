import { bind } from '@react-rxjs/core';
import { Subject } from 'rxjs';

const walletAddressSubject$ = new Subject<string>();
export const setWalletAddress = (walletAddress: string): void => {
  walletAddressSubject$.next(walletAddress);
};

export const [useWalletAddress, walletAddress$] = bind(walletAddressSubject$);
