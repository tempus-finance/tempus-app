import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { of as mockOf } from 'rxjs';
import { ZERO_ADDRESS } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { mockGetTokenBalance } from '../setupTests';
import { reset, subscribe, useTokenBalance } from './useTokenBalance';

jest.mock('./useServicesLoaded', () => ({
  ...jest.requireActual('./useServicesLoaded'),
  servicesLoaded$: mockOf(true),
}));

jest.mock('./useWalletAddress', () => ({
  ...jest.requireActual('./useWalletAddress'),
  walletAddress$: mockOf('0x0'),
}));

describe('useTvlData', () => {
  beforeAll(getConfigManager);

  test('returns balance of a token', async () => {
    act(() => {
      reset();
      subscribe();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenBalance(ZERO_ADDRESS, 'ethereum'));

    expect(result.current).toEqual(null);

    await waitForNextUpdate();

    expect(result.current?.toString()).toEqual('100');
  });

  test('does not re-fetch token balance from chain on 2nd component render', async () => {
    act(() => {
      reset();
      subscribe();
    });

    const { result: result1, waitForNextUpdate } = renderHook(() => useTokenBalance(ZERO_ADDRESS, 'ethereum'));

    expect(result1.current).toEqual(null);
    expect(mockGetTokenBalance).toHaveBeenCalledTimes(22);

    await waitForNextUpdate();

    const { result: result2 } = renderHook(() => useTokenBalance(ZERO_ADDRESS, 'ethereum'));

    expect(mockGetTokenBalance).toHaveBeenCalledTimes(22);
    expect(result2.current?.toString()).toEqual('100');
  });
});
