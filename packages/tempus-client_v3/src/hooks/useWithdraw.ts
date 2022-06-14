import { ContractTransaction } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { concatMap, map, catchError, of } from 'rxjs';
import { Chain, Decimal, getDefinedServices, Ticker } from 'tempus-core-services';

interface WithdrawRequest {
  chain: Chain;
  poolAddress: string;
  amount: Decimal;
  token: Ticker;
  tokenBalance: Decimal;
  capitalsBalance: Decimal;
  yieldsBalance: Decimal;
  lpBalance: Decimal;
  slippage: Decimal;
  signer: JsonRpcSigner;
}

interface WithdrawStatus {
  pending: boolean;
  request?: WithdrawRequest;
  success?: boolean;
  contractTransaction?: ContractTransaction;
}

interface WithdrawResponse {
  request?: WithdrawRequest;
  contractTransaction?: ContractTransaction | void;
}

const [withdraw$, withdraw] = createSignal<WithdrawRequest>();

const withdrawStatus$ = withdraw$.pipe(
  concatMap<WithdrawRequest, Promise<WithdrawResponse>>(async payload => {
    const {
      chain,
      poolAddress,
      amount,
      token,
      tokenBalance,
      capitalsBalance,
      yieldsBalance,
      lpBalance,
      slippage,
      signer,
    } = payload;

    try {
      const contractTransaction = await getDefinedServices(chain).WithdrawService.withdraw(
        poolAddress,
        amount,
        token,
        tokenBalance,
        capitalsBalance,
        yieldsBalance,
        lpBalance,
        slippage,
        signer,
      );

      return await Promise.resolve({
        contractTransaction,
        request: { chain, poolAddress, amount, token },
      });
    } catch (error) {
      console.error('useWithdraw - Failed to withdraw specified amount!', error);
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
          contractTransaction,
        }
      : { pending: false, success: false, request };
  }),
  catchError(error => {
    console.error('useWithdraw - Failed to execute withdrawal!', error);
    return of({
      pending: false,
      success: false,
    });
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
