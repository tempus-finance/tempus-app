import { ContractTransaction } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { concatMap, map, catchError, of } from 'rxjs';
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
  contractTransaction?: ContractTransaction;
  transactionData?: {
    depositedAmount: Decimal;
  };
}

interface FixedDepositResponse {
  request?: FixedDepositRequest;
  contractTransaction?: ContractTransaction | void;
  transactionData?: {
    depositedAmount: Decimal;
  };
}

const [fixedDeposit$, fixedDeposit] = createSignal<FixedDepositRequest>();

const fixedDepositStatus$ = fixedDeposit$.pipe(
  concatMap<FixedDepositRequest, Promise<FixedDepositResponse>>(async payload => {
    const { chain, poolAddress, tokenAmount, tokenTicker, tokenAddress, slippage, signer } = payload;

    try {
      const result = await getDefinedServices(chain).DepositService.fixedDeposit(
        poolAddress,
        tokenAmount,
        tokenTicker,
        tokenAddress,
        slippage,
        signer,
      );

      return await Promise.resolve({
        contractTransaction: result.contractTransaction,
        transactionData: {
          depositedAmount: result.depositedAmount,
        },
        request: { chain, poolAddress, tokenAmount, tokenTicker, tokenAddress },
      });
    } catch (error) {
      console.error('useFixedDeposits - Failed to execute fixed deposit!', error);
      return Promise.resolve({});
    }
  }),
  map(response => {
    const { contractTransaction, transactionData, request } = response;

    return contractTransaction && transactionData
      ? {
          pending: false,
          success: true,
          request,
          contractTransaction,
          transactionData,
        }
      : { pending: false, success: false, request };
  }),
  catchError(error => {
    console.error('useFixedDeposit - Failed to execute fixed deposit!', error);
    return of({
      pending: false,
      success: false,
    });
  }),
);

const [fixedDepositStatus] = bind<FixedDepositStatus | null>(fixedDepositStatus$, null);

export const useFixedDeposit = (): {
  fixedDepositStatus: FixedDepositStatus | null;
  fixedDeposit: (payload: FixedDepositRequest) => void;
} => ({
  fixedDepositStatus: fixedDepositStatus(),
  fixedDeposit,
});
