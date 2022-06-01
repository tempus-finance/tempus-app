import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { delay, of, of as mockOf } from 'rxjs';
import { Decimal, Decimal as MockDecimal, getServices, TempusPool } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { pool4, pool4 as mockPool4, pool5 } from '../setupTests';
import { setTempusPoolsForDepositModal, useDepositModalData } from './useDepositModalData';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

jest.mock('./useTokenRates', () => ({
  ...jest.requireActual('./useTokenRates'),
  tokenRates$: mockOf({
    [`${mockPool4.chain}-${mockPool4.backingTokenAddress}`]: new MockDecimal(1900),
    [`${mockPool4.chain}-${mockPool4.yieldBearingTokenAddress}`]: new MockDecimal(1950),
  }),
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
    config.init();
  });

  beforeEach(() => {
    originalDateNow = Date.now;
    Date.now = () => new Date(Date.UTC(2022, 4, 15)).getTime();
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
          if (tempusAmmAddress === pool5.ammAddress) {
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
      setTempusPoolsForDepositModal([pool4 as TempusPool, pool5 as TempusPool]);
    });

    await waitForNextUpdate({ timeout: 5000 });

    expect(result.current?.poolStartDate).toEqual(new Date(1647216000000));

    expect(parseFloat(String(result.current?.maturityTerms[0].apr))).toBeCloseTo(38.29088785046729);
    expect(result.current?.maturityTerms[0].date).toEqual(new Date(Date.UTC(2022, 11, 15)));

    expect(parseFloat(String(result.current?.maturityTerms[1].apr))).toBeCloseTo(29.6893115942029);
    expect(result.current?.maturityTerms[1].date).toEqual(new Date(Date.UTC(2023, 1, 15)));

    expect(result.current?.tokens[0].precision).toBe(18);
    expect(result.current?.tokens[0].ticker).toBe('WETH');
    expect(result.current?.tokens[0].rate).toEqual(new Decimal(1900));

    expect(result.current?.tokens[1].precision).toBe(18);
    expect(result.current?.tokens[1].ticker).toBe('yvWETH');
    expect(result.current?.tokens[1].rate).toEqual(new Decimal(1950));
  });
});
