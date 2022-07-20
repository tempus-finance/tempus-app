import { JsonRpcSigner } from '@ethersproject/providers';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { of as mockOf } from 'rxjs';
import { Decimal, ONE, getDefinedServices } from 'tempus-core-services';
import { useTokenApprove, subscribeApproveTokenStatus, resetApproveTokenStatus } from './useApproveToken';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getDefinedServices: jest.fn(),
}));

jest.mock('./useServicesLoaded', () => ({
  ...jest.requireActual('./useServicesLoaded'),
  servicesLoaded$: mockOf(true),
}));

describe('useTokenApprove', () => {
  it('returns the default status', async () => {
    act(() => {
      resetApproveTokenStatus();
      subscribeApproveTokenStatus();
    });

    const { result } = renderHook(() => useTokenApprove());

    expect(result.current.approveTokenStatus).toBeNull();
  });

  it('returns a single token approval status', async () => {
    act(() => {
      resetApproveTokenStatus();
      subscribeApproveTokenStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenApprove());

    expect(result.current.approveTokenStatus).toBeNull();

    act(() => {
      result.current.approveToken({
        chain: 'ethereum',
        tokenAddress: '0x123',
        spenderAddress: '0xABC',
        amount: ONE,
        signer: {} as unknown as JsonRpcSigner,
        txnId: '0x01',
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
        txnId: '0x01',
      },
      txnId: '0x01',
    });
  });

  it('returns a sequence of token approval status', async () => {
    act(() => {
      resetApproveTokenStatus();
      subscribeApproveTokenStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenApprove());

    expect(result.current.approveTokenStatus).toBeNull();

    act(() => {
      result.current.approveToken({
        chain: 'ethereum',
        tokenAddress: '0x123',
        spenderAddress: '0xABC',
        amount: ONE,
        signer: {} as unknown as JsonRpcSigner,
        txnId: '0x01',
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
        txnId: '0x01',
      },
      txnId: '0x01',
    });

    act(() => {
      result.current.approveToken({
        chain: 'fantom',
        tokenAddress: '0x789',
        spenderAddress: '0xXYZ',
        amount: new Decimal('12'),
        signer: {} as unknown as JsonRpcSigner,
        txnId: '0x0w',
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
        txnId: '0x0w',
      },
      txnId: '0x0w',
    });
  });

  test('return false status when service map is null', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockReturnValue(null);

    act(() => {
      resetApproveTokenStatus();
      subscribeApproveTokenStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenApprove());

    expect(result.current.approveTokenStatus).toBeNull();

    act(() => {
      result.current.approveToken({
        chain: 'ethereum',
        tokenAddress: '0x123',
        spenderAddress: '0xABC',
        amount: ONE,
        signer: {} as unknown as JsonRpcSigner,
        txnId: '0x01',
      });
    });

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(result.current.approveTokenStatus).toStrictEqual({
      pending: false,
      success: false,
      error: new TypeError("Cannot read properties of null (reading 'ERC20TokenServiceGetter')"),
      request: {
        chain: 'ethereum',
        tokenAddress: '0x123',
        amount: ONE,
        txnId: '0x01',
      },
      txnId: '0x01',
    });
    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('return false status when there is error when getDefinedServices()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => {
      throw new Error('1234');
    });

    act(() => {
      resetApproveTokenStatus();
      subscribeApproveTokenStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenApprove());

    expect(result.current.approveTokenStatus).toBeNull();

    act(() => {
      result.current.approveToken({
        chain: 'ethereum',
        tokenAddress: '0x123',
        spenderAddress: '0xABC',
        amount: ONE,
        signer: {} as unknown as JsonRpcSigner,
        txnId: '0x01',
      });
    });

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(result.current.approveTokenStatus).toStrictEqual({
      pending: false,
      success: false,
      error: new Error('1234'),
      request: {
        chain: 'ethereum',
        tokenAddress: '0x123',
        amount: ONE,
        txnId: '0x01',
      },
      txnId: '0x01',
    });
    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('return false status when there is error when ERC20TokenServiceGetter()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      ERC20TokenServiceGetter: jest.fn().mockImplementation(() => {
        throw new Error('1234');
      }),
    }));

    act(() => {
      resetApproveTokenStatus();
      subscribeApproveTokenStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenApprove());

    expect(result.current.approveTokenStatus).toBeNull();

    act(() => {
      result.current.approveToken({
        chain: 'ethereum',
        tokenAddress: '0x123',
        spenderAddress: '0xABC',
        amount: ONE,
        signer: {} as unknown as JsonRpcSigner,
        txnId: '0x01',
      });
    });

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(result.current.approveTokenStatus).toStrictEqual({
      pending: false,
      success: false,
      error: new Error('1234'),
      request: {
        chain: 'ethereum',
        tokenAddress: '0x123',
        amount: ONE,
        txnId: '0x01',
      },
      txnId: '0x01',
    });
    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('return false status when there is error when approve()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      ERC20TokenServiceGetter: jest.fn().mockImplementation(() => ({
        approve: jest.fn().mockImplementation(() => {
          throw new Error('1234');
        }),
      })),
    }));

    act(() => {
      resetApproveTokenStatus();
      subscribeApproveTokenStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenApprove());

    expect(result.current.approveTokenStatus).toBeNull();

    act(() => {
      result.current.approveToken({
        chain: 'ethereum',
        tokenAddress: '0x123',
        spenderAddress: '0xABC',
        amount: ONE,
        signer: {} as unknown as JsonRpcSigner,
        txnId: '0x01',
      });
    });

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(result.current.approveTokenStatus).toStrictEqual({
      pending: false,
      success: false,
      error: new Error('1234'),
      request: {
        chain: 'ethereum',
        tokenAddress: '0x123',
        amount: ONE,
        txnId: '0x01',
      },
      txnId: '0x01',
    });
    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('return false status when there is rejected promise when approve()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      ERC20TokenServiceGetter: jest.fn().mockImplementation(() => ({
        approve: jest.fn().mockRejectedValue(new Error('1234')),
      })),
    }));

    act(() => {
      resetApproveTokenStatus();
      subscribeApproveTokenStatus();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenApprove());

    expect(result.current.approveTokenStatus).toBeNull();

    act(() => {
      result.current.approveToken({
        chain: 'ethereum',
        tokenAddress: '0x123',
        spenderAddress: '0xABC',
        amount: ONE,
        signer: {} as unknown as JsonRpcSigner,
        txnId: '0x01',
      });
    });

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(result.current.approveTokenStatus).toStrictEqual({
      pending: false,
      success: false,
      error: new Error('1234'),
      request: {
        chain: 'ethereum',
        tokenAddress: '0x123',
        amount: ONE,
        txnId: '0x01',
      },
      txnId: '0x01',
    });
    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });
});
