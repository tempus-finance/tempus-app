import * as ejs from 'ethers';
import { BigNumber } from 'ethers';
import StatisticsABI from '../abi/Stats.json';
import { Decimal } from '../datastructures';
import { TempusPool } from '../interfaces';
import { StatisticsService } from './StatisticsService';
import { getERC20TokenService } from './getERC20TokenService';
import { of } from 'rxjs';

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

jest.mock('./getERC20TokenService', () => ({
  getERC20TokenService: jest.fn(),
}));

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

      instance.totalValueLockedUSD('ethereum', 'tempus-tool-address', 'DAI').subscribe(result => {
        expect(result.toString()).toBe('1001175799999999999287');
      });
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
      mockGetRate.mockImplementation((_, __, overrides) => {
        return Promise.resolve([
          ejs.BigNumber.from('100'),
          overrides ? ejs.BigNumber.from('4') : ejs.BigNumber.from('2'),
        ]);
      });
      const mockCallOverride = jest.fn();

      instance.getRate('ethereum', 'DAI').subscribe(result => {
        expect(result).toBe(new Decimal(50));
      });

      instance.getRate('ethereum', 'DAI', mockCallOverride()).subscribe(result => {
        expect(result).toBe(new Decimal(25));
      });
    });
  });

  describe('getUserPoolBalanceUSD()', () => {
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

    it('it retrieves the token balances and call estimateExitAndRedeem() to calculate the pool balance', () => {
      jest.spyOn(instance, 'getRate').mockReturnValue(of(new Decimal(1000)));
      mockEstimateExitAndRedeem.mockResolvedValue({
        tokenAmount: BigNumber.from(1234),
      });
      (getERC20TokenService as jest.Mock).mockImplementation(address => ({
        balanceOf: jest.fn().mockImplementation(() => {
          switch (address) {
            case '0x2':
              return Promise.resolve(BigNumber.from(100));
            case '0x3':
              return Promise.resolve(BigNumber.from(200));
            case '0x4':
              return Promise.resolve(BigNumber.from(300));
            default:
              return Promise.resolve(BigNumber.from(0));
          }
        }),
      }));
      const mockTempusPool = {
        address: '0x1',
        ammAddress: '0x2',
        backingToken: 'ETH',
        principalsAddress: '0x3',
        yieldsAddress: '0x4',
        tokenPrecision: { backingToken: 18, principals: 18, yields: 18, lpTokens: 18 },
      } as TempusPool;
      const userWalletAddress = '0x0';
      const isBackingToken = true;

      instance.getUserPoolBalanceUSD('ethereum', mockTempusPool, userWalletAddress).subscribe(result => {
        expect(result).toBe(new Decimal(1234));
        expect(mockEstimateExitAndRedeem).toHaveBeenCalledWith(
          mockTempusPool.address,
          mockTempusPool.ammAddress,
          BigNumber.from(100),
          BigNumber.from(200),
          BigNumber.from(300),
          isBackingToken,
        );
        expect(instance.getRate).toHaveBeenCalled();
      });
    });

    it('it accepts the token balances and call estimateExitAndRedeem() to calculate the pool balance', () => {
      jest.spyOn(instance, 'getRate').mockReturnValue(of(new Decimal(1000)));
      mockEstimateExitAndRedeem.mockResolvedValue({
        tokenAmount: BigNumber.from(1234),
      });
      const mockTempusPool = {
        address: '0x1',
        ammAddress: '0x2',
        backingToken: 'ETH',
        principalsAddress: '0x3',
        yieldsAddress: '0x4',
        tokenPrecision: {},
      } as TempusPool;
      const userWalletAddress = '0x0';
      const poolBalances = {
        principalsBalance: new Decimal(200),
        yieldsBalance: new Decimal(300),
        lpTokenBalance: new Decimal(100),
      };
      const isBackingToken = true;

      instance.getUserPoolBalanceUSD('ethereum', mockTempusPool, userWalletAddress, poolBalances).subscribe(result => {
        expect(result).toBe(new Decimal(1234));
        expect(mockEstimateExitAndRedeem).toHaveBeenCalledWith(
          mockTempusPool.address,
          mockTempusPool.ammAddress,
          BigNumber.from(100),
          BigNumber.from(200),
          BigNumber.from(300),
          isBackingToken,
        );
        expect(instance.getRate).toHaveBeenCalled();
      });
    });

    it('it return null when getRate() return null', () => {
      jest.spyOn(instance, 'getRate').mockReturnValue(of(null));
      mockEstimateExitAndRedeem.mockResolvedValue({
        tokenAmount: BigNumber.from(1234),
      });
      const mockTempusPool = {
        address: '0x1',
        ammAddress: '0x2',
        backingToken: 'ETH',
        principalsAddress: '0x3',
        yieldsAddress: '0x4',
        tokenPrecision: { backingToken: 18, principals: 18, yields: 18, lpTokens: 18 },
      } as TempusPool;
      const userWalletAddress = '0x0';
      const poolBalances = {
        principalsBalance: new Decimal(200),
        yieldsBalance: new Decimal(300),
        lpTokenBalance: new Decimal(100),
      };
      const isBackingToken = true;

      instance.getUserPoolBalanceUSD('ethereum', mockTempusPool, userWalletAddress, poolBalances).subscribe(result => {
        expect(result).toBeNull();
        expect(mockEstimateExitAndRedeem).toHaveBeenCalledWith(
          mockTempusPool.address,
          mockTempusPool.ammAddress,
          BigNumber.from(100),
          BigNumber.from(200),
          BigNumber.from(300),
          isBackingToken,
        );
        expect(instance.getRate).toHaveBeenCalled();
      });
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
      const value = new Decimal('57000000000000');
      mockEstimatedDepositAndFix.mockImplementation(() => of(value));

      const tempusPool = {
        address: 'abc',
        tokenPrecision: {
          backingToken: 18,
          yieldBearingToken: 18,
          principals: 18,
        },
      };
      const tokenAmount = new Decimal('100');
      const isBackingToken = true;

      const result = instance.estimatedDepositAndFix(tempusPool as TempusPool, tokenAmount, isBackingToken);

      result.subscribe(resultValue => expect(resultValue).toBe(value));
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
