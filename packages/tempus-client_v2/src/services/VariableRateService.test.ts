import { BigNumber, Contract, utils, providers, ethers } from 'ethers';
import { CONSTANTS, getProviderFromSignerOrProvider } from 'tempus-core-services';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ChainConfig } from '../interfaces/Config';
import * as getConfig from '../utils/getConfig';
import * as weiMath from '../utils/weiMath';
import AaveLendingPoolABI from '../abi/AaveLendingPool.json';
import lidoOracleABI from '../abi/LidoOracle.json';
import VariableRateService from './VariableRateService';
import TempusPoolService from './TempusPoolService';
import VaultService, { PoolBalanceChangedEvent, SwapEvent } from './VaultService';
import TempusAMMService from './TempusAMMService';
import { ProtocolName } from '../interfaces/ProtocolName';
import { wadToDai } from '../utils/rayToDai';
import cERC20Token from '../abi/cERC20Token.json';
import { Vaults } from 'rari-sdk';

const {
  aaveLendingPoolAddress,
  COMPOUND_BLOCKS_PER_DAY,
  DAYS_IN_A_YEAR,
  ONE_ETH_IN_WEI,
  SECONDS_IN_A_DAY,
  SECONDS_IN_YEAR,
} = CONSTANTS;

jest.mock('@ethersproject/providers', () => ({
  ...jest.requireActual('@ethersproject/providers'),
  JsonRpcProvider: jest.fn(),
}));
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  Contract: jest.fn(),
}));
jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getProviderFromSignerOrProvider: jest.fn(),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  } as Response),
);

