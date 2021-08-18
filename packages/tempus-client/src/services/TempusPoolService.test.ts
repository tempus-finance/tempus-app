// Services
import TempusPoolService from './TempusPoolService';

jest.mock('ethers');
const { Contract } = jest.requireMock('ethers');
const { utils } = jest.requireMock('ethers');
const { BigNumber } = jest.requireActual('ethers');

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

jest.mock('./getERC20TokenService');
const getERC20TokenService = jest.requireMock('./getERC20TokenService');

describe('TempusPoolService', () => {
  const mockAddresses = ['someAddress'];
  const [mockAddress] = mockAddresses;

  const mockABI = {};
  const mockCurrentExchangeRate = jest.fn();
  const mockMaturityTime = jest.fn();
  const mockStartTime = jest.fn();
  const mockPriceOracle = jest.fn();
  const mockGetBlock = jest.fn();
  const mockYieldBearingToken = jest.fn();
  const mockCurrentRate = jest.fn();
  const getPriceOracleServiceMock = jest.fn();
  const mockQueryFilter = jest.fn();

  const mockSymbol = jest.fn();

  const mockProvider = new JsonRpcProvider();

  let instance: TempusPoolService;

  beforeEach(() => {
    Contract.mockImplementation(() => {
      return {
        currentExchangeRate: mockCurrentExchangeRate,
        maturityTime: mockMaturityTime,
        startTime: mockStartTime,
        priceOracle: mockPriceOracle,
        yieldBearingToken: mockYieldBearingToken,
        queryFilter: mockQueryFilter,
        provider: {
          getBlock: mockGetBlock,
        },
        filters: {
          Deposited: jest.fn(),
          Redeemed: jest.fn(),
        },
      };
    });

    getERC20TokenService.default.mockImplementation(() => {
      return {
        symbol: mockSymbol,
      };
    });
  });

  describe('constructor()', () => {
    test('it returns a valid instance', () => {
      instance = new TempusPoolService();

      expect(instance).not.toBe(undefined);
    });
  });

  describe('init()', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      instance = new TempusPoolService();
    });

    test('it initialize the instance', () => {
      instance.init({
        Contract,
        tempusPoolAddresses: mockAddresses,
        TempusPoolABI: mockABI,
        priceOracleService: getPriceOracleServiceMock(),
        signerOrProvider: mockProvider,
      });

      expect(instance).toBeInstanceOf(TempusPoolService);
    });
  });

  // TODO
  // - test Promise reject
  describe('methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      getPriceOracleServiceMock.mockImplementation(() => {
        return {
          currentRate: mockCurrentRate,
        };
      });
      mockCurrentRate.mockImplementation((address: string, tokenAddress: string, overrides: {}) => {
        if (!overrides) {
          return Promise.resolve(BigNumber.from('10'));
        } else {
          return Promise.resolve(BigNumber.from('9'));
        }
      });

      instance = new TempusPoolService();
      instance.init({
        Contract,
        tempusPoolAddresses: mockAddresses,
        TempusPoolABI: mockABI,
        priceOracleService: getPriceOracleServiceMock(),
        signerOrProvider: mockProvider,
      });
    });

    test('it returns a Promise that resolves with the value of the current exchange rate', () => {
      mockCurrentExchangeRate.mockImplementation(() =>
        Promise.resolve({
          toBigInt: jest.fn().mockReturnValue(123.45),
        }),
      );

      instance.getCurrentExchangeRate(mockAddress).then((result: any) => {
        expect(result).toBe(123.45);
      });
    });

    test('it returns a Promise that resolves with the value of the maturity time', () => {
      mockMaturityTime.mockImplementation(() =>
        Promise.resolve({
          toNumber: jest.fn().mockReturnValue(1617494400),
        }),
      );

      instance.getMaturityTime(mockAddress).then((result: any) => {
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2021);
        expect(result.getMonth()).toBe(3);
        expect(result.getUTCDate()).toBe(4);
      });
    });

    test('it returns a Promise that resolves with the value of the start time', () => {
      mockStartTime.mockImplementation(() =>
        Promise.resolve({
          toNumber: jest.fn().mockReturnValue(1617494400),
        }),
      );

      instance.getStartTime(mockAddress).then((result: Date) => {
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2021);
        expect(result.getMonth()).toBe(3);
        expect(result.getUTCDate()).toBe(4);
      });
    });

    test('it returns variable APY for the pool', () => {
      mockGetBlock.mockImplementation((blockNumber: number | string) => {
        if (blockNumber === 'latest') {
          return Promise.resolve({
            number: 100,
            timestamp: 200,
          });
        } else {
          return Promise.resolve({
            number: 50,
            timestamp: 100,
          });
        }
      });
      mockYieldBearingToken.mockImplementation(() => Promise.resolve('yield-bearing-token-address'));
      mockPriceOracle.mockImplementation(() => Promise.resolve('price-oracle-address'));

      utils.formatEther.mockImplementation((value: number) => value);

      instance.getVariableAPY(mockAddress).then(result => {
        expect(result).toEqual(31536000);
      });
    });

    test('it returns a pool backing token ticker', async () => {
      const ticker = await instance.getBackingTokenTicker(mockAddress);

      expect(ticker).toBe('dai');
    });

    test('it returns a pool yield bearing token ticker', async () => {
      mockYieldBearingToken.mockImplementation(() => Promise.resolve('yield-bearing-token-address'));
      mockSymbol.mockImplementation(() => Promise.resolve('aDAI'));

      const ticker = await instance.getYieldBearingTokenTicker(mockAddress);

      expect(ticker).toBe('aDAI');
    });

    test('it returns a a list of deposited events', async () => {
      mockQueryFilter.mockImplementation(() => {
        return Promise.resolve([
          {
            event: 'test-deposit-event',
          },
        ]);
      });

      const depositedEvents = await instance.getDepositedEvents(mockAddress);

      expect(depositedEvents.length).toBe(1);
      expect(depositedEvents[0].event).toBe('test-deposit-event');
    });

    test('it returns a a list of redeemed events', async () => {
      mockQueryFilter.mockImplementation(() => {
        return Promise.resolve([
          {
            event: 'test-redeem-event',
          },
        ]);
      });

      const depositedEvents = await instance.getRedeemedEvents(mockAddress);

      expect(depositedEvents.length).toBe(1);
      expect(depositedEvents[0].event).toBe('test-redeem-event');
    });
  });
});
