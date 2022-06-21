import { ContractTransaction } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { concatMap, map, of, from, Observable, tap, BehaviorSubject, Subscription, catchError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Chain, Decimal, getDefinedServices, Ticker } from 'tempus-core-services';

interface FixedDepositRequest {
  chain: Chain;
  poolAddress: string;
  tokenAmount: Decimal;
  tokenTicker: Ticker;
  tokenAddress: string;
  slippage: Decimal;
  signer: JsonRpcSigner;
}

interface FixedDepositStatus {
  pending: boolean;
  request?: FixedDepositRequest;
  success?: boolean;
  error?: Error;
  contractTransaction?: ContractTransaction;
  txnId: string; // unique string to tell react it's another response
}

interface FixedDepositResponse {
  request?: FixedDepositRequest;
  contractTransaction?: ContractTransaction | void;
  error?: Error;
}

const [fixedDeposit$, fixedDeposit] = createSignal<FixedDepositRequest>();
const fixedDepositStatus$ = new BehaviorSubject<FixedDepositStatus | null>(null);

const stream$ = fixedDeposit$.pipe(
  concatMap<FixedDepositRequest, Observable<FixedDepositResponse>>(payload => {
    const { chain, poolAddress, tokenAmount, tokenTicker, tokenAddress, slippage, signer } = payload;
    const request = { chain, poolAddress, tokenAmount, tokenTicker, tokenAddress };

    try {
      const contractTransaction$ = from(
        getDefinedServices(chain).DepositService.fixedDeposit(
          poolAddress,
          tokenAmount,
          tokenTicker,
          tokenAddress,
          slippage,
          signer,
        ),
      );

      return contractTransaction$.pipe(
        map(
          contractTransaction =>
            ({
              contractTransaction,
              request,
            } as FixedDepositResponse),
        ),
        catchError(error => {
          console.error('useFixedDeposits - Failed to execute fixed deposit!', error);
          return of({
            request,
            error,
          } as FixedDepositResponse);
        }),
      );
    } catch (error) {
      console.error('useFixedDeposits - Failed to execute fixed deposit!', error);
      return of({
        request,
        error,
      } as FixedDepositResponse);
    }
  }),
  map<FixedDepositResponse, FixedDepositStatus>(response => {
    const { contractTransaction, request, error } = response;

    return contractTransaction
      ? {
          pending: false,
          success: true,
          request,
          contractTransaction,
          txnId: contractTransaction.hash, // to access txn hash plz still access contractTransaction.hash
        }
      : { pending: false, success: false, error, request, txnId: uuidv4() };
  }),
  tap(status => fixedDepositStatus$.next(status)),
);

const [fixedDepositStatus] = bind<FixedDepositStatus | null>(fixedDepositStatus$, null);

export const useFixedDeposit = (): {
  fixedDepositStatus: FixedDepositStatus | null;
  fixedDeposit: (payload: FixedDepositRequest) => void;
} => ({
  fixedDepositStatus: fixedDepositStatus(),
  fixedDeposit,
});

let subscription: Subscription;

export const subscribeFixedDepositStatus = (): void => {
  unsubscribeFixedDepositStatus();
  subscription = stream$.subscribe();
};
export const unsubscribeFixedDepositStatus = (): void => subscription?.unsubscribe?.();
export const resetFixedDepositStatus = (): void => fixedDepositStatus$.next(null);
