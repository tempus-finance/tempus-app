import { ContractTransaction } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { concatMap, map, of, from, Observable, tap, BehaviorSubject, Subscription, catchError } from 'rxjs';
import { Chain, Decimal, getDefinedServices, Ticker } from 'tempus-core-services';

interface FixedDepositRequest {
  chain: Chain;
  poolAddress: string;
  tokenAmount: Decimal;
  tokenTicker: Ticker;
  tokenAddress: string;
  slippage: Decimal;
  signer: JsonRpcSigner;
  txnId: string;
}

interface FixedDepositStatus {
  pending: boolean;
  request?: FixedDepositRequest;
  success?: boolean;
  error?: Error;
  contractTransaction?: ContractTransaction;
  transactionData?: {
    depositedAmount: Decimal;
  };
  txnId: string;
}

interface FixedDepositResponse {
  request?: FixedDepositRequest;
  contractTransaction?: ContractTransaction | void;
  transactionData?: {
    depositedAmount: Decimal;
  };
  error?: Error;
  txnId: string;
}

const [fixedDeposit$, fixedDeposit] = createSignal<FixedDepositRequest>();
const fixedDepositStatus$ = new BehaviorSubject<FixedDepositStatus | null>(null);

const stream$ = fixedDeposit$.pipe(
  concatMap<FixedDepositRequest, Observable<FixedDepositResponse>>(payload => {
    const { chain, poolAddress, tokenAmount, tokenTicker, tokenAddress, slippage, signer, txnId } = payload;
    const request = { chain, poolAddress, tokenAmount, tokenTicker, tokenAddress };

    fixedDepositStatus$.next({ pending: true, txnId });

    try {
      const result$ = from(
        getDefinedServices(chain).DepositService.fixedDeposit(
          poolAddress,
          tokenAmount,
          tokenTicker,
          tokenAddress,
          slippage,
          signer,
        ),
      );

      return result$.pipe(
        map(
          ({ contractTransaction, depositedAmount }) =>
            ({
              contractTransaction,
              transactionData: {
                depositedAmount,
              },
              request,
              txnId,
            } as FixedDepositResponse),
        ),
        catchError(error => {
          console.error('useFixedDeposits - Failed to execute fixed deposit!', error);
          return of({
            request,
            error,
            txnId,
          } as FixedDepositResponse);
        }),
      );
    } catch (error) {
      console.error('useFixedDeposits - Failed to execute fixed deposit!', error);
      return of({
        request,
        error,
        txnId,
      } as FixedDepositResponse);
    }
  }),
  map<FixedDepositResponse, FixedDepositStatus>(response => {
    const { contractTransaction, transactionData, request, error, txnId } = response;

    return contractTransaction && transactionData
      ? {
          pending: false,
          success: true,
          request,
          contractTransaction,
          transactionData,
          txnId,
        }
      : { pending: false, success: false, error, request, txnId };
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
