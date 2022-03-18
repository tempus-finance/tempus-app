import { Contract, BigNumber, utils } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import * as TempusCoreServices from 'tempus-core-services';
import VaultABI from '../abi/Vault.json';
import VaultService, {
  PoolBalanceChangedEventListener,
  SwapKind,
  TempusAMMExitKind,
  TempusAMMJoinKind,
} from './VaultService';
import * as getConfig from '../utils/getConfig';
import { ChainConfig } from '../interfaces/Config';

const { CONSTANTS } = TempusCoreServices;
const { provideLiquidityGasIncrease, removeLiquidityGasIncrease, SECONDS_IN_AN_HOUR } = CONSTANTS;

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
  getDefaultProvider: jest.fn(),
}));

describe('VaultService', () => {
  let vaultService: VaultService;
  const DUMMY_ADDR = '0x0000000000000000000000000000000000000000';
  const DUMMY_TEMPUS_POOL = [
    {
      address: DUMMY_ADDR,
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
  const mockProvider = new JsonRpcProvider();

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const mockTempusAMMService = jest.fn().mockReturnValue({});

    vaultService = new VaultService();
    vaultService.init({
      Contract,
      address: DUMMY_ADDR,
      abi: VaultABI,
      signerOrProvider: mockProvider,
      tempusAMMService: mockTempusAMMService(),
      chain: 'fantom',
    });
  });
  afterEach(jest.restoreAllMocks);

  describe('init()', () => {
    test('should create Contractor instance', () => {
      expect(Contract).toHaveBeenCalledWith(DUMMY_ADDR, VaultABI, mockProvider);
    });
  });

  describe('getSwapEvents()', () => {
    test('test with no init() invoked, should reject with an error', async () => {
      vaultService = new VaultService();

      await expect(vaultService.getSwapEvents({})).rejects.toEqual(undefined);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getSwapEvents() - Attempted to use VaultService before initializing it!',
      );
    });

    test('test with no tempusAMMService provided when init(), should reject with an error', async () => {
      const mockTempusAMMService = jest.fn().mockReturnValue(null);
      vaultService = new VaultService();
      vaultService.init({
        Contract: Contract,
        address: DUMMY_ADDR,
        abi: VaultABI,
        signerOrProvider: mockProvider,
        tempusAMMService: mockTempusAMMService(),
        chain: 'fantom',
      });

      await expect(vaultService.getSwapEvents({})).rejects.toEqual(undefined);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getSwapEvents() - Attempted to use VaultService before initializing it!',
      );
    });

    test('test with no forPoolId filter provided, should throw error when getting config', async () => {
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      jest.spyOn(getConfig, 'getChainConfig').mockImplementation(() => {
        throw new Error(errMessage);
      });

      await expect(vaultService.getSwapEvents({})).rejects.toThrow(errMessage);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getSwapEvents() - Failed to get swap events!',
        new Error(errMessage),
      );
    });

    test('test with no forPoolId filter provided, should throw error when query events', async () => {
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      Reflect.set(vaultService, 'contract', {
        queryFilter: jest.fn().mockImplementation(() => {
          throw new Error(errMessage);
        }),
        filters: {
          Swap: jest.fn(),
        },
      });

      await expect(vaultService.getSwapEvents({})).rejects.toThrow(errMessage);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getSwapEvents() - Failed to get swap events!',
        new Error(errMessage),
      );
    });

    test('test with no forPoolId filter provided, should throw error when call Swap()', async () => {
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      Reflect.set(vaultService, 'contract', {
        queryFilter: jest.fn(),
        filters: {
          Swap: jest.fn().mockImplementation(() => {
            throw new Error(errMessage);
          }),
        },
      });

      await expect(vaultService.getSwapEvents({})).rejects.toThrow(errMessage);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getSwapEvents() - Failed to get swap events!',
        new Error(errMessage),
      );
    });

    test('test with no forPoolId filter provided, and vaultService.contract somehow goes null, should throw error', async () => {
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      jest.spyOn(getConfig, 'getChainConfig').mockImplementation(() => {
        Reflect.set(vaultService, 'contract', null);
        return { tempusPools: DUMMY_TEMPUS_POOL } as ChainConfig;
      });

      await expect(vaultService.getSwapEvents({})).rejects.toThrow(
        'VaultService - getSwapEvents() - Attempted to use VaultService before initializing it!',
      );
    });

    test('test with no forPoolId filter provided, should return the Swap events', async () => {
      const fromBlock = Math.round(Math.random() * 1000);
      const toBlock = fromBlock + Math.round(Math.random() * 1000) + 1;
      const mockSwappedEvents = [{ aaa: Math.random().toString(36).substring(2) }];
      const mockEvent = { bbb: Math.random().toString(36).substring(2) };
      jest.spyOn(getConfig, 'getChainConfig').mockReturnValue({ tempusPools: DUMMY_TEMPUS_POOL } as ChainConfig);
      const mockQueryFilter = jest.fn().mockReturnValue(mockSwappedEvents);
      const mockSwap = jest.fn().mockReturnValue(mockEvent);
      Reflect.set(vaultService, 'contract', {
        queryFilter: mockQueryFilter,
        filters: {
          Swap: mockSwap,
        },
      });

      await expect(vaultService.getSwapEvents({ fromBlock, toBlock })).resolves.toEqual(mockSwappedEvents);
      expect(getConfig.getChainConfig).toHaveBeenCalled();
      expect(mockQueryFilter).toHaveBeenCalledWith(mockEvent, fromBlock, toBlock);
      expect(mockSwap).toHaveBeenCalledWith(DUMMY_TEMPUS_POOL[0].poolId);
    });

    test('test with forPoolId filter provided, should throw error when query events', async () => {
      const forPoolId = 'FOR_POOL_ID_' + Math.random().toString(36).substring(2);
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      Reflect.set(vaultService, 'contract', {
        queryFilter: jest.fn().mockImplementation(() => {
          throw new Error(errMessage);
        }),
        filters: {
          Swap: jest.fn(),
        },
      });

      await expect(vaultService.getSwapEvents({ forPoolId })).rejects.toThrow(errMessage);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getSwapEvents() - Failed to get swap events!',
        new Error(errMessage),
      );
    });

    test('test with forPoolId filter provided, should throw error when call Swap()', async () => {
      const forPoolId = 'FOR_POOL_ID_' + Math.random().toString(36).substring(2);
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      Reflect.set(vaultService, 'contract', {
        queryFilter: jest.fn(),
        filters: {
          Swap: jest.fn().mockImplementation(() => {
            throw new Error(errMessage);
          }),
        },
      });

      await expect(vaultService.getSwapEvents({ forPoolId })).rejects.toThrow(errMessage);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getSwapEvents() - Failed to get swap events!',
        new Error(errMessage),
      );
    });

    test('test with forPoolId filter provided, should return the Swap events', async () => {
      const forPoolId = 'FOR_POOL_ID_' + Math.random().toString(36).substring(2);
      const fromBlock = Math.round(Math.random() * 1000);
      const toBlock = fromBlock + Math.round(Math.random() * 1000) + 1;
      const mockSwappedEvents = [{ aaa: Math.random().toString(36).substring(2) }];
      const mockEvent = { bbb: Math.random().toString(36).substring(2) };
      jest.spyOn(getConfig, 'getChainConfig').mockReturnValue({ tempusPools: DUMMY_TEMPUS_POOL } as ChainConfig);
      const mockQueryFilter = jest.fn().mockReturnValue(mockSwappedEvents);
      const mockSwap = jest.fn().mockReturnValue(mockEvent);
      Reflect.set(vaultService, 'contract', {
        queryFilter: mockQueryFilter,
        filters: {
          Swap: mockSwap,
        },
      });

      await expect(vaultService.getSwapEvents({ forPoolId, fromBlock, toBlock })).resolves.toEqual(mockSwappedEvents);
      expect(mockQueryFilter).toHaveBeenCalledWith(mockEvent, fromBlock, toBlock);
      expect(mockSwap).toHaveBeenCalledWith(forPoolId);
    });
  });

  describe('getPoolBalanceChangedEvents()', () => {
    test('test with no init() invoked, should reject with an error', async () => {
      vaultService = new VaultService();

      await expect(vaultService.getPoolBalanceChangedEvents()).rejects.toEqual(undefined);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getPoolBalanceChangedEvents() - Attempted to use VaultService before initializing it!',
      );
    });

    test('test with no tempusAMMService provided when init(), should reject with an error', async () => {
      const mockTempusAMMService = jest.fn().mockReturnValue(null);
      vaultService = new VaultService();
      vaultService.init({
        Contract: Contract,
        address: DUMMY_ADDR,
        abi: VaultABI,
        signerOrProvider: mockProvider,
        tempusAMMService: mockTempusAMMService(),
      });

      await expect(vaultService.getPoolBalanceChangedEvents()).rejects.toEqual(undefined);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getPoolBalanceChangedEvents() - Attempted to use VaultService before initializing it!',
      );
    });

    test('test with no forPoolId filter provided, should throw error when getting config', async () => {
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      jest.spyOn(getConfig, 'getChainConfig').mockImplementation(() => {
        throw new Error(errMessage);
      });

      await expect(vaultService.getPoolBalanceChangedEvents()).rejects.toThrow(errMessage);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getPoolBalanceChangedEvents() - Failed to get PoolBalanceChanged events!',
        new Error(errMessage),
      );
    });

    test('test with no forPoolId filter provided, should throw error when query events', async () => {
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      Reflect.set(vaultService, 'contract', {
        queryFilter: jest.fn().mockImplementation(() => {
          throw new Error(errMessage);
        }),
        filters: {
          PoolBalanceChanged: jest.fn(),
        },
      });

      await expect(vaultService.getPoolBalanceChangedEvents()).rejects.toThrow(errMessage);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getPoolBalanceChangedEvents() - Failed to get PoolBalanceChanged events!',
        new Error(errMessage),
      );
    });

    test('test with no forPoolId filter provided, should throw error when call Swap()', async () => {
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      Reflect.set(vaultService, 'contract', {
        queryFilter: jest.fn(),
        filters: {
          PoolBalanceChanged: jest.fn().mockImplementation(() => {
            throw new Error(errMessage);
          }),
        },
      });

      await expect(vaultService.getPoolBalanceChangedEvents()).rejects.toThrow(errMessage);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getPoolBalanceChangedEvents() - Failed to get PoolBalanceChanged events!',
        new Error(errMessage),
      );
    });

    test('test with no forPoolId filter provided, and vaultService.contract somehow goes null, should throw error', async () => {
      jest.spyOn(getConfig, 'getChainConfig').mockImplementation(() => {
        Reflect.set(vaultService, 'contract', null);
        return { tempusPools: DUMMY_TEMPUS_POOL } as ChainConfig;
      });

      await expect(vaultService.getPoolBalanceChangedEvents()).rejects.toThrow(
        'VaultService - getPoolBalanceChangedEvents() - Attempted to use VaultService before initializing it!',
      );
    });

    test('test with no forPoolId filter provided, should return the Swap events', async () => {
      const fromBlock = Math.round(Math.random() * 1000);
      const mockSwappedEvents = [{ aaa: Math.random().toString(36).substring(2) }];
      const mockEvent = { bbb: Math.random().toString(36).substring(2) };
      jest.spyOn(getConfig, 'getChainConfig').mockReturnValue({ tempusPools: DUMMY_TEMPUS_POOL } as ChainConfig);
      const mockQueryFilter = jest.fn().mockReturnValue(mockSwappedEvents);
      const mockPoolBalanceChanged = jest.fn().mockReturnValue(mockEvent);
      Reflect.set(vaultService, 'contract', {
        queryFilter: mockQueryFilter,
        filters: {
          PoolBalanceChanged: mockPoolBalanceChanged,
        },
      });

      await expect(vaultService.getPoolBalanceChangedEvents('', fromBlock)).resolves.toEqual(mockSwappedEvents);
      expect(getConfig.getChainConfig).toHaveBeenCalled();
      expect(mockQueryFilter).toHaveBeenCalledWith(mockEvent, fromBlock);
      expect(mockPoolBalanceChanged).toHaveBeenCalledWith(DUMMY_TEMPUS_POOL[0].poolId);
    });

    test('test with forPoolId filter provided, should throw error when query events', async () => {
      const forPoolId = 'FOR_POOL_ID_' + Math.random().toString(36).substring(2);
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      Reflect.set(vaultService, 'contract', {
        queryFilter: jest.fn().mockImplementation(() => {
          throw new Error(errMessage);
        }),
        filters: {
          PoolBalanceChanged: jest.fn(),
        },
      });

      await expect(vaultService.getPoolBalanceChangedEvents(forPoolId)).rejects.toThrow(errMessage);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getPoolBalanceChangedEvents() - Failed to get PoolBalanceChanged events!',
        new Error(errMessage),
      );
    });

    test('test with forPoolId filter provided, should throw error when call PoolBalanceChanged()', async () => {
      const forPoolId = 'FOR_POOL_ID_' + Math.random().toString(36).substring(2);
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      Reflect.set(vaultService, 'contract', {
        queryFilter: jest.fn(),
        filters: {
          PoolBalanceChanged: jest.fn().mockImplementation(() => {
            throw new Error(errMessage);
          }),
        },
      });

      await expect(vaultService.getPoolBalanceChangedEvents(forPoolId)).rejects.toThrow(errMessage);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getPoolBalanceChangedEvents() - Failed to get PoolBalanceChanged events!',
        new Error(errMessage),
      );
    });

    test('test with forPoolId filter provided, should return the PoolBalanceChanged events', async () => {
      const forPoolId = 'FOR_POOL_ID_' + Math.random().toString(36).substring(2);
      const fromBlock = Math.round(Math.random() * 1000);
      const mockSwappedEvents = [{ aaa: Math.random().toString(36).substring(2) }];
      const mockEvent = { bbb: Math.random().toString(36).substring(2) };
      jest.spyOn(getConfig, 'getChainConfig').mockReturnValue({ tempusPools: DUMMY_TEMPUS_POOL } as ChainConfig);
      const mockQueryFilter = jest.fn().mockReturnValue(mockSwappedEvents);
      const mockPoolBalanceChanged = jest.fn().mockReturnValue(mockEvent);
      Reflect.set(vaultService, 'contract', {
        queryFilter: mockQueryFilter,
        filters: {
          PoolBalanceChanged: mockPoolBalanceChanged,
        },
      });

      await expect(vaultService.getPoolBalanceChangedEvents(forPoolId, fromBlock)).resolves.toEqual(mockSwappedEvents);
      expect(mockQueryFilter).toHaveBeenCalledWith(mockEvent, fromBlock);
      expect(mockPoolBalanceChanged).toHaveBeenCalledWith(forPoolId);
    });
  });

  describe('swap()', () => {
    test('test with no init() invoked, should reject with an error', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const kind = SwapKind.GIVEN_IN;
      const fromAddress = DUMMY_ADDR;
      const assetIn = 'DUMMY_ASSET_IN';
      const assetOut = 'DUMMY_ASSET_OUT';
      const amount = BigNumber.from(1);
      const minReturn = BigNumber.from(2);
      vaultService = new VaultService();

      await expect(vaultService.swap(poolId, kind, fromAddress, assetIn, assetOut, amount, minReturn)).rejects.toEqual(
        undefined,
      );
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - swap() - Attempted to use VaultService before initializing it!',
      );
    });

    test('test with success run, should return with ContractTransaction', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const kind = SwapKind.GIVEN_IN;
      const fromAddress = DUMMY_ADDR;
      const assetIn = 'DUMMY_ASSET_IN';
      const assetOut = 'DUMMY_ASSET_OUT';
      const amount = BigNumber.from(1);
      const minReturn = BigNumber.from(2);
      const ts = Date.now();
      const singleSwap = {
        poolId,
        kind,
        assetIn,
        assetOut,
        amount,
        userData: '0x3078300000000000000000000000000000000000000000000000000000000000',
      };
      const fundManagement = {
        sender: fromAddress,
        fromInternalBalance: false,
        recipient: fromAddress,
        toInternalBalance: false,
      };
      const mockGetBlock = jest.fn().mockReturnValue({ timestamp: ts });
      const mockContractTransaction = { bbb: Math.random().toString(36).substring(2) };
      const mockEstimate = BigNumber.from(5);
      const mockEstimateSwap = jest.fn().mockResolvedValue(mockEstimate);
      const mockSwap = jest.fn().mockReturnValue(mockContractTransaction);
      jest
        .spyOn(TempusCoreServices, 'getDefaultProvider')
        .mockReturnValue({ getBlock: mockGetBlock } as unknown as JsonRpcProvider);
      Reflect.set(vaultService, 'contract', {
        estimateGas: {
          swap: mockEstimateSwap,
        },
        swap: mockSwap,
      });

      await expect(vaultService.swap(poolId, kind, fromAddress, assetIn, assetOut, amount, minReturn)).resolves.toEqual(
        mockContractTransaction,
      );
      expect(TempusCoreServices.getDefaultProvider).toHaveBeenCalled();
      expect(mockGetBlock).toHaveBeenCalledWith('latest');
      expect(mockEstimateSwap).toHaveBeenCalledWith(singleSwap, fundManagement, minReturn, ts + SECONDS_IN_AN_HOUR);
      expect(mockSwap).toHaveBeenCalledWith(singleSwap, fundManagement, minReturn, ts + SECONDS_IN_AN_HOUR, {
        gasLimit: Math.ceil(mockEstimate.toNumber() * 1.1),
      });
    });
  });

  describe('provideLiquidity()', () => {
    test('test with no init() invoked, should reject with an error', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const userWalletAddress = DUMMY_ADDR;
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      const principalsIn = BigNumber.from(1);
      const yieldsIn = BigNumber.from(2);
      vaultService = new VaultService();

      await expect(
        vaultService.provideLiquidity(
          poolId,
          userWalletAddress,
          principalsAddress,
          yieldsAddress,
          principalsIn,
          yieldsIn,
        ),
      ).rejects.toEqual(undefined);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - provideLiquidity() - Attempted to use VaultService before initializing it!',
      );
    });

    test('test with fail to get pool tokens, should reject with an error', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const userWalletAddress = DUMMY_ADDR;
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      const principalsIn = BigNumber.from(1);
      const yieldsIn = BigNumber.from(2);
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      Reflect.set(vaultService, 'contract', {
        getPoolTokens: jest.fn().mockImplementation(() => {
          throw new Error(errMessage);
        }),
      });

      await expect(
        vaultService.provideLiquidity(
          poolId,
          userWalletAddress,
          principalsAddress,
          yieldsAddress,
          principalsIn,
          yieldsIn,
        ),
      ).rejects.toEqual(undefined);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - provideLiquidity() - Failed to check tempus pool AMM balance!',
        new Error(errMessage),
      );
    });

    test('test with fail to get pool tokens, should reject with an error', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const userWalletAddress = DUMMY_ADDR;
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      const principalsIn = BigNumber.from(1);
      const yieldsIn = BigNumber.from(2);
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      Reflect.set(vaultService, 'contract', {
        getPoolTokens: jest.fn().mockImplementation(() => {
          throw new Error(errMessage);
        }),
      });

      await expect(
        vaultService.provideLiquidity(
          poolId,
          userWalletAddress,
          principalsAddress,
          yieldsAddress,
          principalsIn,
          yieldsIn,
        ),
      ).rejects.toEqual(undefined);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - provideLiquidity() - Failed to check tempus pool AMM balance!',
        new Error(errMessage),
      );
    });

    test('test with pool tokens with zero balances, should reject with an error unless both principalsIn and yieldsIn are non-zero', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const userWalletAddress = DUMMY_ADDR;
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      const mockPoolTokens = {
        balances: [BigNumber.from(0), BigNumber.from(0)],
      };
      const mockGetPoolTokens = jest.fn().mockReturnValue(mockPoolTokens);
      const mockEstimate = BigNumber.from(5);
      const mockEstimateJoinPool = jest.fn().mockResolvedValue(mockEstimate);
      const mockContractTransaction = { aaa: Math.random().toString(36).substring(2) };
      const mockJoinPool = jest.fn().mockResolvedValue(mockContractTransaction);
      Reflect.set(vaultService, 'contract', {
        getPoolTokens: mockGetPoolTokens,
        estimateGas: {
          joinPool: mockEstimateJoinPool,
        },
        joinPool: mockJoinPool,
      });

      await expect(
        vaultService.provideLiquidity(
          poolId,
          userWalletAddress,
          principalsAddress,
          yieldsAddress,
          BigNumber.from(0),
          BigNumber.from(0),
        ),
      ).rejects.toEqual('Both tokens in must be non-zero amount when initializing the pool!');
      expect(mockGetPoolTokens).toHaveBeenCalledTimes(1);

      await expect(
        vaultService.provideLiquidity(
          poolId,
          userWalletAddress,
          principalsAddress,
          yieldsAddress,
          BigNumber.from(0),
          BigNumber.from(1),
        ),
      ).rejects.toEqual('Both tokens in must be non-zero amount when initializing the pool!');
      expect(mockGetPoolTokens).toHaveBeenCalledTimes(2);

      await expect(
        vaultService.provideLiquidity(
          poolId,
          userWalletAddress,
          principalsAddress,
          yieldsAddress,
          BigNumber.from(1),
          BigNumber.from(0),
        ),
      ).rejects.toEqual('Both tokens in must be non-zero amount when initializing the pool!');
      expect(mockGetPoolTokens).toHaveBeenCalledTimes(3);

      const joinPoolRequest = {
        assets: [principalsAddress, yieldsAddress],
        maxAmountsIn: [BigNumber.from(1), BigNumber.from(2)],
        userData: utils.defaultAbiCoder.encode(
          ['uint256', 'uint256[]'],
          [TempusAMMJoinKind.INIT, [BigNumber.from(1), BigNumber.from(2)]],
        ),
        fromInternalBalance: false,
      };
      await expect(
        vaultService.provideLiquidity(
          poolId,
          userWalletAddress,
          principalsAddress,
          yieldsAddress,
          BigNumber.from(1),
          BigNumber.from(2),
        ),
      ).resolves.toEqual(mockContractTransaction);
      expect(mockGetPoolTokens).toHaveBeenCalledTimes(4);
      expect(mockEstimateJoinPool).toHaveBeenCalledWith(poolId, userWalletAddress, userWalletAddress, joinPoolRequest);
      expect(mockJoinPool).toHaveBeenCalledWith(poolId, userWalletAddress, userWalletAddress, joinPoolRequest, {
        gasLimit: Math.ceil(mockEstimate.toNumber() * provideLiquidityGasIncrease),
      });
    });

    test('test with pool tokens with non-zero balances, should throw error when estimate join pool', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const userWalletAddress = DUMMY_ADDR;
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      const principalsIn = BigNumber.from(1);
      const yieldsIn = BigNumber.from(2);
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      const mockPoolTokens = {
        balances: [BigNumber.from(3), BigNumber.from(4)],
      };
      const mockGetPoolTokens = jest.fn().mockResolvedValue(mockPoolTokens);
      Reflect.set(vaultService, 'contract', {
        getPoolTokens: mockGetPoolTokens,
        estimateGas: {
          joinPool: jest.fn().mockImplementation(() => {
            throw new Error(errMessage);
          }),
        },
      });

      await expect(
        vaultService.provideLiquidity(
          poolId,
          userWalletAddress,
          principalsAddress,
          yieldsAddress,
          principalsIn,
          yieldsIn,
        ),
      ).rejects.toEqual(undefined);
      expect(mockGetPoolTokens).toHaveBeenCalledWith(poolId);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - provideLiquidity() - Failed to provide liquidity to tempus pool AMM!',
        new Error(errMessage),
      );
    });

    test('test with pool tokens with non-zero balances, should throw error when join pool', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const userWalletAddress = DUMMY_ADDR;
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      const principalsIn = BigNumber.from(1);
      const yieldsIn = BigNumber.from(2);
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      const joinPoolRequest = {
        assets: [principalsAddress, yieldsAddress],
        maxAmountsIn: [BigNumber.from(1), BigNumber.from(2)],
        userData: utils.defaultAbiCoder.encode(
          ['uint256', 'uint256[]'],
          [TempusAMMJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT, [BigNumber.from(1), BigNumber.from(2)]],
        ),
        fromInternalBalance: false,
      };
      const mockPoolTokens = {
        balances: [BigNumber.from(3), BigNumber.from(4)],
      };
      const mockGetPoolTokens = jest.fn().mockResolvedValue(mockPoolTokens);
      const mockEstimate = BigNumber.from(5);
      const mockEstimateJoinPool = jest.fn().mockResolvedValue(mockEstimate);
      Reflect.set(vaultService, 'contract', {
        getPoolTokens: mockGetPoolTokens,
        estimateGas: {
          joinPool: mockEstimateJoinPool,
        },
        joinPool: jest.fn().mockImplementation(() => {
          throw new Error(errMessage);
        }),
      });

      await expect(
        vaultService.provideLiquidity(
          poolId,
          userWalletAddress,
          principalsAddress,
          yieldsAddress,
          principalsIn,
          yieldsIn,
        ),
      ).rejects.toEqual(undefined);
      expect(mockGetPoolTokens).toHaveBeenCalledWith(poolId);
      expect(mockEstimateJoinPool).toHaveBeenCalledWith(poolId, userWalletAddress, userWalletAddress, joinPoolRequest);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - provideLiquidity() - Failed to provide liquidity to tempus pool AMM!',
        new Error(errMessage),
      );
    });

    test('test with pool tokens with non-zero balances, should return with ContractTransaction', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const userWalletAddress = DUMMY_ADDR;
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      const principalsIn = BigNumber.from(1);
      const yieldsIn = BigNumber.from(2);
      const joinPoolRequest = {
        assets: [principalsAddress, yieldsAddress],
        maxAmountsIn: [BigNumber.from(1), BigNumber.from(2)],
        userData: utils.defaultAbiCoder.encode(
          ['uint256', 'uint256[]'],
          [TempusAMMJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT, [BigNumber.from(1), BigNumber.from(2)]],
        ),
        fromInternalBalance: false,
      };
      const mockPoolTokens = {
        balances: [BigNumber.from(3), BigNumber.from(4)],
      };
      const mockGetPoolTokens = jest.fn().mockReturnValue(mockPoolTokens);
      const mockEstimate = BigNumber.from(5);
      const mockEstimateJoinPool = jest.fn().mockResolvedValue(mockEstimate);
      const mockContractTransaction = { aaa: Math.random().toString(36).substring(2) };
      const mockJoinPool = jest.fn().mockResolvedValue(mockContractTransaction);
      Reflect.set(vaultService, 'contract', {
        getPoolTokens: mockGetPoolTokens,
        estimateGas: {
          joinPool: mockEstimateJoinPool,
        },
        joinPool: mockJoinPool,
      });

      await expect(
        vaultService.provideLiquidity(
          poolId,
          userWalletAddress,
          principalsAddress,
          yieldsAddress,
          principalsIn,
          yieldsIn,
        ),
      ).resolves.toEqual(mockContractTransaction);
      expect(mockGetPoolTokens).toHaveBeenCalledWith(poolId);
      expect(mockEstimateJoinPool).toHaveBeenCalledWith(poolId, userWalletAddress, userWalletAddress, joinPoolRequest);
      expect(mockJoinPool).toHaveBeenCalledWith(poolId, userWalletAddress, userWalletAddress, joinPoolRequest, {
        gasLimit: Math.ceil(mockEstimate.toNumber() * provideLiquidityGasIncrease),
      });
    });
  });

  describe('removeLiquidity()', () => {
    test('test with no init() invoked, should reject with an error', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const userWalletAddress = DUMMY_ADDR;
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      const lpAmount = BigNumber.from(1);
      const minPrincipalsReceived = BigNumber.from(2);
      const minYieldsReceived = BigNumber.from(3);
      vaultService = new VaultService();

      await expect(
        vaultService.removeLiquidity(
          poolId,
          userWalletAddress,
          principalsAddress,
          yieldsAddress,
          lpAmount,
          minPrincipalsReceived,
          minYieldsReceived,
        ),
      ).rejects.toEqual(undefined);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - removeLiquidity() - Attempted to use VaultService before initializing it!',
      );
    });

    test('test with throw error when estimate join pool, should reject with an error', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const userWalletAddress = DUMMY_ADDR;
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      const lpAmount = BigNumber.from(1);
      const minPrincipalsReceived = BigNumber.from(2);
      const minYieldsReceived = BigNumber.from(3);
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      Reflect.set(vaultService, 'contract', {
        estimateGas: {
          exitPool: jest.fn().mockImplementation(() => {
            throw new Error(errMessage);
          }),
        },
      });

      await expect(
        vaultService.removeLiquidity(
          poolId,
          userWalletAddress,
          principalsAddress,
          yieldsAddress,
          lpAmount,
          minPrincipalsReceived,
          minYieldsReceived,
        ),
      ).rejects.toEqual(undefined);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - removeLiquidity() - Failed to remove liquidity from tempus pool AMM!',
        new Error(errMessage),
      );
    });

    test('test with throw error when join pool, should reject with an error', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const userWalletAddress = DUMMY_ADDR;
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      const lpAmount = BigNumber.from(1);
      const minPrincipalsReceived = BigNumber.from(2);
      const minYieldsReceived = BigNumber.from(3);
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      const exitUserData = utils.defaultAbiCoder.encode(
        ['uint256', 'uint256'],
        [TempusAMMExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT, lpAmount],
      );
      const exitPoolRequest = {
        assets: [principalsAddress, yieldsAddress],
        minAmountsOut: [minPrincipalsReceived, minYieldsReceived],
        userData: exitUserData,
        toInternalBalance: false,
      };
      const mockEstimate = BigNumber.from(5);
      const mockEstimateExitPool = jest.fn().mockResolvedValue(mockEstimate);
      Reflect.set(vaultService, 'contract', {
        estimateGas: {
          exitPool: mockEstimateExitPool,
        },
        exitPool: jest.fn().mockImplementation(() => {
          throw new Error(errMessage);
        }),
      });

      await expect(
        vaultService.removeLiquidity(
          poolId,
          userWalletAddress,
          principalsAddress,
          yieldsAddress,
          lpAmount,
          minPrincipalsReceived,
          minYieldsReceived,
        ),
      ).rejects.toEqual(undefined);
      expect(mockEstimateExitPool).toHaveBeenCalledWith(poolId, userWalletAddress, userWalletAddress, exitPoolRequest);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - removeLiquidity() - Failed to remove liquidity from tempus pool AMM!',
        new Error(errMessage),
      );
    });

    test('test with success, should return with ContractTransaction', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const userWalletAddress = DUMMY_ADDR;
      const principalsAddress = '0x0000000000000000000000000000000000000001';
      const yieldsAddress = '0x0000000000000000000000000000000000000002';
      const lpAmount = BigNumber.from(1);
      const minPrincipalsReceived = BigNumber.from(2);
      const minYieldsReceived = BigNumber.from(3);
      const exitUserData = utils.defaultAbiCoder.encode(
        ['uint256', 'uint256'],
        [TempusAMMExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT, lpAmount],
      );
      const exitPoolRequest = {
        assets: [principalsAddress, yieldsAddress],
        minAmountsOut: [minPrincipalsReceived, minYieldsReceived],
        userData: exitUserData,
        toInternalBalance: false,
      };
      const mockEstimate = BigNumber.from(5);
      const mockEstimateExitPool = jest.fn().mockResolvedValue(mockEstimate);
      const mockContractTransaction = { aaa: Math.random().toString(36).substring(2) };
      const mockExitPool = jest.fn().mockResolvedValue(mockContractTransaction);
      Reflect.set(vaultService, 'contract', {
        estimateGas: {
          exitPool: mockEstimateExitPool,
        },
        exitPool: mockExitPool,
      });

      await expect(
        vaultService.removeLiquidity(
          poolId,
          userWalletAddress,
          principalsAddress,
          yieldsAddress,
          lpAmount,
          minPrincipalsReceived,
          minYieldsReceived,
        ),
      ).resolves.toEqual(mockContractTransaction);
      expect(mockEstimateExitPool).toHaveBeenCalledWith(poolId, userWalletAddress, userWalletAddress, exitPoolRequest);
      expect(mockExitPool).toHaveBeenCalledWith(poolId, userWalletAddress, userWalletAddress, exitPoolRequest, {
        gasLimit: Math.ceil(mockEstimate.toNumber() * removeLiquidityGasIncrease),
      });
    });
  });

  describe('getPoolTokens()', () => {
    test('test with no init() invoked, should reject with error', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      vaultService = new VaultService();

      await expect(vaultService.getPoolTokens(poolId)).rejects.toEqual(undefined);
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getPoolTokens() - Attempted to use VaultService before initializing it!',
      );
    });

    test('test with throw error when contract.getPoolTokens(), should reject with error', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      Reflect.set(vaultService, 'contract', {
        getPoolTokens: jest.fn().mockImplementation(() => {
          throw new Error(errMessage);
        }),
      });

      await expect(vaultService.getPoolTokens(poolId)).rejects.toEqual(new Error(errMessage));
      expect(console.error).toHaveBeenCalledWith(
        'VaultService - getPoolTokens() - Failed to get pool tokens!',
        new Error(errMessage),
      );
    });

    test('test with success, should return with PoolTokens', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const mockPoolTokens = {
        balances: [BigNumber.from(3), BigNumber.from(4)],
      };
      const mockGetPoolTokens = jest.fn().mockResolvedValue(mockPoolTokens);
      Reflect.set(vaultService, 'contract', {
        getPoolTokens: mockGetPoolTokens,
      });

      await expect(vaultService.getPoolTokens(poolId)).resolves.toEqual(mockPoolTokens);
      expect(mockGetPoolTokens).toHaveBeenCalledWith(poolId);
    });

    test('test with success, should pass overrides to contract.getPoolTokens', async () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const mockOverride = { aaa: Math.random().toString(36).substring(2) } as any;
      const mockPoolTokens = {
        balances: [BigNumber.from(3), BigNumber.from(4)],
      };
      const mockGetPoolTokens = jest.fn().mockResolvedValue(mockPoolTokens);
      Reflect.set(vaultService, 'contract', {
        getPoolTokens: mockGetPoolTokens,
      });

      await expect(vaultService.getPoolTokens(poolId, mockOverride)).resolves.toEqual(mockPoolTokens);
      expect(mockGetPoolTokens).toHaveBeenCalledWith(poolId, mockOverride);
    });
  });

  describe('onPoolBalanceChanged()', () => {
    test('test with no init() invoked, should do nth', () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const mockListener: any = {
        aaa: Math.random().toString(36).substring(2),
      };
      const mockOn = jest.fn();
      const mockPoolBalanceChanged = jest.fn();
      Reflect.set(vaultService, 'contract', {
        on: mockOn,
        filters: {
          PoolBalanceChanged: mockPoolBalanceChanged,
        },
      });
      vaultService = new VaultService();

      vaultService.onPoolBalanceChanged(poolId, mockListener);
      expect(mockOn).not.toHaveBeenCalled();
      expect(mockPoolBalanceChanged).not.toHaveBeenCalled();
    });

    test('test with success, should invoke this.contract.on() and this.contract.filters.PoolBalanceChanged()', () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const mockListener = {
        aaa: Math.random().toString(36).substring(2),
      } as unknown as PoolBalanceChangedEventListener;
      const mockPoolBalanceChangedFilter = { aaa: Math.random().toString(36).substring(2) };
      const mockOn = jest.fn();
      const mockPoolBalanceChanged = jest.fn().mockReturnValue(mockPoolBalanceChangedFilter);
      Reflect.set(vaultService, 'contract', {
        on: mockOn,
        filters: {
          PoolBalanceChanged: mockPoolBalanceChanged,
        },
      });

      vaultService.onPoolBalanceChanged(poolId, mockListener);
      expect(mockOn).toHaveBeenCalledWith(mockPoolBalanceChangedFilter, mockListener);
      expect(mockPoolBalanceChanged).toHaveBeenCalledWith(poolId);
    });
  });

  describe('offPoolBalanceChanged()', () => {
    test('test with no init() invoked, should do nth', () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const mockListener = {
        aaa: Math.random().toString(36).substring(2),
      } as unknown as PoolBalanceChangedEventListener;
      const mockOff = jest.fn();
      const mockPoolBalanceChanged = jest.fn();
      Reflect.set(vaultService, 'contract', {
        off: mockOff,
        filters: {
          PoolBalanceChanged: mockPoolBalanceChanged,
        },
      });
      vaultService = new VaultService();

      vaultService.offPoolBalanceChanged(poolId, mockListener);
      expect(mockOff).not.toHaveBeenCalled();
      expect(mockPoolBalanceChanged).not.toHaveBeenCalled();
    });

    test('test with success, should invoke this.contract.off() and this.contract.filters.PoolBalanceChanged()', () => {
      const poolId = 'POOL_ID_' + Math.random().toString(36).substring(2);
      const mockListener = {
        aaa: Math.random().toString(36).substring(2),
      } as unknown as PoolBalanceChangedEventListener;
      const mockPoolBalanceChangedFilter = { aaa: Math.random().toString(36).substring(2) };
      const mockOff = jest.fn();
      const mockPoolBalanceChanged = jest.fn().mockReturnValue(mockPoolBalanceChangedFilter);
      Reflect.set(vaultService, 'contract', {
        off: mockOff,
        filters: {
          PoolBalanceChanged: mockPoolBalanceChanged,
        },
      });

      vaultService.offPoolBalanceChanged(poolId, mockListener);
      expect(mockOff).toHaveBeenCalledWith(mockPoolBalanceChangedFilter, mockListener);
      expect(mockPoolBalanceChanged).toHaveBeenCalledWith(poolId);
    });
  });
});
