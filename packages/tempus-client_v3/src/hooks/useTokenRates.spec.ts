import { renderHook } from '@testing-library/react-hooks';
import { of } from 'rxjs';
import { Chain, Decimal, getServices, Ticker } from 'tempus-core-services';
import { useTokenRates } from './useTokenRates';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

describe('useTokenRates', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });
  afterEach(() => {
    jest.resetAllMocks();
    console.error = originalConsoleError;
  });

  test('returns all tokens used by all pools', async () => {
    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        getRate: jest.fn().mockImplementation((chain: Chain, tokenTicker: Ticker) => {
          let price = new Decimal(0);
          switch (tokenTicker) {
            case 'ETH':
              price = new Decimal(chain === 'fantom' ? 3001 : 2999);
              break;
            case 'USDC':
              price = new Decimal(chain === 'fantom' ? 1.001 : 0.999);
              break;
            default:
          }

          return of(price);
        }),
      },
    }));

    const { result, waitForNextUpdate } = renderHook(() => useTokenRates());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    expect(result.current['ethereum-ETH']).toEqual(new Decimal(2999));
    expect(result.current['ethereum-USDC']).toEqual(new Decimal(0.999));
    expect(result.current['fantom-ETH']).toEqual(new Decimal(3001));
    expect(result.current['fantom-USDC']).toEqual(new Decimal(1.001));
  });

  test('returns empty map when service throw error', async () => {
    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        getRate: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      },
    }));

    const { result, waitForNextUpdate } = renderHook(() => useTokenRates());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, hook will return empty map which wont trigger rerender becoz it's same as initial value
      expect(e).toBeDefined();
    }
  });
});
