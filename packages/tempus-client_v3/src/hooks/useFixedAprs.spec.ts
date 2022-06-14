import { act, renderHook } from '@testing-library/react-hooks';
import { of, of as mockOf, delay as mockDelay, merge as mockMerge, throwError } from 'rxjs';
import {
  DAYS_IN_A_YEAR,
  Decimal,
  Decimal as MockDecimal,
  getDefinedServices,
  getDefaultProvider,
  ONE,
  SECONDS_IN_A_DAY,
} from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import {
  pool1,
  pool2,
  pool3,
  pool4,
  pool5,
  pool1 as mockPool1,
  pool2 as mockPool2,
  pool3 as mockPool3,
  pool4 as mockPool4,
  pool5 as mockPool5,
} from '../setupTests';
import { useFixedAprs, subscribeFixedAprs, resetFixedAprs } from './useFixedAprs';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getDefaultProvider: jest.fn(),
  getDefinedServices: jest.fn(),
}));

jest.mock('./useServicesLoaded', () => ({
  ...jest.requireActual('./useServicesLoaded'),
  servicesLoaded$: mockOf(true).pipe(mockDelay(100)), // there is a chance that the mock subscribe and run before it mocks
}));

jest.mock('./useAppEvent', () => ({
  ...jest.requireActual('./useAppEvent'),
  appEvent$: mockMerge(
    mockOf({
      eventType: 'deposit',
      tempusPool: mockPool1,
      amount: new MockDecimal(1),
    }).pipe(mockDelay(1000)),
    mockOf({
      eventType: 'withdraw',
      tempusPool: mockPool1,
      amount: new MockDecimal(1),
    }).pipe(mockDelay(2000)),
    mockOf({
      eventType: 'deposit',
      tempusPool: mockPool2,
      amount: new MockDecimal(2),
    }).pipe(mockDelay(3000)),
    mockOf({
      eventType: 'withdraw',
      tempusPool: mockPool2,
      amount: new MockDecimal(2),
    }).pipe(mockDelay(4000)),
  ),
}));

jest.mock('./usePoolList', () => ({
  ...jest.requireActual('./usePoolList'),
  poolList$: mockOf([
    mockPool1,
    mockPool2,
    mockPool3,
    mockPool4,
    mockPool5,
    {
      ...mockPool1,
      address: '6',
      poolId: 'ethereum-6',
      startDate: Date.UTC(2000, 0, 1),
      maturityDate: Date.UTC(2000, 6, 1),
    },
  ]),
}));

