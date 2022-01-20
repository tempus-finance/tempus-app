import { BigNumber, ethers } from 'ethers';
import PoolDataAdapter from './PoolDataAdapter';

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

const mockGetFeesConfig = jest.fn();
const mockGetSwapFeePercentage = jest.fn();

describe('PoolDataAdapter', () => {
  let instance: PoolDataAdapter;

  const mockProvider = new JsonRpcProvider();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockGetTempusControllerService = jest.fn();
    const mockGetERC20TokenService = jest.fn().mockImplementation((address: string) => {
      switch (address) {
        case 'backing-token-address': {
          return {
            balanceOf: jest.fn().mockResolvedValue(ethers.utils.parseEther('10')),
            getAllowance: jest.fn().mockResolvedValue(ethers.utils.parseEther('12300000')),
          };
        }

        case 'yield-bearing-token-address': {
          return {
            balanceOf: jest.fn().mockResolvedValue(ethers.utils.parseEther('20')),
            getAllowance: jest.fn().mockResolvedValue(ethers.utils.parseEther('23400000')),
          };
        }

        case 'principals-token-address': {
          return {
            balanceOf: jest.fn().mockResolvedValue(ethers.utils.parseEther('31')),
          };
        }

        case 'yields-token-address': {
          return {
            balanceOf: jest.fn().mockResolvedValue(ethers.utils.parseEther('12')),
          };
        }

        // LP tokens
        default: {
          return {
            balanceOf: jest.fn().mockResolvedValue(ethers.utils.parseEther('7')),
          };
        }
      }
    });
    const mockGetStatisticsService = jest.fn().mockImplementation(() => {
      return {
        getRate: jest.fn().mockResolvedValue(ethers.utils.parseEther('0.5')),
        estimatedDepositAndFix: jest.fn().mockResolvedValue(ethers.utils.parseEther('123')),
        estimatedMintedShares: jest.fn().mockResolvedValue(BigNumber.from('100')),
      };
    });

    const mockGetTempusPoolService = jest.fn().mockImplementation(() => {
      return {
        getBackingTokenAddress: jest.fn().mockResolvedValue('backing-token-address'),
        getBackingTokenTicker: jest.fn().mockResolvedValue('backing-token-ticker'),
        getYieldBearingTokenAddress: jest.fn().mockResolvedValue('yield-bearing-token-address'),
        getPrincipalsTokenAddress: jest.fn().mockResolvedValue('principals-token-address'),
        getYieldTokenAddress: jest.fn().mockResolvedValue('yields-token-address'),
        numAssetsPerYieldToken: jest.fn().mockResolvedValue(ethers.utils.parseEther('1')),
        getStartTime: jest.fn().mockResolvedValue(new Date('2022-03-01')),
        getMaturityTime: jest.fn().mockResolvedValue(new Date('2022-04-01')),
        currentInterestRate: jest.fn().mockResolvedValue(ethers.utils.parseEther('1')),
        getFeesConfig: mockGetFeesConfig,
      };
    });

    const mockTempusAMMService = jest.fn().mockImplementation(() => {
      return {
        getExpectedTokensOutGivenBPTIn: jest
          .fn()
          .mockResolvedValue([ethers.utils.parseEther('202'), ethers.utils.parseEther('303')]),
        getSwapFeePercentage: mockGetSwapFeePercentage,
      };
    });

    const mockGetVaultService = jest.fn().mockReturnValue({
      getPoolTokens: () => Promise.resolve({ balances: [BigNumber.from('1'), BigNumber.from('2')] }),
    });

    instance = new PoolDataAdapter();
    instance.init({
      eRC20TokenServiceGetter: mockGetERC20TokenService,
      statisticService: mockGetStatisticsService(),
      tempusControllerAddress: 'mock-tempus-controller-address',
      tempusControllerService: mockGetTempusControllerService(),
      tempusAMMService: mockTempusAMMService(),
      tempusPoolService: mockGetTempusPoolService(),
      vaultService: mockGetVaultService(),
    });
  });

  describe('getPoolDataAdapter()', () => {
    test('returns a not null PoolDataAdapter instance', () => {
      expect(instance).toBeInstanceOf(PoolDataAdapter);
      expect(instance).not.toBe(null);
    });
  });

  describe('retrieveBalances()', () => {
    test('returns an object containing balances ', () => {
      const tempusPoolAddress = 'abc';
      const userWalletAddress = 'xyz';
      const tempusAmmAddress = '123';
      const signer = mockProvider;

      instance.retrieveBalances(tempusPoolAddress, tempusAmmAddress, userWalletAddress, signer).subscribe(balances => {
        expect(balances).toBeDefined();
        if (balances) {
          expect(ethers.utils.formatEther(balances.backingTokenBalance)).toBe('10.0');
          expect(ethers.utils.formatEther(balances.backingTokenRate)).toBe('0.5');
          expect(ethers.utils.formatEther(balances.yieldBearingTokenBalance)).toBe('20.0');
          expect(ethers.utils.formatEther(balances.yieldBearingTokenRate)).toBe('0.5');
          expect(ethers.utils.formatEther(balances.principalsTokenBalance)).toBe('31.0');
          expect(ethers.utils.formatEther(balances.yieldsTokenBalance)).toBe('12.0');
          expect(ethers.utils.formatEther(balances.lpTokensBalance)).toBe('7.0');
        }
      });
    });
  });

  describe('getEstimatedFixedApr()', () => {
    test('returns an estimated fixed apr value', async () => {
      const tokenAmount = ethers.BigNumber.from('1');
      const isBackingToken = true;
      const tempusPoolAddress = 'abc';
      const tempusPoolId = '123';
      const tempusAMMAddress = 'xyz';

      const apr = await instance.getEstimatedFixedApr(
        tokenAmount,
        isBackingToken,
        tempusPoolAddress,
        tempusPoolId,
        tempusAMMAddress,
      );

      expect(apr).toBeDefined();
      if (apr) {
        expect(ethers.utils.formatEther(apr)).toBe('14482258064516128068.225806451612904');
      }
    });
  });

  describe('getPoolFees()', () => {
    test('returns pool fees', async () => {
      const fees = [
        ethers.BigNumber.from('2'),
        ethers.BigNumber.from('23'),
        ethers.BigNumber.from('150'),
        ethers.BigNumber.from('1'),
      ];
      const tempusPoolAddress = 'abc';
      const tempusAMMAddress = 'xyz';

      mockGetFeesConfig.mockResolvedValue([
        ethers.BigNumber.from('2'),
        ethers.BigNumber.from('23'),
        ethers.BigNumber.from('150'),
      ]);

      mockGetSwapFeePercentage.mockResolvedValue(ethers.BigNumber.from('1'));

      const result = await instance.getPoolFees(tempusPoolAddress, tempusAMMAddress);

      expect(result).toStrictEqual(fees);
    });
  });
});
