import { JsonRpcSigner } from '@ethersproject/providers';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { Decimal } from 'tempus-core-services';
import { useWithdraw } from './useWithdraw';

describe('useWithdraw', () => {
  it('returns the default status', async () => {
    const { result } = renderHook(() => useWithdraw());

    expect(result.current.withdrawStatus).toStrictEqual(null);
  });

  it('returns a single withdraw status', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useWithdraw());

    expect(result.current.withdrawStatus).toStrictEqual(null);

    act(() => {
      result.current.withdraw({
        chain: 'ethereum',
        poolAddress: '1',
        amount: new Decimal(2),
        token: 'stETH',
        tokenBalance: new Decimal(30),
        lpBalance: new Decimal(20),
        capitalsBalance: new Decimal(10),
        yieldsBalance: new Decimal(15),
        slippage: new Decimal(1.5),
        signer: {} as unknown as JsonRpcSigner,
      });
    });

    await waitForNextUpdate({ timeout: 5000 });

    expect(result.current.withdrawStatus).toStrictEqual({
      pending: false,
      success: true,
      contractTransaction: { hash: '0x00' },
      request: {
        amount: new Decimal(2),
        chain: 'ethereum',
        poolAddress: '1',
        token: 'stETH',
      },
    });
  });

  it('returns a sequence of withdraw request status', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useWithdraw());

    expect(result.current.withdrawStatus).toStrictEqual(null);

    act(() => {
      result.current.withdraw({
        chain: 'ethereum',
        poolAddress: '1',
        amount: new Decimal(2),
        token: 'stETH',
        tokenBalance: new Decimal(30),
        lpBalance: new Decimal(20),
        capitalsBalance: new Decimal(10),
        yieldsBalance: new Decimal(15),
        slippage: new Decimal(1.5),
        signer: {} as unknown as JsonRpcSigner,
      });
    });

    await waitForNextUpdate();

    expect(result.current.withdrawStatus).toStrictEqual({
      pending: false,
      success: true,
      contractTransaction: { hash: '0x00' },
      request: {
        amount: new Decimal(2),
        chain: 'ethereum',
        poolAddress: '1',
        token: 'stETH',
      },
    });

    act(() => {
      result.current.withdraw({
        chain: 'ethereum',
        poolAddress: '1',
        amount: new Decimal(3),
        token: 'stETH',
        tokenBalance: new Decimal(30),
        lpBalance: new Decimal(20),
        capitalsBalance: new Decimal(10),
        yieldsBalance: new Decimal(15),
        slippage: new Decimal(1.5),
        signer: {} as unknown as JsonRpcSigner,
      });
    });

    await waitForNextUpdate();

    expect(result.current.withdrawStatus).toStrictEqual({
      pending: false,
      success: true,
      contractTransaction: { hash: '0x00' },
      request: {
        amount: new Decimal(3),
        chain: 'ethereum',
        poolAddress: '1',
        token: 'stETH',
      },
    });
  });
});