describe('VariableRateService', () => {
  let variableRateService: VariableRateService;
  const mockProvider = new JsonRpcProvider();
  const DUMMY_TEMPUS_POOL = [
    {
      address: '0x0000000000000000000000000000000000000000',
      poolId: 'DUMMY_POOL_ID_1',
      ammAddress: '0x0000000000000000000000000000000000000001',
      principalsAddress: '0x0000000000000000000000000000000000000002',
      yieldsAddress: '0x0000000000000000000000000000000000000003',
      yieldBearingTokenAddress: '0x0000000000000000000000000000000000000004',
      backingTokenAddress: '0x0000000000000000000000000000000000000005',
      startDate: new Date(2022, 0, 1).getTime(),
      maturityDate: new Date(2022, 6, 1).getTime(),
      protocol: 'lido',
      backingToken: 'ETH',
      yieldBearingToken: 'stETH',
      spotPrice: '2',
      decimalsForUI: 4,
      tokenPrecision: {
        backingToken: 18,
        lpTokens: 18,
        principals: 18,
        yieldBearingToken: 18,
        yields: 18,
      },
    },
  ];
  let mockTempusPoolService: jest.Mock<TempusPoolService, []>;
  let mockVaultService: jest.Mock<VaultService, []>;
  let mockTempusAMMService: jest.Mock<TempusAMMService, []>;
  let mockVaults: jest.Mock<Vaults, []>;
  let mockConfig: jest.Mock<ChainConfig, []>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockTempusPoolService = jest.fn().mockReturnValue({});
    mockVaultService = jest.fn().mockReturnValue({});
    mockTempusAMMService = jest.fn().mockReturnValue({});
    mockVaults = jest.fn().mockReturnValue({
      pools: {
        stable: {
          apy: {
            getCurrentApy: jest.fn().mockReturnValue(0),
          },
        },
      },
    });
    mockConfig = jest.fn().mockReturnValue({ chainId: 250, lidoOracle: '0x0000000000000000000000000000000000000000' });

    variableRateService = new VariableRateService();
    variableRateService.init(
      mockProvider,
      mockTempusPoolService(),
      mockVaultService(),
      mockTempusAMMService(),
      mockVaults(),
      mockConfig(),
    );
  });
  afterEach(jest.restoreAllMocks);

  const averageBlockTime = 13.15;

  describe('getAprFromApy()', () => {
    test('test with no periods given, should return APY', () => {
      const apy = Math.random() * 5;

      expect(VariableRateService.getAprFromApy(apy)).toEqual(apy);
    });

    test('test with periods == 1, should return APY', () => {
      const apy = Math.random() * 5;

      expect(VariableRateService.getAprFromApy(apy, 1)).toEqual(apy);
    });

    test('test with non-zero periods, should calculate APR depends on APY and non-zero periods', () => {
      const apy = Math.random() * 5;
      const periods = Math.random() + 0.001;
      const apr = (Math.pow(apy / 100 + 1, 1 / periods) - 1) * periods * 100;

      expect(VariableRateService.getAprFromApy(apy, periods)).toEqual(apr);
    });

    test('test with zero periods, should return NaN', () => {
      const apy = Math.random() * 5;

      expect(VariableRateService.getAprFromApy(apy, 0)).toEqual(NaN);
    });
  });

  describe('init()', () => {
    test('test with no signerOrProvider given, should do nth', () => {
      variableRateService = new VariableRateService();
      variableRateService.init(
        null as any,
        mockTempusPoolService(),
        mockVaultService(),
        mockTempusAMMService(),
        mockVaults(),
        mockConfig(),
      );
      expect((variableRateService as any).aaveLendingPool).toBeNull();
      expect((variableRateService as any).lidoOracle).toBeNull();
      expect((variableRateService as any).signerOrProvider).toBeNull();
      expect((variableRateService as any).tempusPoolService).toBeNull();
      expect((variableRateService as any).vaultService).toBeNull();
      expect((variableRateService as any).tempusAMMService).toBeNull();
    });

    test('should create Contractor instance twice', () => {
      expect(Contract).toHaveBeenNthCalledWith(1, mockConfig().lidoOracle, lidoOracleABI.abi, mockProvider);
      expect(Contract).toHaveBeenNthCalledWith(2, aaveLendingPoolAddress, AaveLendingPoolABI, mockProvider);
    });
  });

  describe('getAprRate()', () => {
    test('test with no init() invoked, should reject with an error', async () => {
      const protocol = 'aave';
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      const feesPrecision = 18;
      const fees = BigNumber.from(1);
      variableRateService = new VariableRateService();

      await expect(
        variableRateService.getAprRate(protocol, yieldBearingTokenAddress, fees, feesPrecision),
      ).rejects.toEqual(undefined);
    });

    test('test with aave, should return with an APR', async () => {
      const protocol = 'aave';
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      const feesPrecision = 18;
      const fees = BigNumber.from(1);
      const feesFormatted = Number(utils.formatEther(fees));
      const mockAPR = Math.random() * 5;
      jest.spyOn(variableRateService as any, 'getAaveAPR').mockResolvedValue(mockAPR);

      await expect(
        variableRateService.getAprRate(protocol, yieldBearingTokenAddress, fees, feesPrecision),
      ).resolves.toEqual(mockAPR);
      expect(variableRateService['getAaveAPR']).toHaveBeenCalledWith(yieldBearingTokenAddress, feesFormatted);
    });

    test('test with compound, should return with an APR', async () => {
      const protocol = 'compound';
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      const feesPrecision = 18;
      const fees = BigNumber.from(1);
      const feesFormatted = Number(utils.formatEther(fees));
      const mockAPR = Math.random() * 5;
      jest.spyOn(variableRateService as any, 'getCompoundAPR').mockResolvedValue(mockAPR);

      await expect(
        variableRateService.getAprRate(protocol, yieldBearingTokenAddress, fees, feesPrecision),
      ).resolves.toEqual(mockAPR);
      expect(variableRateService['getCompoundAPR']).toHaveBeenCalledWith(yieldBearingTokenAddress, feesFormatted);
    });

    test('test with lido, should return with an APR', async () => {
      const protocol = 'lido';
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      const feesPrecision = 18;
      const fees = BigNumber.from(1);
      const feesFormatted = Number(utils.formatEther(fees));
      const mockAPR = Math.random() * 5;
      jest.spyOn(variableRateService as any, 'getLidoAPR').mockResolvedValue(mockAPR);

      await expect(
        variableRateService.getAprRate(protocol, yieldBearingTokenAddress, fees, feesPrecision),
      ).resolves.toEqual(mockAPR);
      expect(variableRateService['getLidoAPR']).toHaveBeenCalledWith(feesFormatted);
    });

    test('test with rari, should return with an APR', async () => {
      const protocol = 'rari';
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      const feesPrecision = 18;
      const fees = BigNumber.from(1);
      const feesFormatted = Number(utils.formatEther(fees));
      const mockAPR = Math.random() * 5;
      jest.spyOn(variableRateService as any, 'getRariAPR').mockResolvedValue(mockAPR);

      await expect(
        variableRateService.getAprRate(protocol, yieldBearingTokenAddress, fees, feesPrecision),
      ).resolves.toEqual(mockAPR);
      expect(variableRateService['getRariAPR']).toHaveBeenCalledWith(feesFormatted);
    });

    test('test with protocol other than aave/compound/lido, should return with 0', async () => {
      const protocol = 'abcd';
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      const feesPrecision = 18;
      const fees = BigNumber.from(1);

      await expect(
        variableRateService.getAprRate(protocol as ProtocolName, yieldBearingTokenAddress, fees, feesPrecision),
      ).resolves.toEqual(0);
    });
  });

  describe('getAaveAPR()', () => {
    test('should called getAaveAPY() and getAprFromApy(), and return APR + fee', async () => {
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      const fees = Math.random() * 0.05;
      const mockAPY = Math.random() * 5;
      jest.spyOn(variableRateService as any, 'getAaveAPY').mockResolvedValue(mockAPY);
      jest.spyOn(VariableRateService, 'getAprFromApy');

      await expect((variableRateService as any).getAaveAPR(yieldBearingTokenAddress, fees)).resolves.toEqual(
        mockAPY + fees,
      );
      expect(variableRateService['getAaveAPY']).toHaveBeenCalledWith(yieldBearingTokenAddress);
      expect(VariableRateService.getAprFromApy).toHaveBeenCalledWith(mockAPY);
    });
  });

  describe('getCompoundAPR()', () => {
    test('test with no init() invoked, should reject with an error', async () => {
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      const fees = Math.random() * 0.05;
      variableRateService = new VariableRateService();

      await expect((variableRateService as any).getCompoundAPR(yieldBearingTokenAddress, fees)).rejects.toEqual(
        undefined,
      );
    });

    test('should called getAaveAPY() and getAprFromApy(), and return APR + fee', async () => {
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      const fees = Math.random() * 0.05;
      const mockAPY = Math.random() * 5;
      jest.spyOn(variableRateService as any, 'getCompoundAPY').mockResolvedValue(mockAPY);
      jest.spyOn(VariableRateService, 'getAprFromApy');

      await expect((variableRateService as any).getCompoundAPR(yieldBearingTokenAddress, fees)).resolves.toEqual(
        mockAPY + fees,
      );
      expect(variableRateService['getCompoundAPY']).toHaveBeenCalledWith(yieldBearingTokenAddress);
      expect(VariableRateService.getAprFromApy).toHaveBeenCalledWith(mockAPY);
    });
  });

  describe('getLidoAPR()', () => {
    test('test with no init() invoked (i.e. this.lidoOracle is undefined), should log an error and return 0', async () => {
      const fees = Math.random() * 0.05;
      variableRateService = new VariableRateService();

      await expect((variableRateService as any).getLidoAPR(fees)).resolves.toEqual(0);
      expect(console.error).toHaveBeenCalled();
      expect((console.error as jest.Mock<void, any>).mock.calls[0][0]).toEqual('VariableRateService - getLidoAPR');
      expect((console.error as jest.Mock<void, any>).mock.calls[0][1]).toBeInstanceOf(Error);
    });

    test('test throwing error in this.lidoOracle.getLastCompletedReportDelta(), should log an error and return 0', async () => {
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      const fees = Math.random() * 0.05;
      Reflect.set(variableRateService, 'lidoOracle', {
        getLastCompletedReportDelta: jest.fn().mockImplementation(() => {
          throw new Error(errMessage);
        }),
      });

      await expect((variableRateService as any).getLidoAPR(fees)).resolves.toEqual(0);
      expect(console.error).toHaveBeenCalled();
      expect((console.error as jest.Mock<void, any>).mock.calls[0][0]).toEqual('VariableRateService - getLidoAPR');
      expect((console.error as jest.Mock<void, any>).mock.calls[0][1]).toEqual(new Error(errMessage));
    });

    test('test throwing error in this.calculateLidoAPR, should log an error and return 0', async () => {
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      const fees = Math.random() * 0.05;
      const mockPostTotalPooledEther = { aaa: Math.random().toString(36).substring(2) };
      const mockPreTotalPooledEther = { bbb: Math.random().toString(36).substring(2) };
      const mockTimeElapsed = { ccc: Math.random().toString(36).substring(2) };
      Reflect.set(variableRateService, 'lidoOracle', {
        getLastCompletedReportDelta: jest.fn().mockResolvedValue({
          postTotalPooledEther: mockPostTotalPooledEther,
          preTotalPooledEther: mockPreTotalPooledEther,
          timeElapsed: mockTimeElapsed,
        }),
      });
      jest.spyOn(variableRateService as any, 'calculateLidoAPR').mockImplementation(() => {
        throw new Error(errMessage);
      });

      await expect((variableRateService as any).getLidoAPR(fees)).resolves.toEqual(0);
      expect(console.error).toHaveBeenCalled();
      expect((console.error as jest.Mock<void, any>).mock.calls[0][0]).toEqual('VariableRateService - getLidoAPR');
      expect((console.error as jest.Mock<void, any>).mock.calls[0][1]).toEqual(new Error(errMessage));
    });

    test('should called getAaveAPY() and getAprFromApy(), and return APR + fee', async () => {
      const fees = Math.random() * 0.05;
      const mockPostTotalPooledEther = { aaa: Math.random().toString(36).substring(2) };
      const mockPreTotalPooledEther = { bbb: Math.random().toString(36).substring(2) };
      const mockTimeElapsed = { ccc: Math.random().toString(36).substring(2) };
      const mockAPR = BigNumber.from(Math.round(Math.random() * 5));
      Reflect.set(variableRateService, 'lidoOracle', {
        getLastCompletedReportDelta: jest.fn().mockResolvedValue({
          postTotalPooledEther: mockPostTotalPooledEther,
          preTotalPooledEther: mockPreTotalPooledEther,
          timeElapsed: mockTimeElapsed,
        }),
      });
      jest.spyOn(variableRateService as any, 'calculateLidoAPR').mockReturnValue(mockAPR);
      const expected =
        Number(utils.formatEther(mockAPR.mul(BigNumber.from('9000')).div(BigNumber.from('10000')))) + fees;

      await expect((variableRateService as any).getLidoAPR(fees)).resolves.toEqual(expected);
    });
  });

  describe('getRariAPR()', () => {
    test('test with no init() invoked, should reject with an error', async () => {
      const fees = Math.random() * 0.05;
      variableRateService = new VariableRateService();

      await expect((variableRateService as any).getRariAPR(fees)).rejects.toEqual(undefined);
    });

    test('should called getAaveAPY() and getAprFromApy(), and return APR + fee', async () => {
      const fees = Math.random() * 0.05;
      const mockAPY = Math.round(Math.random() * 5);
      jest
        .spyOn((variableRateService as any).rariVault.pools.stable.apy, 'getCurrentApy')
        .mockResolvedValue(utils.parseEther(`${mockAPY}`));
      jest.spyOn(VariableRateService, 'getAprFromApy');

      await expect((variableRateService as any).getRariAPR(fees)).resolves.toEqual(mockAPY + fees);
      expect((variableRateService as any).rariVault.pools.stable.apy.getCurrentApy).toHaveBeenCalled();
      expect(VariableRateService.getAprFromApy).toHaveBeenCalledWith(mockAPY);
    });
  });

  describe('calculateLidoAPR()', () => {
    test('test with zero preTotalPooledEther, should log an error and return 0', () => {
      const postTotalPooledEther = BigNumber.from(Math.round(Math.random() * 1000) + 1);
      const timeElapsed = BigNumber.from(Math.round(Math.random() * 1000) + 1);

      expect(
        (variableRateService as any).calculateLidoAPR(postTotalPooledEther, BigNumber.from(0), timeElapsed),
      ).toEqual(BigNumber.from(0));
      expect(console.error).toHaveBeenCalled();
      expect((console.error as jest.Mock<void, any>).mock.calls[0][0]).toEqual(
        'VariableRateService - calculateLidoAPR',
      );
      expect((console.error as jest.Mock<void, any>).mock.calls[0][1]).toBeInstanceOf(Error);
    });

    test('test with zero timeElapsed, should return log an error and 0', () => {
      const preTotalPooledEther = BigNumber.from(Math.round(Math.random() * 1000) + 1);
      const postTotalPooledEther = preTotalPooledEther.add(Math.round(Math.random() * 1000) + 1);

      expect(
        (variableRateService as any).calculateLidoAPR(postTotalPooledEther, preTotalPooledEther, BigNumber.from(0)),
      ).toEqual(BigNumber.from(0));
      expect(console.error).toHaveBeenCalled();
      expect((console.error as jest.Mock<void, any>).mock.calls[0][0]).toEqual(
        'VariableRateService - calculateLidoAPR',
      );
      expect((console.error as jest.Mock<void, any>).mock.calls[0][1]).toBeInstanceOf(Error);
    });

    test(
      'should return ' +
        '((postTotalPooledEther - preTotalPooledEther) * SECONDS_IN_YEAR * ONE_ETH_IN_WEI ' +
        '/ (preTotalPooledEther * timeElapsed))',
      () => {
        const preTotalPooledEther = BigNumber.from(Math.round(Math.random() * 1000) + 1);
        const postTotalPooledEther = preTotalPooledEther.add(Math.round(Math.random() * 1000) + 1);
        const timeElapsed = BigNumber.from(Math.round(Math.random() * 1000) + 1);
        const expected = postTotalPooledEther
          .sub(preTotalPooledEther)
          .mul(BigNumber.from(SECONDS_IN_YEAR))
          .mul(BigNumber.from(ONE_ETH_IN_WEI))
          .div(preTotalPooledEther.mul(timeElapsed));

        expect(
          (variableRateService as any).calculateLidoAPR(postTotalPooledEther, preTotalPooledEther, timeElapsed),
        ).toEqual(expected);
      },
    );
  });

  describe('calculateFees()', () => {
    test('test with no init() invoked, should reject with an error', async () => {
      const tempusPool = '0x0000000000000000000000000000000000000000';
      const tempusAMM = '0x0000000000000000000000000000000000000001';
      const principalsAddress = '0x0000000000000000000000000000000000000002';
      const yieldsAddress = '0x0000000000000000000000000000000000000003';
      variableRateService = new VariableRateService();

      await expect(
        (variableRateService as any).calculateFees(
          tempusAMM,
          tempusPool,
          principalsAddress,
          yieldsAddress,
          'ethereum',
          averageBlockTime,
        ),
      ).rejects.toEqual(undefined);
    });

    test('test with tempus pool found in getConfig(), should reject with an error', async () => {
      const tempusPool = '0x0000000000000000000000000000000000000000';
      const tempusAMM = '0x0000000000000000000000000000000000000001';
      const principalsAddress = '0x0000000000000000000000000000000000000002';
      const yieldsAddress = '0x0000000000000000000000000000000000000003';
      jest.spyOn(getConfig, 'getChainConfig').mockReturnValue({ tempusPools: [] } as unknown as ChainConfig);

      await expect(
        (variableRateService as any).calculateFees(
          tempusAMM,
          tempusPool,
          principalsAddress,
          yieldsAddress,
          'ethereum',
          averageBlockTime,
        ),
      ).rejects.toEqual(undefined);
    });

    test('test with swap event with tokenIn == principalsAddress, should return calculated fees', async () => {
      const HOURS_IN_A_YEAR = DAYS_IN_A_YEAR * 24;

      const tempusPool = '0x0000000000000000000000000000000000000000';
      const tempusAMM = '0x0000000000000000000000000000000000000001';
      const principalsAddress = '0x0000000000000000000000000000000000000002';
      const yieldsAddress = '0x0000000000000000000000000000000000000003';
      const principalsPrecision = 18;
      const mockSwapFeePercentage = BigNumber.from(Math.round(Math.random() * 5));
      const mockLatestBlock = { timestamp: Date.now() / 1000, number: 1000 } as providers.Block;
      const mockEarlierBlock = { timestamp: Date.now() / 1000 - 60 * 60, number: 997 } as providers.Block;
      const totalFees = ethers.utils.parseEther('2');
      const mockEvents = [
        {
          blockNumber: 999,
          args: {
            liquidityProvider: '0x0000000000000000000000000000000000000003',
            tokens: [principalsAddress],
            deltas: [BigNumber.from(2)],
          },
        },
        {
          blockNumber: 998,
          args: { tokenIn: principalsAddress, tokenOut: yieldsAddress, amountIn: BigNumber.from(100) },
        },
      ] as (SwapEvent | PoolBalanceChangedEvent)[];
      const mockPoolTokens = {
        principals: BigNumber.from(Math.round(Math.random() * 1000)),
        yields: BigNumber.from(Math.round(Math.random() * 100)),
      };
      (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
        getBlock: jest
          .fn()
          .mockImplementation(async (blockHashOrBlockTag: providers.BlockTag): Promise<providers.Block> => {
            return Promise.resolve(blockHashOrBlockTag === 'latest' ? mockLatestBlock : mockEarlierBlock);
          }),
      }));
      (getProviderFromSignerOrProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);

      const mockProvider = new JsonRpcProvider();
      jest.spyOn(getConfig, 'getChainConfig').mockReturnValue({ tempusPools: DUMMY_TEMPUS_POOL } as ChainConfig);
      jest.spyOn(variableRateService as any, 'getSwapAndPoolBalanceChangedEvents').mockResolvedValue(mockEvents);
      jest.spyOn(variableRateService as any, 'getPoolTokens').mockResolvedValue(mockPoolTokens);
      jest.spyOn(variableRateService as any, 'adjustPrincipalForSwapEvent').mockReturnValue({
        principals: mockPoolTokens.principals.add(10),
        totalFees: totalFees,
      });
      jest
        .spyOn(variableRateService as any, 'adjustPrincipalForPoolBalanceChangedEvent')
        .mockReturnValue(mockPoolTokens.principals.sub((mockEvents[0].args as any).deltas[0]));
      jest.spyOn(utils, 'parseEther').mockReturnValue(BigNumber.from(1));
      jest.spyOn(weiMath, 'mul18f').mockImplementation((a, b) => a.mul(b).div(10));
      jest.spyOn(weiMath, 'div18f').mockImplementation((a, b) => a.mul(10).div(b));
      Reflect.set(variableRateService, 'tempusAMMService', {
        getSwapFeePercentage: jest.fn().mockResolvedValue(mockSwapFeePercentage),
      });

      const hoursForScale = ((mockLatestBlock.timestamp - mockEarlierBlock.timestamp) / (60 * 60)).toFixed(
        principalsPrecision,
      );

      const scaledFees = weiMath.mul18f(
        weiMath.div18f(totalFees, ethers.utils.parseUnits(hoursForScale, principalsPrecision)),
        ethers.utils.parseUnits(HOURS_IN_A_YEAR.toString(), principalsPrecision),
        principalsPrecision,
      );

      await expect(
        variableRateService.calculateFees(
          tempusAMM,
          tempusPool,
          principalsAddress,
          yieldsAddress,
          'ethereum',
          averageBlockTime,
        ),
      ).resolves.toEqual(weiMath.mul18f(scaledFees, weiMath.div18f(mockPoolTokens.principals, mockPoolTokens.yields)));
      expect(getConfig.getChainConfig).toHaveBeenCalled();
      expect(mockProvider.getBlock).toHaveBeenCalledTimes(2);
      expect(mockProvider.getBlock).toHaveBeenNthCalledWith(1, 'latest');
      expect(mockProvider.getBlock).toHaveBeenNthCalledWith(
        2,
        mockLatestBlock.number - Math.floor((SECONDS_IN_A_DAY * 7) / averageBlockTime),
      );
      expect((variableRateService as any).getSwapAndPoolBalanceChangedEvents).toHaveBeenCalledWith(
        DUMMY_TEMPUS_POOL[0],
        mockEarlierBlock.number,
      );
      expect((variableRateService as any).getPoolTokens).toHaveBeenCalledWith(
        DUMMY_TEMPUS_POOL[0].poolId,
        principalsAddress,
        yieldsAddress,
      );
      expect((variableRateService as any).adjustPrincipalForSwapEvent).toHaveBeenCalledWith(
        mockEvents[1],
        principalsAddress,
        mockPoolTokens.principals.sub((mockEvents[0].args as any).deltas[0]),
        BigNumber.from(0),
        mockSwapFeePercentage,
        principalsPrecision,
      );
      expect((variableRateService as any).adjustPrincipalForPoolBalanceChangedEvent).toHaveBeenCalledWith(
        mockEvents[0],
        principalsAddress,
        mockPoolTokens.principals,
      );
    });

    test('test with swap event with tokenIn == principalsAddress, principals/yields == 0, should return 0 fees', async () => {
      const tempusPool = '0x0000000000000000000000000000000000000000';
      const tempusAMM = '0x0000000000000000000000000000000000000001';
      const principalsAddress = '0x0000000000000000000000000000000000000002';
      const yieldsAddress = '0x0000000000000000000000000000000000000003';
      const principalsPrecision = 18;
      const mockSwapFeePercentage = BigNumber.from(Math.round(Math.random() * 5));
      const mockLatestBlock = { timestamp: Date.now() / 1000, number: 1000 } as providers.Block;
      const mockEarlierBlock = { timestamp: Date.now() / 1000 - 60 * 60, number: 997 } as providers.Block;
      const mockEvents = [
        {
          blockNumber: 998,
          args: {
            liquidityProvider: '0x0000000000000000000000000000000000000003',
            tokens: [principalsAddress],
            deltas: [BigNumber.from(2)],
          },
        },
        {
          blockNumber: 997,
          args: { tokenIn: principalsAddress, tokenOut: yieldsAddress, amountIn: BigNumber.from(100) },
        },
      ] as (SwapEvent | PoolBalanceChangedEvent)[];
      const mockPoolTokens = {
        principals: BigNumber.from(0),
        yields: BigNumber.from(0),
      };
      (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
        getBlock: jest
          .fn()
          .mockImplementation(async (blockHashOrBlockTag: providers.BlockTag): Promise<providers.Block> => {
            return Promise.resolve(blockHashOrBlockTag === 'latest' ? mockLatestBlock : mockEarlierBlock);
          }),
      }));
      (getProviderFromSignerOrProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
      const mockProvider = new JsonRpcProvider();
      jest.spyOn(getConfig, 'getChainConfig').mockReturnValue({ tempusPools: DUMMY_TEMPUS_POOL } as ChainConfig);
      jest.spyOn(variableRateService as any, 'getSwapAndPoolBalanceChangedEvents').mockResolvedValue(mockEvents);
      jest.spyOn(variableRateService as any, 'getPoolTokens').mockResolvedValue(mockPoolTokens);
      jest.spyOn(variableRateService as any, 'adjustPrincipalForSwapEvent').mockReturnValue({
        principals: mockPoolTokens.principals.add(10),
        totalFees: BigNumber.from(2),
      });
      jest
        .spyOn(variableRateService as any, 'adjustPrincipalForPoolBalanceChangedEvent')
        .mockReturnValue(mockPoolTokens.principals.sub((mockEvents[0].args as any).deltas[0]));
      jest.spyOn(utils, 'parseEther').mockReturnValue(BigNumber.from(1));
      jest.spyOn(weiMath, 'mul18f').mockImplementation((a, b) => a.mul(b).div(10));
      jest.spyOn(weiMath, 'div18f').mockImplementation((a, b) => a.mul(10).div(b));
      Reflect.set(variableRateService, 'tempusAMMService', {
        getSwapFeePercentage: jest.fn().mockResolvedValue(mockSwapFeePercentage),
      });

      await expect(
        (variableRateService as any).calculateFees(
          tempusAMM,
          tempusPool,
          principalsAddress,
          yieldsAddress,
          'ethereum',
          averageBlockTime,
        ),
      ).resolves.toEqual(BigNumber.from(0));
      expect(getConfig.getChainConfig).toHaveBeenCalled();
      expect(mockProvider.getBlock).toHaveBeenCalledTimes(2);
      expect(mockProvider.getBlock).toHaveBeenNthCalledWith(1, 'latest');
      expect(mockProvider.getBlock).toHaveBeenNthCalledWith(
        2,
        mockLatestBlock.number - Math.floor((SECONDS_IN_A_DAY * 7) / averageBlockTime),
      );
      expect((variableRateService as any).getSwapAndPoolBalanceChangedEvents).toHaveBeenCalledWith(
        DUMMY_TEMPUS_POOL[0],
        mockEarlierBlock.number,
      );
      expect((variableRateService as any).getPoolTokens).toHaveBeenCalledWith(
        DUMMY_TEMPUS_POOL[0].poolId,
        principalsAddress,
        yieldsAddress,
      );
      expect((variableRateService as any).adjustPrincipalForSwapEvent).toHaveBeenCalledWith(
        mockEvents[1],
        principalsAddress,
        mockPoolTokens.principals.sub((mockEvents[0].args as any).deltas[0]),
        BigNumber.from(0),
        mockSwapFeePercentage,
        principalsPrecision,
      );
      expect((variableRateService as any).adjustPrincipalForPoolBalanceChangedEvent).toHaveBeenCalledWith(
        mockEvents[0],
        principalsAddress,
        mockPoolTokens.principals,
      );
    });

    test('test with no swap events, should return 0 fees', async () => {
      const tempusPool = '0x0000000000000000000000000000000000000000';
      const tempusAMM = '0x0000000000000000000000000000000000000001';
      const principalsAddress = '0x0000000000000000000000000000000000000002';
      const yieldsAddress = '0x0000000000000000000000000000000000000003';
      const mockSwapFeePercentage = BigNumber.from(Math.round(Math.random() * 5));
      const mockLatestBlock = { timestamp: Date.now() / 1000, number: 1000 } as providers.Block;
      const mockEarlierBlock = { timestamp: Date.now() / 1000 - 60 * 60, number: 997 } as providers.Block;
      const mockEvents = [
        {
          blockNumber: 999,
          args: {
            liquidityProvider: '0x0000000000000000000000000000000000000003',
            tokens: [principalsAddress],
            deltas: [BigNumber.from(2)],
          },
        },
        {
          blockNumber: 998,
          args: {
            liquidityProvider: '0x0000000000000000000000000000000000000003',
            tokens: [principalsAddress],
            deltas: [BigNumber.from(2)],
          },
        },
      ] as PoolBalanceChangedEvent[];
      const mockPoolTokens = {
        principals: BigNumber.from(Math.round(Math.random() * 1000)),
        yields: BigNumber.from(Math.round(Math.random() * 100)),
      };
      (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
        getBlock: jest
          .fn()
          .mockImplementation(async (blockHashOrBlockTag: providers.BlockTag): Promise<providers.Block> => {
            return Promise.resolve(blockHashOrBlockTag === 'latest' ? mockLatestBlock : mockEarlierBlock);
          }),
      }));
      (getProviderFromSignerOrProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
      const mockProvider = new JsonRpcProvider();
      jest.spyOn(getConfig, 'getChainConfig').mockReturnValue({ tempusPools: DUMMY_TEMPUS_POOL } as ChainConfig);
      jest.spyOn(variableRateService as any, 'getSwapAndPoolBalanceChangedEvents').mockResolvedValue(mockEvents);
      jest.spyOn(variableRateService as any, 'getPoolTokens').mockResolvedValue(mockPoolTokens);
      jest
        .spyOn(variableRateService as any, 'adjustPrincipalForPoolBalanceChangedEvent')
        .mockReturnValue(mockPoolTokens.principals.sub((mockEvents[0].args as any).deltas[0]));
      jest.spyOn(utils, 'parseEther').mockReturnValue(BigNumber.from(1));
      jest.spyOn(weiMath, 'mul18f').mockImplementation((a, b) => a.mul(b).div(10));
      jest.spyOn(weiMath, 'div18f').mockImplementation((a, b) => a.mul(10).div(b));
      Reflect.set(variableRateService, 'tempusAMMService', {
        getSwapFeePercentage: jest.fn().mockResolvedValue(mockSwapFeePercentage),
      });

      await expect(
        (variableRateService as any).calculateFees(
          tempusAMM,
          tempusPool,
          principalsAddress,
          yieldsAddress,
          'ethereum',
          averageBlockTime,
        ),
      ).resolves.toEqual(BigNumber.from(0));
      expect(getConfig.getChainConfig).toHaveBeenCalled();
      expect(mockProvider.getBlock).toHaveBeenCalledTimes(2);
      expect(mockProvider.getBlock).toHaveBeenNthCalledWith(1, 'latest');
      expect(mockProvider.getBlock).toHaveBeenNthCalledWith(
        2,
        mockLatestBlock.number - Math.floor((SECONDS_IN_A_DAY * 7) / averageBlockTime),
      );
      expect((variableRateService as any).getSwapAndPoolBalanceChangedEvents).toHaveBeenCalledWith(
        DUMMY_TEMPUS_POOL[0],
        mockEarlierBlock.number,
      );
      expect((variableRateService as any).getPoolTokens).toHaveBeenCalledWith(
        DUMMY_TEMPUS_POOL[0].poolId,
        principalsAddress,
        yieldsAddress,
      );
      expect((variableRateService as any).adjustPrincipalForPoolBalanceChangedEvent).toHaveBeenCalledWith(
        mockEvents[0],
        principalsAddress,
        mockPoolTokens.principals,
      );
    });
  });

  describe('getSwapAndPoolBalanceChangedEvents()', () => {
    test('test with no init() invoked, should reject with an error', async () => {
      const fetchEventsFromBlock = Math.round(Math.random() * 20);
      variableRateService = new VariableRateService();

      await expect(
        (variableRateService as any).getSwapAndPoolBalanceChangedEvents(DUMMY_TEMPUS_POOL[0], fetchEventsFromBlock),
      ).rejects.toEqual(undefined);
    });

    test('should return the SwapEvents and PoolBalanceChangedEvents, in order', async () => {
      const fetchEventsFromBlock = Math.round(Math.random() * 20);
      const mockSwapEvents = [{ blockNumber: 1 }] as SwapEvent[];
      const mockPoolBalanceChangedEvents = [{ blockNumber: 2 }] as PoolBalanceChangedEvent[];
      Reflect.set(variableRateService, 'vaultService', {
        getSwapEvents: jest.fn().mockResolvedValue(mockSwapEvents),
        getPoolBalanceChangedEvents: jest.fn().mockResolvedValue(mockPoolBalanceChangedEvents),
      });

      await expect(
        (variableRateService as any).getSwapAndPoolBalanceChangedEvents(DUMMY_TEMPUS_POOL[0], fetchEventsFromBlock),
      ).resolves.toEqual([mockPoolBalanceChangedEvents[0], mockSwapEvents[0]]);
      expect((variableRateService as any).vaultService.getSwapEvents).toHaveBeenCalledWith({
        forPoolId: DUMMY_TEMPUS_POOL[0].poolId,
        fromBlock: fetchEventsFromBlock,
      });
      expect((variableRateService as any).vaultService.getPoolBalanceChangedEvents).toHaveBeenCalledWith(
        DUMMY_TEMPUS_POOL[0].poolId,
        fetchEventsFromBlock,
      );
    });
  });

  describe('adjustPrincipalForSwapEvent()', () => {
    test('test with no principalsAddress in events, should return the same principal and swap fee', () => {
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      const event = {
        blockNumber: 1,
        args: {
          tokenIn: '0x0000000000000000000000000000000000000003',
          tokenOut: yieldsAddress,
        },
      } as SwapEvent;
      const principals = Math.round(Math.random() * 10000);
      const totalFees = Math.round(Math.random() * 5);
      const swapFeePercentage = Math.round(Math.random() * 10);
      jest.spyOn(weiMath, 'mul18f').mockImplementation((a, b) => a.mul(b).div(10));
      jest.spyOn(weiMath, 'div18f').mockImplementation((a, b) => a.mul(10).div(b));

      expect(
        (variableRateService as any).adjustPrincipalForSwapEvent(
          event,
          principalsAddress,
          BigNumber.from(principals),
          BigNumber.from(totalFees),
          BigNumber.from(swapFeePercentage),
        ),
      ).toEqual({
        principals: BigNumber.from(principals),
        totalFees: BigNumber.from(totalFees),
      });
    });

    test('test with tokenIn == principalsAddress, should return the principal-amountIn and swap fee', () => {
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      const event = {
        blockNumber: 1,
        args: { tokenIn: principalsAddress, tokenOut: yieldsAddress, amountIn: BigNumber.from(1000) },
      } as SwapEvent;
      const principals = Math.round(Math.random() * 10000) + event.args.amountIn.toNumber();
      const totalFees = Math.round(Math.random() * 5);
      const swapFeePercentage = Math.round(Math.random() * 10);
      const swapFeesVolume = Math.floor((event.args.amountIn.toNumber() * swapFeePercentage) / 10);
      const feePerPrincipalShare = Math.floor((swapFeesVolume * 10) / (principals - swapFeesVolume));
      jest.spyOn(weiMath, 'mul18f').mockImplementation((a, b) => a.mul(b).div(10));
      jest.spyOn(weiMath, 'div18f').mockImplementation((a, b) => a.mul(10).div(b));

      expect(
        (variableRateService as any).adjustPrincipalForSwapEvent(
          event,
          principalsAddress,
          BigNumber.from(principals),
          BigNumber.from(totalFees),
          BigNumber.from(swapFeePercentage),
        ),
      ).toEqual({
        principals: BigNumber.from(principals).sub(event.args.amountIn),
        totalFees: BigNumber.from(totalFees + feePerPrincipalShare),
      });
    });

    test('test with tokenOut == principalsAddress, should return the principal+amountOut and swap fee (~zero?)', () => {
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      const event = {
        blockNumber: 1,
        args: { tokenIn: yieldsAddress, tokenOut: principalsAddress, amountOut: BigNumber.from(1000) },
      } as SwapEvent;
      const principals = Math.round(Math.random() * 10000) + event.args.amountOut.toNumber();
      const totalFees = Math.round(Math.random() * 5);
      const swapFeePercentage = Math.round(Math.random() * 10);
      jest.spyOn(weiMath, 'mul18f').mockImplementation((a, b) => a.mul(b).div(10));
      jest.spyOn(weiMath, 'div18f').mockImplementation((a, b) => a.mul(10).div(b));

      expect(
        (variableRateService as any).adjustPrincipalForSwapEvent(
          event,
          principalsAddress,
          BigNumber.from(principals),
          BigNumber.from(totalFees),
          BigNumber.from(swapFeePercentage),
        ),
      ).toEqual({
        principals: BigNumber.from(principals).add(event.args.amountOut),
        totalFees: BigNumber.from(totalFees),
      });
    });
  });

  describe('adjustPrincipalForPoolBalanceChangedEvent()', () => {
    test('test with delta +2 of PoolBalanceChangedEvent, should return the principal-2', () => {
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const event = {
        blockNumber: 2,
        args: {
          liquidityProvider: '0x0000000000000000000000000000000000000003',
          tokens: [principalsAddress],
          deltas: [BigNumber.from(2)],
        },
      } as PoolBalanceChangedEvent;
      const principals = Math.round(Math.random() * 1000);

      expect(
        (variableRateService as any).adjustPrincipalForPoolBalanceChangedEvent(
          event,
          principalsAddress,
          BigNumber.from(principals),
        ),
      ).toEqual(BigNumber.from(principals - 2));
    });

    test('test with delta -2 of PoolBalanceChangedEvent, should return the principal+2', () => {
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const event = {
        blockNumber: 2,
        args: {
          liquidityProvider: '0x0000000000000000000000000000000000000003',
          tokens: [principalsAddress],
          deltas: [BigNumber.from(-2)],
        },
      } as PoolBalanceChangedEvent;
      const principals = Math.round(Math.random() * 1000);

      expect(
        (variableRateService as any).adjustPrincipalForPoolBalanceChangedEvent(
          event,
          principalsAddress,
          BigNumber.from(principals),
        ),
      ).toEqual(BigNumber.from(principals + 2));
    });
  });

  describe('getPoolTokens()', () => {
    test('test with no init() invoked (i.e. this.vaultService is undefined), should reject with an error', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      variableRateService = new VariableRateService();

      await expect(
        (variableRateService as any).getPoolTokens(poolId, principalsAddress, yieldsAddress),
      ).rejects.toEqual(undefined);
    });

    test('should return principal and yield balances from pool tokens', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      const mockPoolTokens = {
        tokens: [principalsAddress, yieldsAddress, '0x0000000000000000000000000000000000000003'],
        balances: [Math.random() * 10, Math.random() * 10, Math.random() * 10],
      };
      Reflect.set(variableRateService, 'vaultService', {
        getPoolTokens: jest.fn().mockResolvedValue(mockPoolTokens),
      });

      await expect(
        (variableRateService as any).getPoolTokens(poolId, principalsAddress, yieldsAddress),
      ).resolves.toEqual({
        principals: mockPoolTokens.balances[0],
        yields: mockPoolTokens.balances[1],
      });
      expect((variableRateService as any).vaultService.getPoolTokens).toHaveBeenCalledWith(poolId);
    });
  });

  describe('getAaveAPY()', () => {
    test('test with no init() invoked (i.e. this.aaveLendingPool is undefined), should log an error and return 0', async () => {
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      variableRateService = new VariableRateService();

      await expect((variableRateService as any).getAaveAPY(yieldBearingTokenAddress)).resolves.toEqual(0);
      expect(console.error).toHaveBeenCalled();
      expect((console.error as jest.Mock<void, any>).mock.calls[0][0]).toEqual('VariableRateService - getAaveAPY');
      expect((console.error as jest.Mock<void, any>).mock.calls[0][1]).toBeInstanceOf(Error);
    });

    test('test with throwing error in this.aaveLendingPool.getReserveData, should log an error and return 0', async () => {
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      Reflect.set(variableRateService, 'aaveLendingPool', {
        getReserveData: jest.fn().mockImplementation(() => {
          throw new Error(errMessage);
        }),
      });

      await expect((variableRateService as any).getAaveAPY(yieldBearingTokenAddress)).resolves.toEqual(0);
      expect(console.error).toHaveBeenCalled();
      expect((console.error as jest.Mock<void, any>).mock.calls[0][0]).toEqual('VariableRateService - getAaveAPY');
      expect((console.error as jest.Mock<void, any>).mock.calls[0][1]).toEqual(new Error(errMessage));
    });

    test('should return currentLiquidityRate from AAVE lending pool', async () => {
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      const mockReservedData = {
        currentLiquidityRate: BigNumber.from(Math.round(Math.random() * 5)),
      };
      Reflect.set(variableRateService, 'aaveLendingPool', {
        getReserveData: jest.fn().mockResolvedValue(mockReservedData),
      });
      const expected = Number(utils.formatEther(wadToDai(mockReservedData.currentLiquidityRate)));

      await expect((variableRateService as any).getAaveAPY(yieldBearingTokenAddress)).resolves.toEqual(expected);
      expect((variableRateService as any).aaveLendingPool.getReserveData).toHaveBeenCalledWith(
        yieldBearingTokenAddress,
      );
    });
  });

  describe('getCompoundAPY()', () => {
    test('test with no init() invoked (i.e. this.signerOrProvider is undefined), should return 0', async () => {
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      variableRateService = new VariableRateService();

      await expect((variableRateService as any).getCompoundAPY(yieldBearingTokenAddress)).resolves.toEqual(0);
    });

    test('test with throwing error in supplyRatePerBlock(), should log an error and return 0', async () => {
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      Reflect.set(variableRateService, 'tokenAddressToContractMap', {
        [yieldBearingTokenAddress]: {
          supplyRatePerBlock: jest.fn().mockImplementation(() => {
            throw new Error(errMessage);
          }),
        },
      });

      await expect((variableRateService as any).getCompoundAPY(yieldBearingTokenAddress)).resolves.toEqual(0);
      expect(console.error).toHaveBeenCalled();
      expect((console.error as jest.Mock<void, any>).mock.calls[0][0]).toEqual('VariableRateService - getCompoundAPY');
      expect((console.error as jest.Mock<void, any>).mock.calls[0][1]).toEqual(new Error(errMessage));
    });

    test('invoke once, should create Contractor instance and store in this.tokenAddressToContractMap[yieldBearingTokenAddress]', async () => {
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      const mockSupplyRate = Math.round(Math.random() * 100000);
      const mockSupplyRatePerBlock = jest.fn().mockResolvedValue(mockSupplyRate);
      (Contract as unknown as jest.Mock).mockImplementation(() => ({
        supplyRatePerBlock: mockSupplyRatePerBlock,
      }));
      const expected = Math.pow((mockSupplyRate / 1e18) * COMPOUND_BLOCKS_PER_DAY + 1, DAYS_IN_A_YEAR) - 1;

      expect((variableRateService as any).tokenAddressToContractMap[yieldBearingTokenAddress]).toEqual(undefined);
      await expect((variableRateService as any).getCompoundAPY(yieldBearingTokenAddress)).resolves.toEqual(expected);
      expect(Contract).toHaveBeenCalledTimes(3);
      expect(Contract).toHaveBeenCalledWith(
        yieldBearingTokenAddress,
        cERC20Token,
        (variableRateService as any).signerOrProvider,
      );
      expect((variableRateService as any).tokenAddressToContractMap[yieldBearingTokenAddress]).toEqual(
        new Contract(yieldBearingTokenAddress, cERC20Token, (variableRateService as any).signerOrProvider),
      );
    });

    test('invoke twice, should create Contractor instance only once', async () => {
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';
      const mockSupplyRate = Math.round(Math.random() * 100000);
      const mockSupplyRatePerBlock = jest.fn().mockResolvedValue(mockSupplyRate);
      (Contract as unknown as jest.Mock).mockImplementation(() => ({
        supplyRatePerBlock: mockSupplyRatePerBlock,
      }));
      const expected = Math.pow((mockSupplyRate / 1e18) * COMPOUND_BLOCKS_PER_DAY + 1, DAYS_IN_A_YEAR) - 1;

      expect((variableRateService as any).tokenAddressToContractMap[yieldBearingTokenAddress]).toEqual(undefined);
      await expect((variableRateService as any).getCompoundAPY(yieldBearingTokenAddress)).resolves.toEqual(expected);
      await expect((variableRateService as any).getCompoundAPY(yieldBearingTokenAddress)).resolves.toEqual(expected);
      expect(Contract).toHaveBeenCalledTimes(3);
      expect(Contract).toHaveBeenCalledWith(
        yieldBearingTokenAddress,
        cERC20Token,
        (variableRateService as any).signerOrProvider,
      );
      expect((variableRateService as any).tokenAddressToContractMap[yieldBearingTokenAddress]).toEqual(
        new Contract(yieldBearingTokenAddress, cERC20Token, (variableRateService as any).signerOrProvider),
      );
    });
  });

  describe('getYearnAPR()', () => {
    test('test with no init() invoked (i.e. this.chainId is undefined), should throw an error', async () => {
      const fees = Math.random() * 0.05;
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';

      variableRateService = new VariableRateService();

      try {
        await variableRateService['getYearnAPR'](yieldBearingTokenAddress, fees);
      } catch (error) {
        expect((error as any).message).toBe(
          'VariableRateService - fetchYearnData() - Attempted to use VariableRateService before initializing it!',
        );
      }
    });

    test('should call fetchYearnData(), getYearnAPY() and getAprFromApy() and return APR + fee', async () => {
      const fees = Math.random() * 0.05;
      const yieldBearingTokenAddress = '0x0000000000000000000000000000000000000001';

      jest
        .spyOn(variableRateService as any, 'fetchYearnData')
        .mockReturnValue([{ address: 'abc', apy: { net_apy: 1.23 } }]);

      jest.spyOn(variableRateService as any, 'getYearnAPY').mockReturnValue(10);
      const expected = 10 + fees;

      await expect((variableRateService as any).getYearnAPR(yieldBearingTokenAddress, fees)).resolves.toEqual(expected);
    });
  });
});
