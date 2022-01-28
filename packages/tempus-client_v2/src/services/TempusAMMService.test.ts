import * as ejs from 'ethers';
import TempusAMMABI from '../abi/TempusAMM.json';
import * as getConfig from '../utils/getConfig';
import TempusAMMService from './TempusAMMService';
import TempusPoolService from './TempusPoolService';

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

describe('TempusAMMService', () => {
  let tempusAMMService: TempusAMMService;
  let tempusPoolService: TempusPoolService;

  const tempusAMMAddresses = ['address-a', 'address-b', 'address-c'];
  const tempusPoolIds = ['test-pool-id-a', 'test-pool-id-b', 'test-pool-id-c'];
  const tempusPoolAddresses = ['test-pool-address-a', 'test-pool-address-b', 'test-pool-address-c'];

  const mockGetPoolId = jest.fn();
  const mockTempusPool = jest.fn();
  const mockGetSwapFeePercentage = jest.fn();
  const mockERC20TokenServiceGetter = jest.fn();

  const mockProvider = new JsonRpcProvider();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(ejs as any, 'Contract').mockImplementation(() => {
      return {
        getPoolId: mockGetPoolId,
        tempusPool: mockTempusPool,
        getSwapFeePercentage: mockGetSwapFeePercentage,
      };
    });
    jest.spyOn(getConfig, 'getChainConfig').mockReturnValue({
      tempusPools: tempusPoolIds.map((poolId, i) => ({ poolId, address: tempusPoolAddresses[i] })),
    } as any);

    mockGetPoolId.mockImplementation(() => Promise.resolve(tempusPoolIds[0]));
    mockTempusPool.mockImplementation(() => Promise.resolve(tempusPoolAddresses[0]));
    tempusPoolService = new TempusPoolService();
    tempusAMMService = new TempusAMMService();

    tempusAMMService.init({
      Contract: ejs.Contract,
      tempusAMMAddresses,
      TempusAMMABI,
      signerOrProvider: mockProvider,
      tempusPoolService,
      chain: 'fantom',
      eRC20TokenServiceGetter: mockERC20TokenServiceGetter(),
    });
  });

  describe('init()', () => {
    test('Properly initializes the ethers contract for all addresses', () => {
      expect(tempusAMMService['tempusAMMMap'].get(tempusAMMAddresses[0])).toBeDefined();
      expect(tempusAMMService['tempusAMMMap'].get(tempusAMMAddresses[1])).toBeDefined();
      expect(tempusAMMService['tempusAMMMap'].get(tempusAMMAddresses[2])).toBeDefined();
    });

    test('Cleans up previous contracts if called multiple times', () => {
      expect(tempusAMMService['tempusAMMMap'].size).toBe(tempusAMMAddresses.length);

      tempusAMMService.init({
        Contract: ejs.Contract,
        tempusAMMAddresses: tempusAMMAddresses.slice(0, -1),
        TempusAMMABI,
        signerOrProvider: mockProvider,
        tempusPoolService,
        chain: 'fantom',
        eRC20TokenServiceGetter: mockERC20TokenServiceGetter(),
      });

      expect(tempusAMMService['tempusAMMMap'].size).toBe(tempusAMMAddresses.length - 1);
    });
  });

  describe('poolId()', () => {
    test('Returns poolId for specified AMM address', async () => {
      const poolId = await tempusAMMService.poolId(tempusAMMAddresses[2]);

      expect(poolId).toBe(tempusPoolIds[0]);
    });

    test('Throws error if AMM with specified address does not exist', async () => {
      const nonExistingAddress = 'non-existing-address';

      try {
        await tempusAMMService.poolId(nonExistingAddress);
      } catch (error: any) {
        expect(error.message).toBe(
          `TempusAMMService - poolId('${nonExistingAddress}') - Invalid AMM address provided!`,
        );
      }
    });

    test('Logs error into console and rejects if contract call fails', async () => {
      mockGetPoolId.mockImplementation(() => {
        throw new Error('contract-error');
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(tempusAMMService.poolId(tempusAMMAddresses[0])).rejects.toEqual(new Error('contract-error'));
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTempusPoolAddressFromId()', () => {
    test('returns tempus pool address for specified poolId', async () => {
      const poolAddress = await tempusAMMService.getTempusPoolAddressFromId(tempusPoolIds[0]);

      expect(poolAddress).toBe(tempusPoolAddresses[0]);
    });

    test('throws an error if AMM does not exist for specified poolId', async () => {
      const nonExistingPoolId = 'non-existing-pooId';

      try {
        await tempusAMMService.getTempusPoolAddressFromId(nonExistingPoolId);
      } catch (error: any) {
        expect(error.message).toBe(`Failed to find tempus pool config for pool with ${nonExistingPoolId} PoolID`);
      }
    });
  });

  describe('getSwapFeePercentage()', () => {
    test('returns tempus pool swap fee', async () => {
      const fee = ejs.BigNumber.from('12');
      mockGetSwapFeePercentage.mockResolvedValue(fee);
      const swapFee = await tempusAMMService.getSwapFeePercentage(tempusAMMAddresses[0]);

      expect(swapFee).toStrictEqual(fee);
    });
  });
});
