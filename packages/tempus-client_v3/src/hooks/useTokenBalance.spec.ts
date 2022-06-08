import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { of as mockOf } from 'rxjs';
import { ZERO_ADDRESS, Decimal as MockDecimal } from 'tempus-core-services';
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

jest.mock('./useSelectedChain', () => ({
  ...jest.requireActual('./useSelectedChain'),
  selectedChain$: mockOf('ethereum'),
}));

describe('useTvlData', () => {
  beforeAll(getConfigManager);

  test('returns balance of a token', async () => {
    act(() => {
      reset();
      subscribe();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenBalance(ZERO_ADDRESS, 'ethereum'));

    expect(result.current).toEqual({
      address: ZERO_ADDRESS,
      chain: 'ethereum',
      balance: null,
    });

    await waitForNextUpdate();

    expect(result.current).toEqual({
      address: ZERO_ADDRESS,
      chain: 'ethereum',
      balance: new MockDecimal(100),
    });
  });

  test('does not re-fetch token balance from chain on 2nd component render', async () => {
    act(() => {
      reset();
      subscribe();
    });

    const { result: result1, waitForNextUpdate } = renderHook(() => useTokenBalance(ZERO_ADDRESS, 'ethereum'));

    expect(result1.current).toEqual({
      address: ZERO_ADDRESS,
      chain: 'ethereum',
      balance: null,
    });
    expect(mockGetTokenBalance).toHaveBeenCalledTimes(10);

    await waitForNextUpdate();

    const { result: result2 } = renderHook(() => useTokenBalance(ZERO_ADDRESS, 'ethereum'));

    expect(mockGetTokenBalance).toHaveBeenCalledTimes(10);
    expect(result2.current).toEqual({
      address: ZERO_ADDRESS,
      chain: 'ethereum',
      balance: new MockDecimal(100),
    });
  });
});