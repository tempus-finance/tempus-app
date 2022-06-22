import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { of as mockOf, delay as mockDelay } from 'rxjs';
import { Decimal as MockDecimal, getServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { reset, subscribe, usePoolBalance } from './usePoolBalance';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

jest.mock('./useTokenBalance', () => ({
  ...jest.requireActual('./useServicesLoaded'),
  tokenBalanceDataMap: new Map([
    [
      'ethereum-00001-p',
      {
        subject$: mockOf({
          balance: new MockDecimal(100),
          address: '00001-p',
          chain: 'ethereum',
        }).pipe(mockDelay(100)),
        address: '00001-p',
        chain: 'ethereum',
      },
    ],
    [
      'ethereum-00001-y',
      {
        subject$: mockOf({
          balance: new MockDecimal(100),
          address: '00001-p',
          chain: 'ethereum',
        }).pipe(mockDelay(100)),
        address: '00001-p',
        chain: 'ethereum',
      },
    ],
    [
      'ethereum-00001-amm',
      {
        subject$: mockOf({
          balance: new MockDecimal(100),
          address: '00001-p',
          chain: 'ethereum',
        }).pipe(mockDelay(100)),
        address: '00001-p',
        chain: 'ethereum',
      },
    ],
  ]),
}));

jest.mock('./useWalletAddress', () => ({
  walletAddress$: mockOf('0x00').pipe(mockDelay(100)),
}));

jest.mock('./useServicesLoaded', () => ({
  ...jest.requireActual('./useServicesLoaded'),
  servicesLoaded$: mockOf(true),
}));

describe('usePoolBalances', () => {
  beforeAll(getConfigManager);

  test('returns pool-to-balance map', async () => {
    act(() => {
      reset();
      subscribe();
    });

    const { result, waitForNextUpdate } = renderHook(() => usePoolBalance('1', 'ethereum'));

    await waitForNextUpdate();

    expect(result.current?.balanceInBackingToken?.toString()).toEqual('100');
    expect(result.current?.balanceInYieldBearingToken?.toString()).toEqual('100');
    expect(result.current?.address).toEqual('1');
    expect(result.current?.chain).toEqual('ethereum');
  });

  test('returns a empty map when there is error', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getServices as unknown as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    act(() => {
      reset();
      subscribe();
    });

    const { result, waitForNextUpdate } = renderHook(() => usePoolBalance('1', 'ethereum'));

    expect(result.current).toEqual({
      address: '1',
      chain: 'ethereum',
      balanceInBackingToken: null,
      balanceInYieldBearingToken: null,
      balanceInUsd: null,
    });
    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, hook will return empty map which wont trigger rerender becoz it's same as initial value
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });
});
