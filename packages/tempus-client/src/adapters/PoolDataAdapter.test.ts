import { ethers } from 'ethers';
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
      return { getRate: jest.fn().mockResolvedValue(ethers.utils.parseEther('0.5')) };
    });

    const mockGetTempusPoolService = jest.fn().mockImplementation(() => {
      return {
        getBackingTokenAddress: jest.fn().mockResolvedValue('backing-token-address'),
        getBackingTokenTicker: jest.fn().mockResolvedValue('backing-token-ticker'),
        getYieldBearingTokenAddress: jest.fn().mockResolvedValue('yield-bearing-token-address'),
        getPrincipalsTokenAddress: jest.fn().mockResolvedValue('principals-token-address'),
        getYieldTokenAddress: jest.fn().mockResolvedValue('yields-token-address'),
        numAssetsPerYieldToken: jest.fn().mockResolvedValue(ethers.utils.parseEther('1')),
      };
    });

    const mockTempusAMMService = jest.fn().mockImplementation(() => {
      return {
        getExpectedTokensOutGivenBPTIn: jest
          .fn()
          .mockResolvedValue([ethers.utils.parseEther('202'), ethers.utils.parseEther('303')]),
      };
    });

    instance = new PoolDataAdapter();
    instance.init({
      eRC20TokenServiceGetter: mockGetERC20TokenService,
      statisticService: mockGetStatisticsService(),
      tempusControllerAddress: 'mock-tempus-controller-address',
      tempusControllerService: mockGetTempusControllerService(),
      tempusAMMService: mockTempusAMMService(),
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
      const tempusAmmAddress = '123';
      const signer = mockProvider;

      const balances = await instance.retrieveBalances(tempusPoolAddress, tempusAmmAddress, userWalletAddress, signer);

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

  describe('getApprovedAllowance()', () => {
    test('returns a backing token allowance', async () => {
      const tempusPoolAddress = 'abc';
      const userWalletAddress = 'xyz';
      const signer = mockProvider;
      const isBackingToken = true;

      const allowance = await instance.getApprovedAllowance(
        userWalletAddress,
        tempusPoolAddress,
        isBackingToken,
        signer,
      );

      expect(allowance).toBeDefined();
      if (allowance) {
        expect(allowance).toBe(12300000);
      }
    });

    test('returns a yield bearing token token allowance', async () => {
      const tempusPoolAddress = 'abc';
      const userWalletAddress = 'xyz';
      const signer = mockProvider;
      const isBackingToken = false;

      const allowance = await instance.getApprovedAllowance(
        userWalletAddress,
        tempusPoolAddress,
        isBackingToken,
        signer,
      );

      expect(allowance).toBeDefined();
      if (allowance) {
        expect(allowance).toBe(23400000);
      }
    });
  });
});
