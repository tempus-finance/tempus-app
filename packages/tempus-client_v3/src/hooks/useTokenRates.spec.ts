import { act, renderHook } from '@testing-library/react-hooks';
import { of as mockOf, delay as mockDelay } from 'rxjs';
import { Chain, Decimal, getServices, Ticker } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { reset, subscribe, useTokenRates } from './useTokenRates';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

jest.mock('./useServicesLoaded', () => ({
  ...jest.requireActual('./useServicesLoaded'),
  servicesLoaded$: mockOf(true).pipe(mockDelay(100)), // there is a chance that the mock subscribe and run before it mocks
}));

describe('useTokenRates', () => {
  beforeAll(getConfigManager);

  test('returns all tokens used by all pools', async () => {
    act(() => {
      reset();
      subscribe();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenRates());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    expect(result.current['ethereum-0x0000000000000000000000000000000000000000']).toEqual(new Decimal(2999));
    expect(result.current['ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48']).toEqual(new Decimal(0.999));
    expect(result.current['fantom-0x74b23882a30290451A17c44f4F05243b6b58C76d']).toEqual(new Decimal(3001));
    expect(result.current['fantom-0x04068da6c83afcfa0e13ba15a6696662335d5b75']).toEqual(new Decimal(1.001));
  });

  test('directly get the latest value for 2nd hooks', async () => {
    act(() => {
      reset();
      subscribe();
    });

    const { result: result1, waitForNextUpdate } = renderHook(() => useTokenRates());

    expect(result1.current).toEqual({});

    await waitForNextUpdate();

    expect(result1.current['ethereum-0x0000000000000000000000000000000000000000']).toEqual(new Decimal(2999));
    expect(result1.current['ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48']).toEqual(new Decimal(0.999));
    expect(result1.current['fantom-0x74b23882a30290451A17c44f4F05243b6b58C76d']).toEqual(new Decimal(3001));
    expect(result1.current['fantom-0x04068da6c83afcfa0e13ba15a6696662335d5b75']).toEqual(new Decimal(1.001));

    const functionCalledCount = (getServices as jest.Mock).mock.calls.length;

    const { result: result2 } = renderHook(() => useTokenRates());

    expect(result2.current).toEqual(result1.current);
    expect(getServices).toHaveBeenCalledTimes(functionCalledCount);
  });

  test('no updates when service map is null', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getServices as unknown as jest.Mock).mockReturnValue(null);

    act(() => {
      reset();
      subscribe();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenRates());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when StatisticsService.getRate return null', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        getRate: jest.fn().mockReturnValue(mockOf(null)),
      },
      TempusPoolService: {
        currentInterestRate: jest.fn().mockResolvedValue(new Decimal(1)),
        numAssetsPerYieldToken: jest.fn().mockResolvedValue(new Decimal(1)),
      },
    }));

    act(() => {
      reset();
      subscribe();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenRates());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).not.toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when there is error when StatisticsService.getRate()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        getRate: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      },
      TempusPoolService: {
        currentInterestRate: jest.fn().mockResolvedValue(new Decimal(1)),
        numAssetsPerYieldToken: jest.fn().mockResolvedValue(new Decimal(1)),
      },
    }));

    act(() => {
      reset();
      subscribe();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenRates());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when there is error when TempusPoolService.currentInterestRate()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      ...getServices,
      StatisticsService: {
        getRate: jest.fn().mockImplementation((chain: Chain, tokenTicker: Ticker) => {
          let price = new Decimal(0);
          switch (tokenTicker) {
            case 'ETH':
              price = new Decimal(2999);
              break;
            case 'WETH':
              price = new Decimal(3001);
              break;
            case 'USDC':
              price = new Decimal(chain === 'fantom' ? 1.001 : 0.999);
              break;
            default:
          }

          return mockOf(price);
        }),
      },
      TempusPoolService: {
        currentInterestRate: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
        numAssetsPerYieldToken: jest.fn().mockResolvedValue(new Decimal(1)),
      },
    }));

    act(() => {
      reset();
      subscribe();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenRates());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when there is error when TempusPoolService.numAssetsPerYieldToken()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      ...getServices,
      StatisticsService: {
        getRate: jest.fn().mockImplementation((chain: Chain, tokenTicker: Ticker) => {
          let price = new Decimal(0);
          switch (tokenTicker) {
            case 'ETH':
              price = new Decimal(2999);
              break;
            case 'WETH':
              price = new Decimal(3001);
              break;
            case 'USDC':
              price = new Decimal(chain === 'fantom' ? 1.001 : 0.999);
              break;
            default:
          }

          return mockOf(price);
        }),
      },
      TempusPoolService: {
        currentInterestRate: jest.fn().mockResolvedValue(new Decimal(1)),
        numAssetsPerYieldToken: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      },
    }));

    act(() => {
      reset();
      subscribe();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenRates());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });
});
