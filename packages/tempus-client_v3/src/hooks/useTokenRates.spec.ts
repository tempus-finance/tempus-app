import { renderHook } from '@testing-library/react-hooks';
import { BigNumber } from 'ethers';
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

          return of(price);
        }),
      },
      TempusPoolService: {
        currentInterestRate: jest.fn().mockImplementation(() => BigNumber.from(1)),
        numAssetsPerYieldToken: jest.fn().mockImplementation(() => BigNumber.from(1)),
      },
    }));

    const { result, waitForNextUpdate } = renderHook(() => useTokenRates());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    expect(result.current['ethereum-0x0000000000000000000000000000000000000000']).toEqual(new Decimal(2999));
    expect(result.current['ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48']).toEqual(new Decimal(0.999));
    expect(result.current['fantom-0x74b23882a30290451A17c44f4F05243b6b58C76d']).toEqual(new Decimal(3001));
    expect(result.current['fantom-0x04068da6c83afcfa0e13ba15a6696662335d5b75']).toEqual(new Decimal(1.001));
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
