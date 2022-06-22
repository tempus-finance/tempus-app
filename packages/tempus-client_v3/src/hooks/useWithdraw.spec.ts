import { JsonRpcSigner } from '@ethersproject/providers';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { getDefinedServices, Decimal, ONE } from 'tempus-core-services';
import { useWithdraw, subscribeWithdrawStatus, resetWithdrawStatus } from './useWithdraw';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getDefinedServices: jest.fn(),
}));

describe('useWithdraw', () => {
  it('returns the default status', async () => {
    const { result } = renderHook(() => useWithdraw());

    expect(result.current.withdrawStatus).toBeNull();
  });

  it('returns a single withdraw status', async () => {
    act(() => {
      resetWithdrawStatus();
      subscribeWithdrawStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useWithdraw());

    expect(result.current.withdrawStatus).toBeNull();

    act(() => {
      result.current.withdraw({
        chain: 'ethereum',
        poolAddress: '1',
        amount: new Decimal(2),
        token: 'stETH',
        tokenAddress: '00001-ybt',
        tokenBalance: new Decimal(30),
        lpBalance: new Decimal(20),
        capitalsBalance: new Decimal(10),
        yieldsBalance: new Decimal(15),
        slippage: new Decimal(1.5),
        signer: {} as unknown as JsonRpcSigner,
        txnId: '0x01',
      });
    });

    await waitForNextUpdate({ timeout: 5000 });

    expect(result.current.withdrawStatus).toStrictEqual({
      pending: false,
      success: true,
      contractTransaction: { hash: '0x00' },
      transactionData: {
        withdrawnAmount: ONE,
      },
      request: {
        amount: new Decimal(2),
        chain: 'ethereum',
        poolAddress: '1',
        token: 'stETH',
      },
      txnId: '0x01',
    });
  });

  it('returns a sequence of withdraw request status', async () => {
    act(() => {
      resetWithdrawStatus();
      subscribeWithdrawStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useWithdraw());

    expect(result.current.withdrawStatus).toBeNull();

    act(() => {
      result.current.withdraw({
        chain: 'ethereum',
        poolAddress: '1',
        amount: new Decimal(2),
        token: 'stETH',
        tokenAddress: '00001-ybt',
        tokenBalance: new Decimal(30),
        lpBalance: new Decimal(20),
        capitalsBalance: new Decimal(10),
        yieldsBalance: new Decimal(15),
        slippage: new Decimal(1.5),
        signer: {} as unknown as JsonRpcSigner,
        txnId: '0x01',
      });
    });

    await waitForNextUpdate();

    expect(result.current.withdrawStatus).toStrictEqual({
      pending: false,
      success: true,
      contractTransaction: { hash: '0x00' },
      transactionData: {
        withdrawnAmount: ONE,
      },
      request: {
        amount: new Decimal(2),
        chain: 'ethereum',
        poolAddress: '1',
        token: 'stETH',
      },
      txnId: '0x01',
    });

    act(() => {
      result.current.withdraw({
        chain: 'ethereum',
        poolAddress: '1',
        amount: new Decimal(3),
        token: 'stETH',
        tokenAddress: '00001-ybt',
        tokenBalance: new Decimal(30),
        lpBalance: new Decimal(20),
        capitalsBalance: new Decimal(10),
        yieldsBalance: new Decimal(15),
        slippage: new Decimal(1.5),
        signer: {} as unknown as JsonRpcSigner,
        txnId: '0x02',
      });
    });

    await waitForNextUpdate();

    expect(result.current.withdrawStatus).toStrictEqual({
      pending: false,
      success: true,
      contractTransaction: { hash: '0x00' },
      transactionData: {
        withdrawnAmount: ONE,
      },
      request: {
        amount: new Decimal(3),
        chain: 'ethereum',
        poolAddress: '1',
        token: 'stETH',
      },
      txnId: '0x02',
    });
  });

  it('returns error status when service map is null', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as jest.Mock).mockReturnValue(null);

    act(() => {
      resetWithdrawStatus();
      subscribeWithdrawStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useWithdraw());

    expect(result.current.withdrawStatus).toBeNull();

    act(() => {
      result.current.withdraw({
        chain: 'ethereum',
        poolAddress: '1',
        amount: new Decimal(2),
        token: 'stETH',
        tokenAddress: '00001-ybt',
        tokenBalance: new Decimal(30),
        lpBalance: new Decimal(20),
        capitalsBalance: new Decimal(10),
        yieldsBalance: new Decimal(15),
        slippage: new Decimal(1.5),
        signer: {} as unknown as JsonRpcSigner,
        txnId: '0x01',
      });
    });

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();
    expect(result.current.withdrawStatus).toStrictEqual({
      pending: false,
      success: false,
      error: new TypeError("Cannot read properties of null (reading 'WithdrawService')"),
      request: {
        chain: 'ethereum',
        poolAddress: '1',
        amount: new Decimal(2),
        token: 'stETH',
      },
      txnId: '0x01',
    });

    (console.error as jest.Mock).mockRestore();
  });

  it('returns error status when there is an error when getDefinedServices()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as jest.Mock).mockImplementation(() => {
      throw new Error('1234');
    });

    act(() => {
      resetWithdrawStatus();
      subscribeWithdrawStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useWithdraw());

    expect(result.current.withdrawStatus).toBeNull();

    act(() => {
      result.current.withdraw({
        chain: 'ethereum',
        poolAddress: '1',
        amount: new Decimal(2),
        token: 'stETH',
        tokenAddress: '00001-ybt',
        tokenBalance: new Decimal(30),
        lpBalance: new Decimal(20),
        capitalsBalance: new Decimal(10),
        yieldsBalance: new Decimal(15),
        slippage: new Decimal(1.5),
        signer: {} as unknown as JsonRpcSigner,
        txnId: '0x01',
      });
    });

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();
    expect(result.current.withdrawStatus).toStrictEqual({
      pending: false,
      success: false,
      error: new Error('1234'),
      request: {
        chain: 'ethereum',
        poolAddress: '1',
        amount: new Decimal(2),
        token: 'stETH',
      },
      txnId: '0x01',
    });

    (console.error as jest.Mock).mockRestore();
  });

  it('returns error status when there is an error when withdraw()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as jest.Mock).mockImplementation(() => ({
      WithdrawService: {
        withdraw: jest.fn().mockImplementation(() => {
          throw new Error('1234');
        }),
      },
    }));

    act(() => {
      resetWithdrawStatus();
      subscribeWithdrawStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useWithdraw());

    expect(result.current.withdrawStatus).toBeNull();

    act(() => {
      result.current.withdraw({
        chain: 'ethereum',
        poolAddress: '1',
        amount: new Decimal(2),
        token: 'stETH',
        tokenAddress: '00001-ybt',
        tokenBalance: new Decimal(30),
        lpBalance: new Decimal(20),
        capitalsBalance: new Decimal(10),
        yieldsBalance: new Decimal(15),
        slippage: new Decimal(1.5),
        signer: {} as unknown as JsonRpcSigner,
        txnId: '0x01',
      });
    });

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();
    expect(result.current.withdrawStatus).toStrictEqual({
      pending: false,
      success: false,
      error: new Error('1234'),
      request: {
        chain: 'ethereum',
        poolAddress: '1',
        amount: new Decimal(2),
        token: 'stETH',
      },
      txnId: '0x01',
    });

    (console.error as jest.Mock).mockRestore();
  });

  it('returns error status when there is an error rejected for withdraw()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as jest.Mock).mockImplementation(() => ({
      WithdrawService: {
        withdraw: jest.fn().mockRejectedValue(new Error('1234')),
      },
    }));

    act(() => {
      resetWithdrawStatus();
      subscribeWithdrawStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useWithdraw());

    expect(result.current.withdrawStatus).toBeNull();

    act(() => {
      result.current.withdraw({
        chain: 'ethereum',
        poolAddress: '1',
        amount: new Decimal(2),
        token: 'stETH',
        tokenAddress: '00001-ybt',
        tokenBalance: new Decimal(30),
        lpBalance: new Decimal(20),
        capitalsBalance: new Decimal(10),
        yieldsBalance: new Decimal(15),
        slippage: new Decimal(1.5),
        signer: {} as unknown as JsonRpcSigner,
        txnId: '0x01',
      });
    });

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();
    expect(result.current.withdrawStatus).toStrictEqual({
      pending: false,
      success: false,
      error: new Error('1234'),
      request: {
        chain: 'ethereum',
        poolAddress: '1',
        amount: new Decimal(2),
        token: 'stETH',
      },
      txnId: '0x01',
    });

    (console.error as jest.Mock).mockRestore();
  });
});
