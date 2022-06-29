import TransactionError from './TransactionError';

describe('TransactionError', () => {
  test('for BalancerError, isBalancerError set to true', () => {
    [
      { error: { data: { code: 3, message: 'some error: BAL#100' } } as unknown as Error },
      { error: { data: { code: 3, message: 'some error: BAL#201' } } as unknown as Error },
      { error: { data: { code: 3, message: 'some error: BAL#302' } } as unknown as Error },
      { error: { data: { code: 3, message: 'some error: BAL#403' } } as unknown as Error },
      { error: { data: { code: 3, message: 'some error: BAL#504' } } as unknown as Error },
      { error: { data: { code: 3, message: 'some error: BAL#601' } } as unknown as Error },
    ].forEach(({ error }) => {
      const transactionError = new TransactionError(error);
      expect(transactionError.isBalancerError).toBeTruthy();
      expect(transactionError.isWalletError).toBeFalsy();
      expect(transactionError.isRpcError).toBeFalsy();
    });
  });

  test('for MetamaskError, isWalletError set to true when error code is 4xxx', () => {
    [
      { error: { code: 4001 } as unknown as Error },
      { error: { code: 4100 } as unknown as Error },
      { error: { code: 4200 } as unknown as Error },
      { error: { code: 4900 } as unknown as Error },
      { error: { code: 4901 } as unknown as Error },
    ].forEach(({ error }) => {
      const transactionError = new TransactionError(error);
      expect(transactionError.isBalancerError).toBeFalsy();
      expect(transactionError.isWalletError).toBeTruthy();
      expect(transactionError.isRpcError).toBeFalsy();
    });
  });

  test('for MetamaskError, isRpcError set to true when error code is 32xxx', () => {
    [
      { error: { code: 32000 } as unknown as Error },
      { error: { code: 32001 } as unknown as Error },
      { error: { code: 32002 } as unknown as Error },
      { error: { code: 32003 } as unknown as Error },
      { error: { code: 32004 } as unknown as Error },
      { error: { code: 32005 } as unknown as Error },
      { error: { code: 32600 } as unknown as Error },
      { error: { code: 32601 } as unknown as Error },
      { error: { code: 32602 } as unknown as Error },
      { error: { code: 32603 } as unknown as Error },
      { error: { code: 32700 } as unknown as Error },
    ].forEach(({ error }) => {
      const transactionError = new TransactionError(error);
      expect(transactionError.isBalancerError).toBeFalsy();
      expect(transactionError.isWalletError).toBeFalsy();
      expect(transactionError.isRpcError).toBeTruthy();
    });
  });
});
