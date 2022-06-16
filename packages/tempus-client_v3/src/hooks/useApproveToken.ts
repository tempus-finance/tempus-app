import { JsonRpcSigner } from '@ethersproject/providers';
import { ContractTransaction } from 'ethers';
import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { combineLatest, concatMap, map } from 'rxjs';
import { Chain, Decimal, getDefinedServices } from 'tempus-core-services';

interface ApproveTokenRequest {
  chain: Chain;
  tokenAddress: string;
  amount: Decimal;
}
interface ApproveTokenRequestEnhanced extends ApproveTokenRequest {
  spenderAddress: string;
  signer?: JsonRpcSigner;
}

interface ApproveTokenStatus {
  pending: boolean;
  request?: ApproveTokenRequest;
  success?: boolean;
  contractTransaction?: ContractTransaction;
}

interface ApproveTokenResponse {
  request?: ApproveTokenRequest;
  contractTransaction?: ContractTransaction | void;
}

const [approveToken$, approveToken] = createSignal<ApproveTokenRequestEnhanced>();

export const tokenApproveStatus$ = combineLatest([approveToken$]).pipe(
  concatMap<[ApproveTokenRequestEnhanced], Promise<ApproveTokenResponse>>(async ([payload]) => {
    const { chain, tokenAddress, spenderAddress, amount, signer } = payload;

    try {
      const Erc20TokenService = getDefinedServices(chain).ERC20TokenServiceGetter(tokenAddress, chain, signer);
      const contractTransaction = await Erc20TokenService.approve(spenderAddress, amount);
      return await Promise.resolve({
        contractTransaction,
        request: { chain, tokenAddress, amount },
      });
    } catch (error) {
      console.error(`useApproveToken - Failed to approve token ${tokenAddress} with amount ${amount} !`, error);
      return Promise.resolve({});
    }
  }),
  map(response => {
    const { contractTransaction, request } = response;

    return contractTransaction
      ? {
          pending: false,
          success: true,
          request,
          contractTransaction: contractTransaction as ContractTransaction,
        }
      : { pending: false, success: false, request };
  }),
);

const [approveTokenStatus] = bind<ApproveTokenStatus | null>(tokenApproveStatus$, null);

export const useTokenApprove = (): {
  approveTokenStatus: ApproveTokenStatus | null;
  approveToken: typeof approveToken;
} => ({
  approveTokenStatus: approveTokenStatus(),
  approveToken,
});
