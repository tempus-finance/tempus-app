import * as ejs from 'ethers';
import StatisticsABI from '../abi/Stats.json';
import StatisticsService from './StatisticsService';

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

describe('StatisticsService', () => {
  const mockAddress = 'statistics-contract-address';
  const mockProvider = new JsonRpcProvider();

  let instance: StatisticsService;

  const mockTotalValueLockedAtGivenRate = jest.fn();
  const mockGetRate = jest.fn();

  beforeEach(() => {
    jest.spyOn(ejs, 'Contract').mockImplementation(() => {
      return {
        totalValueLockedAtGivenRate: mockTotalValueLockedAtGivenRate,
        getRate: mockGetRate,
      };
    });
  });

  describe('constructor()', () => {
    test('it returns a valid instance', () => {
      instance = new StatisticsService();

      expect(instance).not.toBe(undefined);
    });
  });

  describe('init()', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      instance = new StatisticsService();
    });

    test('it initialize the instance', () => {
      instance.init({
        Contract: ejs.Contract,
        address: mockAddress,
        abi: StatisticsABI,
        signerOrProvider: mockProvider,
      });

      expect(instance).toBeInstanceOf(StatisticsService);
    });
  });

  describe('totalValueLockedUSD()', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      instance = new StatisticsService();

      instance.init({
        Contract: ejs.Contract,
        address: mockAddress,
        abi: StatisticsABI,
        signerOrProvider: mockProvider,
      });
    });

    test('it returns a Promise that resolves with the value of the total value locked in USD for provided TempusPool', async () => {
      mockTotalValueLockedAtGivenRate.mockImplementation(() =>
        Promise.resolve(ejs.BigNumber.from('0x36461af5a4ad877d37')),
      );

      const result = await instance.totalValueLockedUSD('tempus-tool-address', 'dai');

      expect(result.toString()).toBe('1001175799999999999287');
    });
  });

  describe('getRate()', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      instance = new StatisticsService();

      instance.init({
        Contract: ejs.Contract,
        address: mockAddress,
        abi: StatisticsABI,
        signerOrProvider: mockProvider,
      });
    });

    test('it returns a Promise that resolves with the value current exchange rate', async () => {
      mockGetRate.mockImplementation((ens, overrides) => {
        return Promise.resolve([ejs.BigNumber.from('100'), ejs.BigNumber.from('2')]);
      });

      const result = await instance.getRate('dai');

      expect(ejs.utils.formatEther(result)).toBe('50.0');
    });
  });
});
