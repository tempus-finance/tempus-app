import { renderHook } from '@testing-library/react-hooks';
import { of } from 'rxjs';
import { DAYS_IN_A_YEAR, Decimal, getServices, ONE, SECONDS_IN_A_DAY, TempusPool } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { pool1 } from '../setupTests';
import { useMaturityTermHook } from './useMaturityTerm';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

const mockGetDepositedEvents = jest.fn();
const mockGetRedeemedEvents = jest.fn();
const mockGetSwapEvents = jest.fn();
const mockEstimatedDepositAndFix = jest.fn();

describe('useMaturityTerm', () => {
  let originalDateNow = Date.now;

  beforeAll(async () => {
    jest.resetAllMocks();

    const config = getConfigManager();
    await config.init();
  });

  beforeEach(() => {
    originalDateNow = Date.now;
    Date.now = () => new Date(2022, 4, 15).getTime();
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  it('returns a maturity term object from the selected pool', async () => {
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

    const useMaturityTerm = useMaturityTermHook(pool1 as TempusPool);
    const { result, waitForNextUpdate } = renderHook(() => useMaturityTerm());

    expect(result.current).toEqual(null);

    await waitForNextUpdate({ timeout: 5000 });

    const poolTimeRemaining = (pool1.maturityDate - Date.now()) / 1000;
    const scalingFactor = new Decimal((SECONDS_IN_A_DAY * DAYS_IN_A_YEAR) / poolTimeRemaining);

    expect(result.current).toEqual({
      apr: principalsAmount.div(pool1.spotPrice).sub(ONE).mul(scalingFactor),
      date: new Date(pool1.maturityDate),
    });
  });
});