describe('useFixedAprs', () => {
  beforeAll(getConfigManager);

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.UTC(2022, 4, 15));
  });

  it('returns `{}` as initial value', async () => {
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusControllerService: {
        getDepositedEvents: jest.fn().mockResolvedValue([]),
        getRedeemedEvents: jest.fn().mockResolvedValue([]),
      },
      VaultService: {
        getSwapEvents: jest.fn().mockResolvedValue([]),
      },
      StatisticsService: {
        estimatedDepositAndFix: jest.fn().mockReturnValue(of(new Decimal('1.05'))),
      },
    }));

    act(() => {
      resetFixedAprs();
      subscribeFixedAprs();
    });

    const { result } = renderHook(() => useFixedAprs());

    expect(result.current).toEqual({});
  });

  it('should return 0% for matured pool', async () => {
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusControllerService: {
        getDepositedEvents: jest.fn().mockResolvedValue([]),
        getRedeemedEvents: jest.fn().mockResolvedValue([]),
      },
      VaultService: {
        getSwapEvents: jest.fn().mockResolvedValue([]),
      },
      StatisticsService: {
        estimatedDepositAndFix: jest.fn().mockReturnValue(of(new Decimal('1.05'))),
      },
    }));

    act(() => {
      resetFixedAprs();
      subscribeFixedAprs();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedAprs());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    expect(result.current['ethereum-6']).toEqual(new Decimal(0));
  });

  it('should get the latest blocks from events', async () => {
    const mockGetBlock = jest.fn().mockResolvedValue({ number: 3456, timestamp: Date.UTC(2022, 0, 1) / 1000 });
    (getDefaultProvider as jest.Mock).mockImplementation(() => ({
      getBlock: mockGetBlock,
    }));
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusControllerService: {
        getDepositedEvents: jest.fn().mockResolvedValue([{ blockNumber: 1234 }]),
        getRedeemedEvents: jest.fn().mockResolvedValue([{ blockNumber: 2345 }]),
      },
      VaultService: {
        getSwapEvents: jest.fn().mockResolvedValue([{ blockNumber: 3456 }]),
      },
      StatisticsService: {
        estimatedDepositAndFix: jest.fn().mockReturnValue(of(new Decimal('1.05'))),
      },
    }));

    act(() => {
      resetFixedAprs();
      subscribeFixedAprs();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedAprs());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    expect(mockGetBlock).toHaveBeenCalledWith(3456);
  });

  it('directly get the latest value for 2nd hooks', async () => {
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusControllerService: {
        getDepositedEvents: jest.fn().mockResolvedValue([]),
        getRedeemedEvents: jest.fn().mockResolvedValue([]),
      },
      VaultService: {
        getSwapEvents: jest.fn().mockResolvedValue([]),
      },
      StatisticsService: {
        estimatedDepositAndFix: jest.fn().mockReturnValue(of(new Decimal('1.05'))),
      },
    }));

    act(() => {
      resetFixedAprs();
      subscribeFixedAprs();
    });

    const { result: result1, waitForNextUpdate } = renderHook(() => useFixedAprs());

    expect(result1.current).toEqual({});

    await waitForNextUpdate();

    const expected = {
      'ethereum-1': new Decimal('0.018964322826463455'),
      'ethereum-2': new Decimal('0.027805992889791775'),
      'fantom-3': new Decimal('0.017293114339861025'),
      'fantom-4': new Decimal('0.08514774494556765'),
      'fantom-5': new Decimal('0.066043425814234015'),
      'ethereum-6': new Decimal(0),
    };
    Object.entries(expected).forEach(([key, value]) => {
      expect(parseFloat(value.toString())).toBeCloseTo(parseFloat(result1.current[key].toString()));
    });
    const functionCalledCount = (getDefinedServices as jest.Mock).mock.calls.length;

    const { result: result2 } = renderHook(() => useFixedAprs());

    expect(result2.current).toEqual(result1.current);
    expect(getDefinedServices).toHaveBeenCalledTimes(functionCalledCount);
  });

  it('returns pool-to-APR map based on spot price', async () => {
    const principalsAmount = new Decimal('1.05');

    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusControllerService: {
        getDepositedEvents: jest.fn().mockResolvedValue([]),
        getRedeemedEvents: jest.fn().mockResolvedValue([]),
      },
      VaultService: {
        getSwapEvents: jest.fn().mockResolvedValue([]),
      },
      StatisticsService: {
        estimatedDepositAndFix: jest.fn().mockReturnValue(of(principalsAmount)),
      },
    }));

    act(() => {
      resetFixedAprs();
      subscribeFixedAprs();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedAprs());

    await waitForNextUpdate();

    const scalingFactor = (pool: { maturityDate: number }) => {
      const poolTimeRemaining = (pool.maturityDate - Date.now()) / 1000;
      return new Decimal((SECONDS_IN_A_DAY * DAYS_IN_A_YEAR) / poolTimeRemaining);
    };

    const expectedResult = {
      'ethereum-1': principalsAmount.div(pool1.spotPrice).sub(ONE).mul(scalingFactor(pool1)),
      'ethereum-2': principalsAmount.div(pool2.spotPrice).sub(ONE).mul(scalingFactor(pool2)),
      'fantom-3': principalsAmount.div(pool3.spotPrice).sub(ONE).mul(scalingFactor(pool3)),
      'fantom-4': principalsAmount.div(pool4.spotPrice).sub(ONE).mul(scalingFactor(pool4)),
      'fantom-5': principalsAmount.div(pool5.spotPrice).sub(ONE).mul(scalingFactor(pool5)),
      'ethereum-6': new Decimal(0),
    };
    expect(result.current).toEqual(expectedResult);
  });

  it('fetch data when receiving appEvent$', async () => {
    const mockEstimatedDepositAndFix = jest.fn().mockReturnValue(of(new Decimal('1.05')));
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusControllerService: {
        getDepositedEvents: jest.fn().mockResolvedValue([]),
        getRedeemedEvents: jest.fn().mockResolvedValue([]),
      },
      VaultService: {
        getSwapEvents: jest.fn().mockResolvedValue([]),
      },
      StatisticsService: {
        estimatedDepositAndFix: mockEstimatedDepositAndFix,
      },
    }));

    act(() => {
      resetFixedAprs();
      subscribeFixedAprs();
    });

    const { waitForNextUpdate } = renderHook(() => useFixedAprs());

    await waitForNextUpdate();

    expect(mockEstimatedDepositAndFix).toHaveBeenCalledTimes(5);

    mockEstimatedDepositAndFix.mockReturnValue(of(new Decimal('1.25')));
    await waitForNextUpdate({ timeout: 2000 });

    expect(mockEstimatedDepositAndFix).toHaveBeenCalledTimes(6);

    mockEstimatedDepositAndFix.mockReturnValue(of(new Decimal('1.45')));
    await waitForNextUpdate({ timeout: 2000 });

    expect(mockEstimatedDepositAndFix).toHaveBeenCalledTimes(7);

    mockEstimatedDepositAndFix.mockReturnValue(of(new Decimal('1.65')));
    await waitForNextUpdate({ timeout: 2000 });

    expect(mockEstimatedDepositAndFix).toHaveBeenCalledTimes(8);

    mockEstimatedDepositAndFix.mockReturnValue(of(new Decimal('1.85')));
    await waitForNextUpdate({ timeout: 2000 });

    expect(mockEstimatedDepositAndFix).toHaveBeenCalledTimes(9);
  });

  it('no updates when service map is null', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockReturnValue(null);

    act(() => {
      resetFixedAprs();
      subscribeFixedAprs();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedAprs());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  it('no updates when there is an error when getDefinedServices()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    act(() => {
      resetFixedAprs();
      subscribeFixedAprs();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedAprs());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  it('no updates when there is an error when TempusControllerService.getDepositedEvents()', async () => {
    const principalsAmount = new Decimal('1.05');

    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusControllerService: {
        getDepositedEvents: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
        getRedeemedEvents: jest.fn().mockResolvedValue([]),
      },
      VaultService: {
        getSwapEvents: jest.fn().mockResolvedValue([]),
      },
      StatisticsService: {
        estimatedDepositAndFix: jest.fn().mockReturnValue(of(principalsAmount)),
      },
    }));

    act(() => {
      resetFixedAprs();
      subscribeFixedAprs();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedAprs());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  it('no updates when there is an error when TempusControllerService.getRedeemedEvents()', async () => {
    const principalsAmount = new Decimal('1.05');

    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusControllerService: {
        getDepositedEvents: jest.fn().mockResolvedValue([]),
        getRedeemedEvents: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      },
      VaultService: {
        getSwapEvents: jest.fn().mockResolvedValue([]),
      },
      StatisticsService: {
        estimatedDepositAndFix: jest.fn().mockReturnValue(of(principalsAmount)),
      },
    }));

    act(() => {
      resetFixedAprs();
      subscribeFixedAprs();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedAprs());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  it('no updates when there is an error when VaultService.getSwapEvents()', async () => {
    const principalsAmount = new Decimal('1.05');

    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusControllerService: {
        getDepositedEvents: jest.fn().mockResolvedValue([]),
        getRedeemedEvents: jest.fn().mockResolvedValue([]),
      },
      VaultService: {
        getSwapEvents: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      },
      StatisticsService: {
        estimatedDepositAndFix: jest.fn().mockReturnValue(of(principalsAmount)),
      },
    }));

    act(() => {
      resetFixedAprs();
      subscribeFixedAprs();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedAprs());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  it('no updates when there is an error when StatisticsService.estimatedDepositAndFix()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusControllerService: {
        getDepositedEvents: jest.fn().mockResolvedValue([]),
        getRedeemedEvents: jest.fn().mockResolvedValue([]),
      },
      VaultService: {
        getSwapEvents: jest.fn().mockResolvedValue([]),
      },
      StatisticsService: {
        estimatedDepositAndFix: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      },
    }));

    act(() => {
      resetFixedAprs();
      subscribeFixedAprs();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedAprs());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  it('no updates when there is an Observable<Error> when StatisticsService.estimatedDepositAndFix()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusControllerService: {
        getDepositedEvents: jest.fn().mockResolvedValue([]),
        getRedeemedEvents: jest.fn().mockResolvedValue([]),
      },
      VaultService: {
        getSwapEvents: jest.fn().mockResolvedValue([]),
      },
      StatisticsService: {
        estimatedDepositAndFix: jest.fn().mockReturnValue(throwError(() => new Error())),
      },
    }));

    act(() => {
      resetFixedAprs();
      subscribeFixedAprs();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedAprs());

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
