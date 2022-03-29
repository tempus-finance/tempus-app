import * as ejs from 'ethers';
import StatisticsABI from '../abi/Stats.json';
import { StatisticsService } from './StatisticsService';

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

describe('StatisticsService', () => {
  const mockAddress = 'statistics-contract-address';
  const mockProvider = new JsonRpcProvider();
  const mockGetConfig = jest.fn();

  let instance: StatisticsService;

  const mockTotalValueLockedAtGivenRate = jest.fn();
  const mockGetRate = jest.fn();
  const mockEstimatedDepositAndFix = jest.fn();
  const mockEstimatedDepositAndProvideLiquidity = jest.fn();
  const mockEstimateExitAndRedeem = jest.fn();

  const mockGetTempusAMMService = jest.fn();
  const mockGetMaxLeftoverShares = jest.fn();

  beforeEach(() => {
    jest.spyOn(ejs as any, 'Contract').mockImplementation(() => {
      return {
        totalValueLockedAtGivenRate: mockTotalValueLockedAtGivenRate,
        getRate: mockGetRate,
        estimatedDepositAndFix: mockEstimatedDepositAndFix,
        estimatedDepositAndProvideLiquidity: mockEstimatedDepositAndProvideLiquidity,
        estimateExitAndRedeem: mockEstimateExitAndRedeem,
      };
    });

    mockGetTempusAMMService.mockReturnValue({
      getMaxLeftoverShares: mockGetMaxLeftoverShares,
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
        tempusAMMService: mockGetTempusAMMService(),
        getConfig: mockGetConfig,
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
        tempusAMMService: mockGetTempusAMMService(),
        getConfig: mockGetConfig,
      });
    });

    test('it returns a Promise that resolves with the value of the total value locked in USD for provided TempusPool', async () => {
      mockTotalValueLockedAtGivenRate.mockImplementation(() =>
        Promise.resolve(ejs.BigNumber.from('0x36461af5a4ad877d37')),
      );

      const result = await instance.totalValueLockedUSD('ethereum', 'tempus-tool-address', 'DAI');

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
        tempusAMMService: mockGetTempusAMMService(),
        getConfig: mockGetConfig,
      });
    });

    test('it returns a Promise that resolves with the value current exchange rate', async () => {
      mockGetRate.mockImplementation(() => {
        return Promise.resolve([ejs.BigNumber.from('100'), ejs.BigNumber.from('2')]);
      });

      const result = await instance.getRate('ethereum', 'DAI');

      expect(ejs.utils.formatEther(result)).toBe('50.0');
    });
  });

  describe('estimatedDepositAndFix()', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      instance = new StatisticsService();

      instance.init({
        Contract: ejs.Contract,
        address: mockAddress,
        abi: StatisticsABI,
        signerOrProvider: mockProvider,
        tempusAMMService: mockGetTempusAMMService(),
        getConfig: mockGetConfig,
      });
    });

    test('it returns the amount of Principals tokens on fixed yield deposit', async () => {
      const value = ejs.BigNumber.from('57000000000000');
      mockEstimatedDepositAndFix.mockImplementation(() => {
        return Promise.resolve(value);
      });

      const tempusPool = 'abc';
      const tokenAmount = ejs.utils.parseEther('100');
      const isBackingToken = true;

      const result = await instance.estimatedDepositAndFix(tempusPool, tokenAmount, isBackingToken);

      expect(ejs.utils.formatEther(result)).toBe(ejs.utils.formatEther(value));
    });

    test('it returns the amount of Principals and LP tokens on variable yield deposit', async () => {
      const value = [
        ejs.BigNumber.from('23400000000000'),
        ejs.BigNumber.from('56700000000000'),
        ejs.BigNumber.from('99980000000000'),
      ];
      mockEstimatedDepositAndProvideLiquidity.mockImplementation(() => {
        return Promise.resolve(value);
      });

      const tempusPool = 'abc';
      const tokenAmount = ejs.utils.parseEther('2');
      const isBackingToken = true;

      const result = await instance.estimatedDepositAndProvideLiquidity(tempusPool, tokenAmount, isBackingToken);

      expect(ejs.utils.formatEther(result[0])).toBe(ejs.utils.formatEther(value[0]));
      expect(ejs.utils.formatEther(result[1])).toBe(ejs.utils.formatEther(value[1]));
      expect(ejs.utils.formatEther(result[2])).toBe(ejs.utils.formatEther(value[2]));
    });
  });

  describe('estimateExitAndRedeem()', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      instance = new StatisticsService();

      instance.init({
        Contract: ejs.Contract,
        address: mockAddress,
        abi: StatisticsABI,
        signerOrProvider: mockProvider,
        tempusAMMService: mockGetTempusAMMService(),
        getConfig: mockGetConfig,
      });
    });

    // TODO update this test
    test('it returns the amount of Backing or Yield Bearing tokens on withdraw', async () => {
      const value = ejs.BigNumber.from('45670000000000');

      mockEstimateExitAndRedeem.mockImplementation(() => {
        return Promise.resolve({ principalsRate: value });
      });
      mockGetMaxLeftoverShares.mockResolvedValue(ejs.utils.parseEther('0.00001'));

      const tempusPoolAddress = '123';
      const tempusAmmAddress = 'abc';
      const principalsAmount = ejs.utils.parseEther('100');
      const yieldsAmount = ejs.utils.parseEther('200');
      const lpTokensAmount = ejs.utils.parseEther('300');
      const isBackingToken = true;

      const result = await instance.estimateExitAndRedeem(
        tempusPoolAddress,
        tempusAmmAddress,
        lpTokensAmount,
        principalsAmount,
        yieldsAmount,
        isBackingToken,
      );

      expect(ejs.utils.formatEther(result.principalsRate)).toBe(ejs.utils.formatEther(value));
    });
  });
});
