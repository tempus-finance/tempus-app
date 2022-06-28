import { TransactionError } from '../interfaces';

export class ErrorUtils {
  // ref: https://dev.balancer.fi/references/error-codes
  static getTransactionErrorCode(error?: TransactionError): string | undefined {
    return error?.data?.message.match(/BAL#\d+/)?.[0];
  }
}
