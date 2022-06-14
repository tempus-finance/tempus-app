import { act, renderHook } from '@testing-library/react-hooks';
import { of, of as mockOf, delay as mockDelay, merge as mockMerge, throwError } from 'rxjs';
import { Decimal, Decimal as MockDecimal, getDefinedServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { pool1 as mockPool1, pool2 as mockPool2 } from '../setupTests';
import { useTvlData, useTotalTvl, subscribeTvlData, resetTvlData } from './useTvlData';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getDefinedServices: jest.fn(),
}));

jest.mock('./useServicesLoaded', () => ({
  ...jest.requireActual('./useServicesLoaded'),
  servicesLoaded$: mockOf(true),
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

describe('useTvlData', () => {
  beforeAll(getConfigManager);

  test('returns a total TVL of all pools', async () => {
    act(() => {
      resetTvlData();
      subscribeTvlData();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTotalTvl());

    expect(result.current.toString()).toEqual('0');

    await waitForNextUpdate();
    expect(result.current.toString()).toEqual('31000');
  });

  test('returns a TVL map of all pools', async () => {
    act(() => {
      resetTvlData();
      subscribeTvlData();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTvlData());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    const expected = {
      'ethereum-1': new Decimal(5000),
      'ethereum-2': new Decimal(7000),
      'fantom-3': new Decimal(2000),
      'fantom-4': new Decimal(9000),
      'fantom-5': new Decimal(8000),
    };
    expect(result.current).toEqual(expected);
  });

  test('directly get the latest value for 2nd hooks', async () => {
    act(() => {
      resetTvlData();
      subscribeTvlData();
    });

    const { result: result1, waitForNextUpdate } = renderHook(() => useTvlData());

    expect(result1.current).toEqual({});

    await waitForNextUpdate();

    const expected = {
      'ethereum-1': new Decimal(5000),
      'ethereum-2': new Decimal(7000),
      'fantom-3': new Decimal(2000),
      'fantom-4': new Decimal(9000),
      'fantom-5': new Decimal(8000),
    };
    expect(result1.current).toEqual(expected);
    const functionCalledCount = (getDefinedServices as jest.Mock).mock.calls.length;

    const { result: result2 } = renderHook(() => useTvlData());

    expect(result2.current).toEqual(expected);
    expect(getDefinedServices).toHaveBeenCalledTimes(functionCalledCount);
  });

  test('fetch data when receiving appEvent$', async () => {
    const mockTotalValueLockedUSD = jest.fn().mockReturnValue(of(new Decimal(1000)));
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        totalValueLockedUSD: mockTotalValueLockedUSD,
      },
    }));

    act(() => {
      resetTvlData();
      subscribeTvlData();
    });

    const { waitForNextUpdate } = renderHook(() => useTvlData());

    await waitForNextUpdate();

    expect(mockTotalValueLockedUSD).toHaveBeenCalledTimes(5);

    mockTotalValueLockedUSD.mockReturnValue(of(new Decimal(1100)));
    await waitForNextUpdate({ timeout: 2000 });

    expect(mockTotalValueLockedUSD).toHaveBeenCalledTimes(6);

    mockTotalValueLockedUSD.mockReturnValue(of(new Decimal(1200)));
    await waitForNextUpdate({ timeout: 2000 });

    expect(mockTotalValueLockedUSD).toHaveBeenCalledTimes(7);

    mockTotalValueLockedUSD.mockReturnValue(of(new Decimal(1300)));
    await waitForNextUpdate({ timeout: 2000 });

    expect(mockTotalValueLockedUSD).toHaveBeenCalledTimes(8);

    mockTotalValueLockedUSD.mockReturnValue(of(new Decimal(1400)));
    await waitForNextUpdate({ timeout: 2000 });

    expect(mockTotalValueLockedUSD).toHaveBeenCalledTimes(9);
  });

  test('no updates when service map is null', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockReturnValue(null);

    act(() => {
      resetTvlData();
      subscribeTvlData();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTvlData());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when there is error when getDefinedServices()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    act(() => {
      resetTvlData();
      subscribeTvlData();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTvlData());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when there is error when StatisticsService.totalValueLockedUSD()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        totalValueLockedUSD: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      },
    }));

    act(() => {
      resetTvlData();
      subscribeTvlData();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTvlData());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when there is Observable<Error> when StatisticsService.totalValueLockedUSD()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        totalValueLockedUSD: jest.fn().mockReturnValue(throwError(() => new Error())),
      },
    }));

    act(() => {
      resetTvlData();
      subscribeTvlData();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTvlData());

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
