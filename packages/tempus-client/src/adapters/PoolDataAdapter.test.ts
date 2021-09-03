import PoolDataAdapter from './PoolDataAdapter';

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

describe('PoolDataAdapter', () => {
  let instance: PoolDataAdapter;

  const mockProvider = new JsonRpcProvider();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockGetTempusControllerService = jest.fn();
    const mockGetERC20TokenService = jest.fn().mockImplementation((address: string) => {
      if (address === 'backing-token-address') {
        return {
          balanceOf: jest.fn().mockResolvedValue(10),
        };
      } else {
        return {
          balanceOf: jest.fn().mockResolvedValue(20),
        };
      }
    });
    const mockGetStatisticsService = jest.fn().mockImplementation(() => {
      return { getRate: jest.fn().mockResolvedValue(0.5) };
    });

    const mockGetTempusPoolService = jest.fn().mockImplementation(() => {
      return {
        getBackingTokenAddress: jest.fn().mockResolvedValue('backing-token-address'),
        getBackingTokenTicker: jest.fn().mockResolvedValue('backing-token-ticker'),
        getYieldBearingTokenAddress: jest.fn().mockResolvedValue('yield-bearing-token-address'),
        numAssetsPerYieldToken: jest.fn().mockResolvedValue('1'),
      };
    });

    instance = new PoolDataAdapter();
    instance.init({
      eRC20TokenServiceGetter: mockGetERC20TokenService,
      statisticService: mockGetStatisticsService(),
      tempusControllerAddress: 'mock-tempus-controller-address',
      tempusControllerService: mockGetTempusControllerService(),
      tempusPoolService: mockGetTempusPoolService(),
    });
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
        backingTokenRate: 0.5,
        yieldBearingTokenBalance: 20,
        yieldBearingTokenRate: 0.5,
      });
    });
  });
});
