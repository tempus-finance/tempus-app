interface BalancerError extends Error {
  data: {
    code: number;
    message: string;
  };
}

type MetamaskErrorCode =
  | 4001 // userRejectedRequest
  | 4100 // unauthorized
  | 4200 // unsupportedMethod
  | 4900 // disconnected
  | 4901 // chainDisconnected
  | -32000 // invalidInput
  | -32001 // resourceNotFound
  | -32002 // resourceUnavailable
  | -32003 // transactionRejected
  | -32004 // methodNotSupported
  | -32005 // limitExceeded
  | -32600 // invalidRequest
  | -32601 // methodNotFound
  | -32602 // invalidParams
  | -32603 // internal
  | -32700; // parse
interface MetamaskError extends Error {
  code: MetamaskErrorCode;
  message: string;
  data?: any;
}

export default class TransactionError {
  public readonly raw: Error | undefined = undefined;
  public readonly isBalancerError: boolean = false;
  public readonly isWalletError: boolean = false;
  public readonly isRpcError: boolean = false;
  public readonly balancerErrorCode: number | null = null;
  public readonly metamaskErrorCode: MetamaskErrorCode | null = null;

  constructor(error?: Error) {
    if (error) {
      this.raw = error;

      // Balancer error: https://dev.balancer.fi/references/error-codes
      this.balancerErrorCode = TransactionError.parseBalancerErrorCode(error as BalancerError);
      this.isBalancerError = Boolean(this.balancerErrorCode);

      // metamask error: https://github.com/MetaMask/eth-rpc-errors/blob/main/src/error-constants.ts
      this.metamaskErrorCode = TransactionError.parseMetamaskErrorCode(error as MetamaskError);
      this.isWalletError = TransactionError.isMetamaskProviderError(error as MetamaskError);
      this.isRpcError = TransactionError.isMetamaskRpcError(error as MetamaskError);
    }
  }

  static parseBalancerErrorCode(error: BalancerError): number {
    const errorCodeString = error.data?.message?.match(/BAL#\d+/)?.[0] ?? '';
    return Number(errorCodeString.split('#')[1]);
  }

  static parseMetamaskErrorCode(error: MetamaskError): MetamaskErrorCode | null {
    return error.code ?? null;
  }

  static isMetamaskRpcError(error: MetamaskError): boolean {
    const code = TransactionError.parseMetamaskErrorCode(error);
    return code !== null && code >= 30000;
  }

  static isMetamaskProviderError(error: MetamaskError): boolean {
    const code = TransactionError.parseMetamaskErrorCode(error);
    return code !== null && code < 5000;
  }
}
