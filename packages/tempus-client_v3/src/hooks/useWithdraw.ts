import { ContractTransaction } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { concatMap, map, BehaviorSubject, Subscription, tap, filter, take } from 'rxjs';
import { Chain, Decimal, getDefinedServices, TempusPool, Ticker } from 'tempus-core-services';
import { notifyTransaction } from './useNotifications';
import { poolList$ } from './usePoolList';
import { emitAppEvent } from './useAppEvent';

interface WithdrawRequest {
  chain: Chain;
  poolAddress: string;
  amount: Decimal;
  token: Ticker;
  tokenAddress: string;
  tokenBalance: Decimal;
  capitalsBalance: Decimal;
  yieldsBalance: Decimal;
  lpBalance: Decimal;
  slippage: Decimal;
  signer: JsonRpcSigner;
  txnId: string;
}

interface WithdrawStatus {
  pending: boolean;
  request?: WithdrawRequest;
  success?: boolean;
  error?: Error;
  contractTransaction?: ContractTransaction;
  transactionData?: {
    withdrawnAmount: Decimal;
  };
  txnId: string;
}

interface WithdrawResponse {
  request?: WithdrawRequest;
  contractTransaction?: ContractTransaction | void;
  transactionData?: {
    withdrawnAmount: Decimal;
  };
  error?: Error;
  txnId: string;
}

const [withdraw$, withdraw] = createSignal<WithdrawRequest>();
const withdrawStatus$ = new BehaviorSubject<WithdrawStatus | null>(null);

const stream$ = withdraw$.pipe(
  concatMap<WithdrawRequest, Promise<WithdrawResponse>>(async payload => {
    const {
      chain,
      poolAddress,
      amount,
      token,
      tokenAddress,
      tokenBalance,
      capitalsBalance,
      yieldsBalance,
      lpBalance,
      slippage,
      signer,
      txnId,
    } = payload;
    const request = { chain, poolAddress, amount, token, txnId };

    withdrawStatus$.next({ pending: true, txnId });
    notifyTransaction('pending', {
      transactionType: 'withdraw',
      chain,
      tokenAddress,
      tokenAmount: amount.toString(),
      txnId,
    });

    try {
      const withdrawService = getDefinedServices(chain).WithdrawService;
      const result = await withdrawService.withdraw(
        poolAddress,
        amount,
        token,
        tokenAddress,
        tokenBalance,
        capitalsBalance,
        yieldsBalance,
        lpBalance,
        slippage,
        signer,
      );

      return await Promise.resolve({
        contractTransaction: result.contractTransaction,
        transactionData: {
          withdrawnAmount: result.withdrawnAmount,
        },
        request,
        txnId,
      } as WithdrawResponse);
    } catch (error) {
      console.error('useWithdraw - Failed to withdraw specified amount!', error);
      return Promise.resolve({
        request,
        error,
        txnId,
      } as WithdrawResponse);
    }
  }),
  map<WithdrawResponse, WithdrawStatus>(response => {
    const { contractTransaction, transactionData, request, error, txnId } = response;

    return contractTransaction
      ? {
          pending: false,
          success: true,
          request,
          contractTransaction,
          transactionData,
          txnId,
        }
      : { pending: false, success: false, request, error, txnId };
  }),
  tap(status => {
    const { chain, poolAddress, tokenAddress, amount, txnId } = status.request as WithdrawRequest;
    withdrawStatus$.next(status);
    notifyTransaction(status.success ? 'success' : 'failure', {
      transactionType: 'withdraw',
      chain,
      poolAddress,
      tokenAddress,
      tokenAmount: amount.toString(),
      timestamp: status.contractTransaction?.timestamp ?? Date.now(),
      txnHash: status.contractTransaction?.hash,
      error: status.error?.message,
      txnId,
    });

    if (status.success) {
      const contractTransaction = status.contractTransaction as ContractTransaction;

      poolList$
        .pipe(
          map(poolList => poolList.find(pool => pool.address === poolAddress && pool.chain === chain)),
          filter(tempusPool => Boolean(tempusPool)),
          tap(tempusPool => {
            emitAppEvent({
              eventType: 'withdraw',
              tempusPool: tempusPool as TempusPool,
              txnHash: contractTransaction?.hash,
              timestamp: contractTransaction?.timestamp ?? Date.now(),
            });
          }),
          take(1),
        )
        .subscribe();
    }
  }),
);

const [withdrawStatus] = bind<WithdrawStatus | null>(withdrawStatus$, null);

export const useWithdraw = (): {
  withdrawStatus: WithdrawStatus | null;
  withdraw: (payload: WithdrawRequest) => void;
} => ({
  withdrawStatus: withdrawStatus(),
  withdraw,
});

let subscription: Subscription;

export const subscribeWithdrawStatus = (): void => {
  unsubscribeWithdrawStatus();
  subscription = stream$.subscribe();
};
export const unsubscribeWithdrawStatus = (): void => subscription?.unsubscribe?.();
export const resetWithdrawStatus = (): void => withdrawStatus$.next(null);
