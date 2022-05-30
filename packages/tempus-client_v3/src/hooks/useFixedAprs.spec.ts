import { renderHook } from '@testing-library/react-hooks';
import { of } from 'rxjs';
import { DAYS_IN_A_YEAR, Decimal, getServices, ONE, SECONDS_IN_A_DAY } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { pool1, pool2, pool3, pool4 } from '../setupTests';
import { useFixedAprs } from './useFixedAprs';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

const mockGetDepositedEvents = jest.fn();
const mockGetRedeemedEvents = jest.fn();
const mockGetSwapEvents = jest.fn();
const mockEstimatedDepositAndFix = jest.fn();

describe('useFixedAprs', () => {
  let originalDateNow = Date.now;

  beforeAll(async () => {
    const config = getConfigManager();
    await config.init();

    jest.resetAllMocks();
  });

  beforeEach(() => {
    originalDateNow = Date.now;
    Date.now = () => new Date(2022, 4, 15).getTime();
  });

  afterEach(() => {
    Date.now = originalDateNow;
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

    const { result } = renderHook(() => useFixedAprs());

    expect(result.current).toEqual({});
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
    };
    expect(result.current).toEqual(expectedResult);
  });

  test('returns `{}` when there is an error', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getServices as unknown as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    const { result, waitForNextUpdate } = renderHook(() => useFixedAprs());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, hook will return empty map which wont trigger rerender because it's same as initial value
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });
});
