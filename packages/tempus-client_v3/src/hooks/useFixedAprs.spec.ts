import { act, renderHook } from '@testing-library/react-hooks';
import { of, of as mockOf, delay as mockDelay } from 'rxjs';
import { DAYS_IN_A_YEAR, Decimal, getServices, ONE, SECONDS_IN_A_DAY } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { pool1, pool2, pool3, pool4, pool5 } from '../setupTests';
import { useFixedAprs, subscribe, reset } from './useFixedAprs';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

jest.mock('./useServicesLoaded', () => ({
  ...jest.requireActual('./useServicesLoaded'),
  servicesLoaded$: mockOf(true).pipe(mockDelay(100)), // there is a chance that the mock subscribe and run before it mocks
}));

const mockGetDepositedEvents = jest.fn();
const mockGetRedeemedEvents = jest.fn();
const mockGetSwapEvents = jest.fn();
const mockEstimatedDepositAndFix = jest.fn();

describe('useFixedAprs', () => {
  beforeAll(getConfigManager);

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.UTC(2022, 4, 15));
  });

  it('returns `{}` as initial value', async () => {
    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusControllerService: {
        getDepositedEvents: mockGetDepositedEvents.mockImplementation(() => []),
        getRedeemedEvents: mockGetRedeemedEvents.mockImplementation(() => []),
      },
      VaultService: {
        getSwapEvents: mockGetSwapEvents.mockImplementation(() => []),
      },
      StatisticsService: {
        estimatedDepositAndFix: mockEstimatedDepositAndFix.mockImplementation(() => of<Decimal>(new Decimal('1.05'))),
      },
    }));

    act(() => {
      reset();
      subscribe();
    });

    const { result } = renderHook(() => useFixedAprs());

    expect(result.current).toEqual({});
  });

  test('directly get the latest value for 2nd hooks', async () => {
    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusControllerService: {
        getDepositedEvents: mockGetDepositedEvents.mockImplementation(() => []),
        getRedeemedEvents: mockGetRedeemedEvents.mockImplementation(() => []),
      },
      VaultService: {
        getSwapEvents: mockGetSwapEvents.mockImplementation(() => []),
      },
      StatisticsService: {
        estimatedDepositAndFix: mockEstimatedDepositAndFix.mockImplementation(() => of<Decimal>(new Decimal('1.05'))),
      },
    }));

    act(() => {
      reset();
      subscribe();
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
    };
    Object.entries(expected).forEach(([key, value]) => {
      expect(parseFloat(value.toString())).toBeCloseTo(parseFloat(result1.current[key].toString()));
    });
    const functionCalledCount = (getServices as jest.Mock).mock.calls.length;

    const { result: result2 } = renderHook(() => useFixedAprs());

    expect(result2.current).toEqual(result1.current);
    expect(getServices).toHaveBeenCalledTimes(functionCalledCount);
  });

  it('returns pool-to-APR map based on spot price', async () => {
    const principalsAmount = new Decimal('1.05');

    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusControllerService: {
        getDepositedEvents: mockGetDepositedEvents.mockImplementation(() => []),
        getRedeemedEvents: mockGetRedeemedEvents.mockImplementation(() => []),
      },
      VaultService: {
        getSwapEvents: mockGetSwapEvents.mockImplementation(() => []),
      },
      StatisticsService: {
        estimatedDepositAndFix: mockEstimatedDepositAndFix.mockImplementation(() => of(principalsAmount)),
      },
    }));

    act(() => {
      reset();
      subscribe();
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
    };
    expect(result.current).toEqual(expectedResult);
  });

  test('no updates when service map is null', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getServices as unknown as jest.Mock).mockReturnValue(null);

    act(() => {
      reset();
      subscribe();
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

  test('no updates when there is an error', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getServices as unknown as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    act(() => {
      reset();
      subscribe();
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
