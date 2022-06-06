import { JsonRpcSigner } from '@ethersproject/providers';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { Decimal, ONE } from 'tempus-core-services';
import { useTokenApprove } from './useApproveToken';

describe('useTokenApprove', () => {
  it('returns the default status', async () => {
    const { result } = renderHook(() => useTokenApprove());

    expect(result.current.approveTokenStatus).toStrictEqual({ pending: true });
  });

  it('returns a single token approval status', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTokenApprove());

    expect(result.current.approveTokenStatus).toStrictEqual({ pending: true });

    act(() => {
      result.current.approveToken({
        chain: 'ethereum',
        tokenAddress: '0x123',
        spenderAddress: '0xABC',
        amount: ONE,
        signer: {} as unknown as JsonRpcSigner,
      });
    });

    await waitForNextUpdate({ timeout: 5000 });

    expect(result.current.approveTokenStatus).toStrictEqual({
      pending: false,
      success: true,
      contractTransaction: { hash: '0x00' },
      request: {
        chain: 'ethereum',
        tokenAddress: '0x123',
        amount: ONE,
      },
    });
  });

  it('returns a sequence of token approval status', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTokenApprove());

    expect(result.current.approveTokenStatus).toStrictEqual({ pending: true });

    act(() => {
      result.current.approveToken({
        chain: 'ethereum',
        tokenAddress: '0x123',
        spenderAddress: '0xABC',
        amount: ONE,
        signer: {} as unknown as JsonRpcSigner,
      });
    });

    await waitForNextUpdate();

    expect(result.current.approveTokenStatus).toStrictEqual({
      pending: false,
      success: true,
      contractTransaction: { hash: '0x00' },
      request: {
        chain: 'ethereum',
        tokenAddress: '0x123',
        amount: ONE,
      },
    });

    act(() => {
      result.current.approveToken({
        chain: 'fantom',
        tokenAddress: '0x789',
        spenderAddress: '0xXYZ',
        amount: new Decimal('12'),
        signer: {} as unknown as JsonRpcSigner,
      });
    });

    await waitForNextUpdate();

    expect(result.current.approveTokenStatus).toStrictEqual({
      pending: false,
      success: true,
      contractTransaction: { hash: '0x00' },
      request: {
        chain: 'fantom',
        tokenAddress: '0x789',
        amount: new Decimal('12'),
      },
    });
  });
});
