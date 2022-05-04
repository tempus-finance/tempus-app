import { renderHook } from '@testing-library/react-hooks';
import { from } from 'rxjs';
import { Chain, Decimal, getServices } from 'tempus-core-services';
import { useTvlData } from './useTvlData';

jest.mock('../config/getConfig', () => ({
  getConfig: () =>
    Promise.resolve({
      ethereum: {
        tempusPools: [
          {
            address: '1',
            backingToken: 'ETH',
          },
          {
            address: '2',
            backingToken: 'USDC',
          },
        ],
      },
      fantom: {
        tempusPools: [
          {
            address: '3',
            backingToken: 'USDC',
          },
          {
            address: '4',
            backingToken: 'ETH',
          },
        ],
      },
    }),
}));

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

describe('useTvlData', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  test('returns a TVL of all pools', async () => {
    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        totalValueLockedUSD: jest.fn().mockImplementation((chain: Chain, address: string) => {
          if (chain === 'ethereum') {
            if (address === '1') {
              return from<Decimal[]>([new Decimal('5')]);
            }

            if (address === '2') {
              return from<Decimal[]>([new Decimal('7')]);
            }
          }

          if (chain === 'fantom') {
            if (address === '3') {
              return from<Decimal[]>([new Decimal('2')]);
            }

            if (address === '4') {
              return from<Decimal[]>([new Decimal('9')]);
            }
          }

          return from<Decimal[]>([new Decimal('0')]);
        }),
      },
    }));

    const { result, waitForNextUpdate } = renderHook(() => useTvlData());

    expect(result.current.toString()).toBe('0');

    await waitForNextUpdate();
    expect(result.current.toString()).toBe('23');
  });
});
