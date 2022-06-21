import { JsonRpcSigner } from '@ethersproject/providers';
import { ContractTransaction } from 'ethers';
import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { BehaviorSubject, combineLatest, concatMap, map, Subscription, tap } from 'rxjs';
import { Chain, Decimal, getDefinedServices } from 'tempus-core-services';

interface ApproveTokenRequest {
  chain: Chain;
  tokenAddress: string;
  amount: Decimal;
  txnId: string;
}
interface ApproveTokenRequestEnhanced extends ApproveTokenRequest {
  spenderAddress: string;
  signer?: JsonRpcSigner;
}

interface ApproveTokenStatus {
  pending: boolean;
  request?: ApproveTokenRequest;
  success?: boolean;
  error?: Error;
  contractTransaction?: ContractTransaction;
  txnId: string; // unique string to tell react it's another response
}

interface ApproveTokenResponse {
  request?: ApproveTokenRequest;
  contractTransaction?: ContractTransaction | void;
  error?: Error;
  txnId: string;
}

const [approveToken$, approveToken] = createSignal<ApproveTokenRequestEnhanced>();
export const tokenApproveStatus$ = new BehaviorSubject<ApproveTokenStatus | null>(null);

const approveTokenStream$ = combineLatest([approveToken$]).pipe(
  concatMap<[ApproveTokenRequestEnhanced], Promise<ApproveTokenResponse>>(async ([payload]) => {
    const { chain, tokenAddress, spenderAddress, amount, signer, txnId } = payload;
    const request = { chain, tokenAddress, amount };

    try {
      const Erc20TokenService = getDefinedServices(chain).ERC20TokenServiceGetter(tokenAddress, chain, signer);
      const contractTransaction = await Erc20TokenService.approve(spenderAddress, amount);
      return await Promise.resolve({
        contractTransaction,
        request,
        txnId,
      } as ApproveTokenResponse);
    } catch (error) {
      console.error(`useApproveToken - Failed to approve token ${tokenAddress} with amount ${amount} !`, error);
      return Promise.resolve({
        request,
        error,
        txnId,
      } as ApproveTokenResponse);
    }
  }),
  map<ApproveTokenResponse, ApproveTokenStatus>(response => {
    const { contractTransaction, request, error, txnId } = response;

    return contractTransaction
      ? {
          pending: false,
          success: true,
          request,
          contractTransaction: contractTransaction as ContractTransaction,
          txnId,
        }
      : { pending: false, success: false, error, request, txnId };
  }),
  tap(status => tokenApproveStatus$.next(status)),
);

const [approveTokenStatus] = bind<ApproveTokenStatus | null>(tokenApproveStatus$, null);

export const useTokenApprove = (): {
  approveTokenStatus: ApproveTokenStatus | null;
  approveToken: typeof approveToken;
} => ({
  approveTokenStatus: approveTokenStatus(),
  approveToken,
});

let subscription: Subscription;

export const subscribeApproveTokenStatus = (): void => {
  unsubscribeApproveTokenStatus();
  subscription = approveTokenStream$.subscribe();
};
export const unsubscribeApproveTokenStatus = (): void => subscription?.unsubscribe?.();
export const resetApproveTokenStatus = (): void => tokenApproveStatus$.next(null);
