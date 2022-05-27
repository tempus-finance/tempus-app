import { renderHook } from '@testing-library/react-hooks';
import { of as mockOf, delay as mockDelay } from 'rxjs';
import { Decimal as MockDecimal, getServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { usePoolBalances } from './usePoolBalances';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

jest.mock('./useWalletBalances', () => ({
  walletBalances$: mockOf({
    'ethereum-00001-p': new MockDecimal(100),
    'ethereum-00001-y': new MockDecimal(200),
    'ethereum-00001-amm': new MockDecimal(300),
  }).pipe(mockDelay(100)),
}));

jest.mock('./useWalletAddress', () => ({
  walletAddress$: mockOf('0x00').pipe(mockDelay(100)),
}));

describe('useTvlData', () => {
  beforeAll(async () => {
    const config = getConfigManager();
    await config.init();
  });

  test('returns pool-to-balance map', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePoolBalances());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    const expected = {
      'ethereum-1': new MockDecimal(500),
      'ethereum-2': new MockDecimal(700),
      'fantom-3': new MockDecimal(200),
      'fantom-4': new MockDecimal(900),
    };
    expect(result.current).toEqual(expected);
  });

  test('returns a empty map when there is error', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getServices as unknown as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    const { result, waitForNextUpdate } = renderHook(() => usePoolBalances());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, hook will return empty map which wont trigger rerender becoz it's same as initial value
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });
});
