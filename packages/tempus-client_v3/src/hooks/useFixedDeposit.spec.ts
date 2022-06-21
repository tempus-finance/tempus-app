import { JsonRpcSigner } from '@ethersproject/providers';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { Decimal, getDefinedServices } from 'tempus-core-services';
import { v4 as uuidv4 } from 'uuid';
import { useFixedDeposit, subscribeFixedDepositStatus, resetFixedDepositStatus } from './useFixedDeposit';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getDefinedServices: jest.fn(),
}));

describe('useFixedDeposit', () => {
  it('returns the default status', async () => {
    const { result } = renderHook(() => useFixedDeposit());

    expect(result.current.fixedDepositStatus).toStrictEqual(null);
  });

  it('returns a single fixed deposit status', async () => {
    act(() => {
      resetFixedDepositStatus();
      subscribeFixedDepositStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedDeposit());

    expect(result.current.fixedDepositStatus).toStrictEqual(null);

    act(() => {
      result.current.fixedDeposit({
        chain: 'ethereum',
        poolAddress: '1',
        tokenAmount: new Decimal(2),
        tokenTicker: 'stETH',
        tokenAddress: '00001-ybt',
        slippage: new Decimal(1.5),
        signer: {} as unknown as JsonRpcSigner,
      });
    });

    await waitForNextUpdate({ timeout: 5000 });

    expect(result.current.fixedDepositStatus).toStrictEqual({
      pending: false,
      success: true,
      contractTransaction: { hash: '0x00' },
      transactionData: {
        depositedAmount: new Decimal(1),
      },
      request: {
        chain: 'ethereum',
        poolAddress: '1',
        tokenAmount: new Decimal(2),
        tokenTicker: 'stETH',
        tokenAddress: '00001-ybt',
      },
      txnId: '0x00',
    });
  });

  it('returns a sequence of deposit request status', async () => {
    act(() => {
      resetFixedDepositStatus();
      subscribeFixedDepositStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedDeposit());

    expect(result.current.fixedDepositStatus).toStrictEqual(null);

    act(() => {
      result.current.fixedDeposit({
        chain: 'ethereum',
        poolAddress: '1',
        tokenAmount: new Decimal(2),
        tokenTicker: 'stETH',
        tokenAddress: '00001-ybt',
        slippage: new Decimal(1.5),
        signer: {} as unknown as JsonRpcSigner,
      });
    });

    await waitForNextUpdate();

    expect(result.current.fixedDepositStatus).toStrictEqual({
      pending: false,
      success: true,
      contractTransaction: { hash: '0x00' },
      transactionData: {
        depositedAmount: new Decimal(1),
      },
      request: {
        chain: 'ethereum',
        poolAddress: '1',
        tokenAmount: new Decimal(2),
        tokenTicker: 'stETH',
        tokenAddress: '00001-ybt',
      },
      txnId: '0x00',
    });

    act(() => {
      result.current.fixedDeposit({
        chain: 'ethereum',
        poolAddress: '1',
        tokenAmount: new Decimal(3),
        tokenTicker: 'stETH',
        tokenAddress: '00001-ybt',
        slippage: new Decimal(1.5),
        signer: {} as unknown as JsonRpcSigner,
      });
    });

    await waitForNextUpdate();

    expect(result.current.fixedDepositStatus).toStrictEqual({
      pending: false,
      success: true,
      contractTransaction: { hash: '0x00' },
      transactionData: {
        depositedAmount: new Decimal(1),
      },
      request: {
        chain: 'ethereum',
        poolAddress: '1',
        tokenAmount: new Decimal(3),
        tokenTicker: 'stETH',
        tokenAddress: '00001-ybt',
      },
      txnId: '0x00',
    });
  });

  it('returns error status when there is error thrown for fixedDeposit()', async () => {
    (uuidv4 as jest.Mock).mockReturnValue('0x01');
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as jest.Mock).mockImplementation(() => ({
      DepositService: {
        fixedDeposit: jest.fn().mockImplementation(() => {
          throw new Error('1234');
        }),
      },
    }));

    act(() => {
      resetFixedDepositStatus();
      subscribeFixedDepositStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedDeposit());

    expect(result.current.fixedDepositStatus).toStrictEqual(null);

    act(() => {
      result.current.fixedDeposit({
        chain: 'ethereum',
        poolAddress: '1',
        tokenAmount: new Decimal(2),
        tokenTicker: 'stETH',
        tokenAddress: '00001-ybt',
        slippage: new Decimal(1.5),
        signer: {} as unknown as JsonRpcSigner,
      });
    });

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();
    expect(result.current.fixedDepositStatus).toStrictEqual({
      pending: false,
      success: false,
      error: new Error('1234'),
      request: {
        chain: 'ethereum',
        poolAddress: '1',
        tokenAmount: new Decimal(2),
        tokenTicker: 'stETH',
        tokenAddress: '00001-ybt',
      },
      txnId: '0x01',
    });

    (console.error as jest.Mock).mockRestore();
  });

  it('returns error status when there is error rejected for fixedDeposit()', async () => {
    (uuidv4 as jest.Mock).mockReturnValue('0x01');
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as jest.Mock).mockImplementation(() => ({
      DepositService: {
        fixedDeposit: jest.fn().mockRejectedValue('1234'),
      },
    }));

    act(() => {
      resetFixedDepositStatus();
      subscribeFixedDepositStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedDeposit());

    expect(result.current.fixedDepositStatus).toStrictEqual(null);

    act(() => {
      result.current.fixedDeposit({
        chain: 'ethereum',
        poolAddress: '1',
        tokenAmount: new Decimal(2),
        tokenTicker: 'stETH',
        tokenAddress: '00001-ybt',
        slippage: new Decimal(1.5),
        signer: {} as unknown as JsonRpcSigner,
      });
    });

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();
    expect(result.current.fixedDepositStatus).toStrictEqual({
      pending: false,
      success: false,
      error: '1234',
      request: {
        chain: 'ethereum',
        poolAddress: '1',
        tokenAmount: new Decimal(2),
        tokenTicker: 'stETH',
        tokenAddress: '00001-ybt',
      },
      txnId: '0x01',
    });

    (console.error as jest.Mock).mockRestore();
  });
});
