import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { delay, of } from 'rxjs';
import { Decimal, getServices, TempusPool, Ticker } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { pool1, pool2 } from '../setupTests';
import { setTempusPoolsForDepositModal, useDepositModalData } from './useDepositModalData';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

const mockGetDepositedEvents = jest.fn();
const mockGetRedeemedEvents = jest.fn();
const mockGetSwapEvents = jest.fn();
const mockEstimatedDepositAndFix = jest.fn();

describe('useDepositModal', () => {
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

  it('returns values from the selected pool', async () => {
    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      TempusControllerService: {
        getDepositedEvents: mockGetDepositedEvents.mockImplementation(() => []),
        getRedeemedEvents: mockGetRedeemedEvents.mockImplementation(() => []),
      },
      VaultService: {
        getSwapEvents: mockGetSwapEvents.mockImplementation(() => []),
      },
      StatisticsService: {
        estimatedDepositAndFix: mockEstimatedDepositAndFix.mockImplementation((tempusAmmAddress: string) => {
          if (tempusAmmAddress === pool2.ammAddress) {
            return of<Decimal>(new Decimal('104.5678')).pipe(delay(1000));
          }

          return of<Decimal>(new Decimal('23.45')).pipe(delay(1000));
        }),
      },
    }));

    const useDepositModalProps = useDepositModalData();
    const { result, waitForNextUpdate } = renderHook(() => useDepositModalProps());

    expect(result.current).toEqual(null);

    await act(async () => {
      setTempusPoolsForDepositModal([pool1 as TempusPool, pool2 as TempusPool]);
    });

    await waitForNextUpdate({ timeout: 5000 });

    expect(result.current?.poolStartDate).toEqual(new Date(1640995200000));

    expect(parseFloat(String(result.current?.maturityTerms[0].apr))).toBeCloseTo(8.51756247563775);
    expect(result.current?.maturityTerms[0].date).toEqual(new Date(Date.UTC(2025, 0, 1)));

    expect(parseFloat(String(result.current?.maturityTerms[1].apr))).toBeCloseTo(12.490441409971417);
    expect(result.current?.maturityTerms[1].date).toEqual(new Date(Date.UTC(2024, 2, 1)));

    expect(result.current?.tokens[0].precision).toBe(18);
    expect(result.current?.tokens[0].ticker).toBe('ETH');
    expect(result.current?.tokens[0].rate.toString()).toBe('1');

    expect(result.current?.tokens[1].precision).toBe(6);
    expect(result.current?.tokens[1].ticker).toBe('USDC');
    expect(result.current?.tokens[1].rate.toString()).toBe('1');
  });
});
