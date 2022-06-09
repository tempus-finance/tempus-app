import { JsonRpcSigner } from '@ethersproject/providers';
import { ContractTransaction } from 'ethers';
import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { concatMap, map } from 'rxjs';
import { Chain, Decimal, getServices } from 'tempus-core-services';

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

const tokenApproveStatus$ = approveToken$.pipe(
  concatMap<ApproveTokenRequestEnhanced, Promise<ApproveTokenResponse>>(async payload => {
    const { chain, tokenAddress, spenderAddress, amount, signer } = payload;

    const ERC20TokenServiceGetter = getServices(chain as Chain)?.ERC20TokenServiceGetter;
    const Erc20TokenService = ERC20TokenServiceGetter?.(tokenAddress, chain, signer);

    if (!Erc20TokenService) {
      console.error('useApproveToken - Erc20TokenService not available');
      return Promise.resolve({});
    }

    try {
      const contractTransaction = await Erc20TokenService.approve(spenderAddress, amount);
      return await Promise.resolve({
        contractTransaction,
        request: { chain, tokenAddress, amount },
      });
    } catch (error) {
      console.error('useApproveToken - Failed to approve token amount!', error);
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

const [approveTokenStatus] = bind<ApproveTokenStatus>(tokenApproveStatus$, { pending: true });

export const useTokenApprove = (): {
  approveTokenStatus: ApproveTokenStatus;
  approveToken: (payload: ApproveTokenRequestEnhanced) => void;
} => ({
  approveTokenStatus: approveTokenStatus(),
  approveToken,
});
