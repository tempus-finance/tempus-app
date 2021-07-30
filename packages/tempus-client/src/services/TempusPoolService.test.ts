// Services
import TempusPoolService from './TempusPoolService';
import PriceOracleService from './PriceOracleService';

jest.mock('ethers');
const { Contract } = jest.requireMock('ethers');
const { utils } = jest.requireMock('ethers');
const { BigNumber } = jest.requireActual('ethers');

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

describe('TempusPoolService', () => {
  const mockAddresses = ['someAddress'];
  const [mockAddress] = mockAddresses;

  const mockABI = {};
  const mockCurrentExchangeRate = jest.fn();
  const mockMaturityTime = jest.fn();
  const mockPriceOracle = jest.fn();
  const mockGetBlock = jest.fn();
  const mockYieldBearingToken = jest.fn();
  const mockGetPriceOracleForPool = jest.fn();
  const mockCurrentRate = jest.fn();

  const mockProvider = new JsonRpcProvider();

  let instance: TempusPoolService;

  beforeEach(() => {
    Contract.mockImplementation(() => {
      return {
        currentExchangeRate: mockCurrentExchangeRate,
        maturityTime: mockMaturityTime,
        priceOracle: mockPriceOracle,
        yieldBearingToken: mockYieldBearingToken,
        provider: {
          getBlock: mockGetBlock,
        },
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

      instance = new TempusPoolService();

      instance.init({
        Contract,
        tempusPoolAddresses: mockAddresses,
        TempusPoolABI: mockABI,
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

    test('it returns a PriceOracleService instance for the pool', () => {
      mockPriceOracle.mockImplementation(() => Promise.resolve('price-oracle-address'));

      instance.getPriceOracleForPool(mockAddress).then(result => {
        expect(result).toBeInstanceOf(PriceOracleService);
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

      instance.getPriceOracleForPool = mockGetPriceOracleForPool;
      mockGetPriceOracleForPool.mockImplementation(() => {
        return Promise.resolve({
          currentRate: mockCurrentRate,
        });
      });
      mockCurrentRate.mockImplementation((address: string, overrides: {}) => {
        if (!overrides) {
          return Promise.resolve(BigNumber.from('10'));
        } else {
          return Promise.resolve(BigNumber.from('9'));
        }
      });
      utils.formatEther.mockImplementation((value: number) => value);

      instance.getVariableAPY(mockAddress).then(result => {
        expect(result).toEqual(31536000);
      });
    });
  });
});
