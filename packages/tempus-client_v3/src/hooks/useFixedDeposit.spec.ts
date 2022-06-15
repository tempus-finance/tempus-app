import { JsonRpcSigner } from '@ethersproject/providers';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { Decimal } from 'tempus-core-services';
import { useFixedDeposit } from './useFixedDeposit';

describe('useFixedDeposit', () => {
  it('returns the default status', async () => {
    const { result } = renderHook(() => useFixedDeposit());

    expect(result.current.fixedDepositStatus).toStrictEqual(null);
  });

  it('returns a single fixed deposit status', async () => {
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
      request: {
        chain: 'ethereum',
        poolAddress: '1',
        tokenAmount: new Decimal(2),
        tokenTicker: 'stETH',
        tokenAddress: '00001-ybt',
      },
    });
  });

  it('returns a sequence of deposit request status', async () => {
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
      request: {
        chain: 'ethereum',
        poolAddress: '1',
        tokenAmount: new Decimal(2),
        tokenTicker: 'stETH',
        tokenAddress: '00001-ybt',
      },
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
      request: {
        chain: 'ethereum',
        poolAddress: '1',
        tokenAmount: new Decimal(3),
        tokenTicker: 'stETH',
        tokenAddress: '00001-ybt',
      },
    });
  });
});
