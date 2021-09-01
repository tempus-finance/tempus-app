import { ethers } from 'ethers';
import VaultABI from '../abi/Vault.json';
import VaultService, { SwapKind } from './VaultService';

jest.mock('ethers');
const { Contract } = jest.requireMock('ethers');

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

  beforeEach(() => {
    jest.clearAllMocks();

    ethers.utils = jest.requireActual('ethers').utils;

    vaultService = new VaultService();

    Contract.mockImplementation(() => {
      return {
        queryFilter: mockQueryFilter,
        swap: mockSwap,
        filters: {
          Swap: mockSwapFilter,
        },
      };
    });

    getDefaultProvider.mockImplementation(() => {
      return {
        getBlock: mockGetBlock,
      };
    });

    vaultService.init({
      Contract: Contract,
      abi: VaultABI,
      address: vaultAddress,
      signerOrProvider: getDefaultProvider(),
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

    expect(events.length).toBe(2);
    expect(events[0].blockHash).toBe('test-swap-event-1');
    expect(events[1].blockHash).toBe('test-swap-event-2');
  });

  test('swap() - Executes a swap function on the contract', async () => {
    mockGetBlock.mockImplementation(() => {
      return {
        timestamp: 1,
      };
    });

    const swapAmount = 5;

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
        amount: ethers.utils.parseEther(swapAmount.toString()),
        assetIn: principalShareAddress,
        assetOut: yieldShareAddress,
        kind: SwapKind.GIVEN_IN,
        poolId: tempusPoolId,
        userData: ethers.utils.formatBytes32String('0x0'),
      },
      {
        fromInternalBalance: false,
        recipient: userAddress,
        sender: userAddress,
        toInternalBalance: false,
      },
      1,
      3601,
    );
  });
});
