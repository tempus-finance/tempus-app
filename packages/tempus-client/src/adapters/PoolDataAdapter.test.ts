import getPoolDataAdapter from './getPoolDataAdapter';
import PoolDataAdapter from './PoolDataAdapter';

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');
const mockProvider = new JsonRpcProvider();

jest.mock('../services/getTempusPoolService');
const getTempusPoolService = jest.requireMock('../services/getTempusPoolService');

jest.mock('../services/getTempusControllerService');
const getTempusControllerService = jest.requireMock('../services/getTempusControllerService');

jest.mock('../services/getERC20TokenService');
const getERC20TokenService = jest.requireMock('../services/getERC20TokenService');

jest.mock('../services/getStatisticsService');
const getStatisticsService = jest.requireMock('../services/getStatisticsService');

describe('PoolDataAdapter', () => {
  let instance: PoolDataAdapter;

  beforeEach(() => {
    jest.clearAllMocks();

    const mockBalanceOf = jest.fn();
    const mockGetRate = jest.fn();
    const mockGetBackingTokenAddress = jest.fn().mockImplementation(() => Promise.resolve('backingAddress'));

    getTempusControllerService.default.mockImplementation(() => {
      return {};
    });

    getTempusPoolService.default.mockImplementation(() => {
      console.log(1);
      return {
        getBackingTokenAddress: mockGetBackingTokenAddress, // this does not work
        // getBackingTokenAddress: () => Promise.resolve('backingAddress'), // this works
        getBackingTokenTicker: jest.fn().mockResolvedValue('BACKING'),
        getYieldBearingTokenAddress: jest.fn().mockResolvedValue('yieldAddress'),
        numAssetsPerYieldToken: jest.fn().mockResolvedValue('1'),
      };
    });

    getERC20TokenService.default.mockImplementation((address: string) => {
      // console.log('getERC20TokenService address', address);
      if (address === 'backingAddress') {
        return {
          balanceOf: mockBalanceOf.mockResolvedValue(10),
        };
      } else
        return {
          balanceOf: mockBalanceOf.mockResolvedValue(20),
        };
    });

    getStatisticsService.default.mockImplementation(() => {
      return { getRate: mockGetRate.mockResolvedValue(0.5) };
    });

    instance = getPoolDataAdapter(mockProvider);
  });

  describe('getPoolDataAdapter()', () => {
    test('returns a not null PoolDataAdapter instance', () => {
      expect(instance).toBeInstanceOf(PoolDataAdapter);
      expect(instance).not.toBe(null);
    });
  });

  describe('retrieveBalances()', () => {
    test('returns an object containing balances ', async () => {
      const tempusPoolAddress = 'abc';
      const userWalletAddress = 'xyz';
      const signer = mockProvider;

      const balances = await instance.retrieveBalances(tempusPoolAddress, userWalletAddress, signer);

      expect(balances).toEqual({
        backingTokenBalance: 10,
        backingTokenRate: 1,
        yieldBearingTokenBalance: 20,
        yieldBearingTokenRate: 1,
      });
    });
  });
});
