import * as eth from 'ethers';
import VaultABI from '../abi/Vault.json';
import VaultService, { SwapKind } from './VaultService';

jest.mock('./getDefaultProvider');
const getDefaultProvider = jest.requireMock('./getDefaultProvider').default;

describe('VaultService', () => {
  let vaultService: VaultService;

  const vaultAddress = 'test-vault-address';
  const tempusPoolId = 'test-tempus-pool-id';
  const userAddress = 'test-user-address';
  const principalShareAddress = 'test-principal-share-address';
  const yieldShareAddress = 'test-yield-share-address';

  const mockQueryFilter = jest.fn();
  const mockSwap = jest.fn();
  const mockSwapFilter = jest.fn();
  const mockGetBlock = jest.fn();
  const mockGetPoolTokens = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    vaultService = new VaultService();

    jest.spyOn(eth as any, 'Contract').mockImplementation(() => {
      return {
        queryFilter: mockQueryFilter,
        swap: mockSwap,
        estimateGas: {
          swap: jest.fn().mockResolvedValue(eth.BigNumber.from('1')),
        },
        filters: {
          Swap: mockSwapFilter,
        },
        getPoolTokens: mockGetPoolTokens,
      };
    });

    const mockGetTempusAMMService = jest.fn().mockReturnValue({
      poolId: jest.fn().mockReturnValue('test-pool-id'),
    });

    getDefaultProvider.mockImplementation(() => {
      return {
        getBlock: mockGetBlock,
      };
    });

    vaultService.init({
      Contract: eth.Contract,
      abi: VaultABI,
      address: vaultAddress,
      signerOrProvider: getDefaultProvider(),
      tempusAMMService: mockGetTempusAMMService(),
    });
  });

  test('init() - Properly initializes the ethers contract', () => {
    expect(vaultService['contract']).toBeDefined();
  });

  test('getSwapEvents() - Returns a list of swap events', async () => {
    mockQueryFilter.mockImplementation(() => {
      return [{ blockHash: 'test-swap-event-1' }, { blockHash: 'test-swap-event-2' }];
    });

    const events = await vaultService.getSwapEvents();

    expect(events.length).toBe(6);
    expect(events[0].blockHash).toBe('test-swap-event-1');
    expect(events[1].blockHash).toBe('test-swap-event-2');
  });

  test('swap() - Executes a swap function on the contract', async () => {
    mockGetBlock.mockImplementation(() => {
      return {
        timestamp: 1,
      };
    });

    const swapAmount = eth.ethers.BigNumber.from('5');

    await vaultService.swap(
      tempusPoolId,
      SwapKind.GIVEN_IN,
      userAddress,
      principalShareAddress,
      yieldShareAddress,
      swapAmount,
    );

    expect(mockSwap).toHaveBeenCalledTimes(1);
    expect(mockSwap).toHaveBeenCalledWith(
      {
        amount: swapAmount,
        assetIn: principalShareAddress,
        assetOut: yieldShareAddress,
        kind: SwapKind.GIVEN_IN,
        poolId: tempusPoolId,
        userData: eth.utils.formatBytes32String('0x0'),
      },
      {
        fromInternalBalance: false,
        recipient: userAddress,
        sender: userAddress,
        toInternalBalance: false,
      },
      1,
      3601,
      {
        gasLimit: 2,
      },
    );
  });

  test('getPoolTokens() - Returns a list of token amounts', async () => {
    mockGetPoolTokens.mockImplementation(() => {
      return [eth.BigNumber.from('1'), eth.BigNumber.from('2'), eth.BigNumber.from('3')];
    });

    const poolId = 'abc';
    const results = await vaultService.getPoolTokens(poolId);
    expect(results[0].toString()).toBe('1');
    expect(results[1].toString()).toBe('2');
    expect(results[2].toString()).toBe('3');
  });
});
