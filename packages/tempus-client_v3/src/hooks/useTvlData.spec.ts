import { act, renderHook } from '@testing-library/react-hooks';
import { of as mockOf, throwError } from 'rxjs';
import { Decimal, getDefinedServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { useTvlData, useTotalTvl, subscribeTvlData, resetTvlData } from './useTvlData';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getDefinedServices: jest.fn(),
}));

jest.mock('./useServicesLoaded', () => ({
  ...jest.requireActual('./useServicesLoaded'),
  servicesLoaded$: mockOf(true),
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
