import { renderHook } from '@testing-library/react-hooks';
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

jest.mock('tempus-core-services');
const { getServices } = jest.requireMock('tempus-core-services');
const { Decimal } = jest.requireActual('tempus-core-services');

describe('useTvlData', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  test('returns a TVL of all pools', async () => {
    getServices.mockImplementation(() => ({
      StatisticsService: {
        totalValueLockedUSD: jest.fn().mockImplementation((chain: string, address: string) => {
          switch (chain) {
            case 'ethereum': {
              switch (address) {
                case '1':
                  return Promise.resolve(new Decimal('5'));

                case '2':
                  return Promise.resolve(new Decimal('7'));

                default:
                  return Promise.reject();
              }
            }

            case 'fantom': {
              switch (address) {
                case '3':
                  return Promise.resolve(new Decimal('2'));

                case '4':
                  return Promise.resolve(new Decimal('9'));

                default:
                  return Promise.reject();
              }
            }

            default:
              return Promise.reject();
          }
        }),
      },
    }));

    const { result, waitForNextUpdate } = renderHook(() => useTvlData());

    expect(result.current.toString()).toBe(undefined);

    await waitForNextUpdate();
    expect(result.current.toString()).toBe('23');
  });
});
