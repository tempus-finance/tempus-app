import DashboardDataAdapter from './DashboardDataAdapter';
import { ChainConfig, TempusPool } from 'tempus-core-services';
import * as TempusCoreServices from 'tempus-core-services';
import * as getConfig from '../utils/getConfig';
import { BigNumber } from 'ethers';
import * as rxjs from 'rxjs';

jest.mock('ethers');
const { Contract } = jest.requireMock('ethers');

jest.mock('@ethersproject/providers', () => ({
  ...jest.requireActual('@ethersproject/providers'),
  JsonRpcProvider: jest.fn(),
}));
jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getStatisticsService: jest.fn(),
  getDefaultProvider: jest.fn(),
}));

const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

describe('DashboardDataAdapter', () => {
  let dashboardDataAdapter: DashboardDataAdapter;
  const MOCK_TEMPUS_POOL = [
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
    {
      address: '0x0000000000000000000000000000000000000010',
      poolId: 'DUMMY_POOL_ID_2',
      ammAddress: '0x0000000000000000000000000000000000000011',
      principalsAddress: '0x0000000000000000000000000000000000000012',
      yieldsAddress: '0x0000000000000000000000000000000000000013',
      yieldBearingTokenAddress: '0x0000000000000000000000000000000000000014',
      backingTokenAddress: '0x0000000000000000000000000000000000000015',
      startDate: new Date(2022, 0, 1).getTime(),
      maturityDate: new Date(2022, 6, 1).getTime(),
      protocol: 'rari',
      backingToken: 'USDC',
      yieldBearingToken: 'RCPT',
      spotPrice: '2',
      decimalsForUI: 2,
      tokenPrecision: {
        backingToken: 6,
        lpTokens: 18,
        principals: 6,
        yieldBearingToken: 18,
        yields: 18,
      },
    },
  ];

  const mockTVL = BigNumber.from(Math.round(Math.random() * 1000000));

  const mockTotalValueLockedUSD = jest.fn().mockReturnValue(mockTVL);

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(TempusCoreServices, 'getDefaultProvider').mockReturnValue(new JsonRpcProvider());

    Contract.mockImplementation(() => {
      return {
        totalValueLockedInBackingTokens: mockTotalValueLockedUSD,
        totalValueLockedAtGivenRate: mockTotalValueLockedUSD,
      };
    });

    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    dashboardDataAdapter = new DashboardDataAdapter();
  });
  afterEach(jest.restoreAllMocks);

  describe('getRows()', () => {
    test('returns an array of rows', () => {
      const mockChildRows = new Array(5).fill(0).map(() => ({ id: Math.random().toString(36) }));
      const mockParentRows = new Array(3).fill(0).map(() => ({ id: Math.random().toString(36) }));
      jest.spyOn(dashboardDataAdapter as any, 'getChildRows').mockReturnValue(mockChildRows);
      jest.spyOn(dashboardDataAdapter as any, 'getParentRows').mockReturnValue(mockParentRows);

      expect(dashboardDataAdapter.getRows('fantom')).toEqual([...mockParentRows, ...mockChildRows]);
      expect(dashboardDataAdapter['getChildRows']).toHaveBeenCalledTimes(1);
      expect(dashboardDataAdapter['getParentRows']).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTempusPoolTVL()', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('test with no forceFetch and no focus, should return Observable<null>', async () => {
      const tempusPoolAddr = MOCK_TEMPUS_POOL[0].address;
      const backingTokenTicker = 'USDC';
      jest.spyOn(rxjs, 'interval').mockReturnValue(rxjs.of(0));

      const observable = dashboardDataAdapter.getTempusPoolTVL('fantom', tempusPoolAddr, backingTokenTicker);
      await expect(rxjs.firstValueFrom(observable)).rejects.toBeInstanceOf(rxjs.EmptyError);
    });

    test('test with forceFetch, should return Observable of TVL', async () => {
      jest.spyOn(TempusCoreServices, 'getStatisticsService').mockImplementationOnce(() => {
        return {
          totalValueLockedUSD: jest.fn().mockResolvedValue(mockTVL),
        } as any;
      });
      jest.spyOn(getConfig, 'getChainConfig').mockReturnValue({ tempusPools: MOCK_TEMPUS_POOL } as ChainConfig);
      const tempusPoolAddr = MOCK_TEMPUS_POOL[0].address;
      const backingTokenTicker = 'USDC';
      jest.spyOn(rxjs, 'interval').mockReturnValue(rxjs.of(0));

      const observable = dashboardDataAdapter.getTempusPoolTVL('fantom', tempusPoolAddr, backingTokenTicker, true);
      const result = await rxjs.firstValueFrom(observable);
      expect(result).toBe(mockTVL);
    });

    test('test with focus, should return Observable of TVL', async () => {
      jest.spyOn(TempusCoreServices, 'getStatisticsService').mockImplementationOnce(() => {
        return {
          totalValueLockedUSD: jest.fn().mockResolvedValue(mockTVL),
        } as any;
      });
      const tempusPoolAddr = MOCK_TEMPUS_POOL[0].address;
      const backingTokenTicker = 'USDC';
      jest.spyOn(document, 'hasFocus').mockReturnValue(true);
      jest.spyOn(rxjs, 'interval').mockReturnValue(rxjs.of(0));

      const observable = dashboardDataAdapter.getTempusPoolTVL('fantom', tempusPoolAddr, backingTokenTicker);
      const result = await rxjs.firstValueFrom(observable);
      expect(result).toBe(mockTVL);
    });

    test('test with throwing error from statisticsService.totalValueLockedUSD(), should return Observable<null>', async () => {
      const errMessage = 'ERROR_MSG_' + Math.random().toString(36).substring(2);
      jest.spyOn(TempusCoreServices, 'getStatisticsService').mockImplementationOnce(() => {
        return {
          totalValueLockedUSD: jest.fn().mockImplementation(() => {
            throw new Error(errMessage);
          }),
        } as any;
      });
      const tempusPoolAddr = MOCK_TEMPUS_POOL[0].address;
      const backingTokenTicker = 'USDC';
      jest.spyOn(rxjs, 'interval').mockReturnValue(rxjs.of(0));

      const observable = dashboardDataAdapter.getTempusPoolTVL('fantom', tempusPoolAddr, backingTokenTicker, true);
      const result = await rxjs.firstValueFrom(observable);
      expect(result).toBe(null);
      expect(console.error).toHaveBeenCalledWith('DashboardAdapter - getTempusPoolTVL', new Error(errMessage));
    });
  });

  describe('getChildRows()', () => {
    test('returns an array of child rows', () => {
      jest.spyOn(getConfig, 'getChainConfig').mockReturnValue({ tempusPools: MOCK_TEMPUS_POOL } as ChainConfig);
      const mockGetChildRowData = jest.fn().mockImplementation((dashboardDataAdapter as any).getChildRowData);
      jest.spyOn(dashboardDataAdapter as any, 'getChildRowData').mockImplementation(mockGetChildRowData);
      const expected = MOCK_TEMPUS_POOL.map(mockPool => mockGetChildRowData(mockPool, 'fantom'));

      expect((dashboardDataAdapter as any).getChildRows('fantom')).toEqual(expected);
      expect(getConfig.getChainConfig).toHaveBeenCalled();
      MOCK_TEMPUS_POOL.forEach((tempusPool, i) => {
        expect(dashboardDataAdapter['getChildRowData']).toHaveBeenNthCalledWith(i + 1, tempusPool, 'fantom');
      });
    });
  });

  describe('getChildRowData()', () => {
    test('returns an object with selected fields', () => {
      MOCK_TEMPUS_POOL.forEach(tempusPool => {
        expect(dashboardDataAdapter['getChildRowData'](tempusPool as TempusPool, 'fantom')).toEqual({
          id: tempusPool.address,
          parentId: `${tempusPool.backingToken}-fantom`,
          token: tempusPool.backingToken,
          tempusPool: tempusPool,
          supportedTokens: [tempusPool.backingToken, tempusPool.yieldBearingToken],
          startDate: new Date(tempusPool.startDate),
          maturityDate: new Date(tempusPool.maturityDate),
          chain: 'fantom',
        });
      });
    });
  });

  describe('getParentRows()', () => {
    test('returns parent rows from given child rows', () => {
      const childRows = [
        {
          parentId: 'ETH-ethereum',
          chain: 'ethereum',
          token: 'ETH',
          maturityDate: new Date(2022, 0, 1),
          tempusPool: {
            protocol: 'lido',
          },
        },
        {
          parentId: 'ETH-ethereum',
          chain: 'ethereum',
          token: 'ETH',
          maturityDate: new Date(2022, 3, 1),
          tempusPool: {
            protocol: 'lido',
          },
        },
        {
          parentId: 'ETH-ethereum',
          chain: 'ethereum',
          token: 'ETH',
          maturityDate: new Date(2022, 6, 1),
          tempusPool: {
            protocol: 'lido',
          },
        },
        {
          parentId: 'USDC-ethereum',
          chain: 'ethereum',
          token: 'USDC',
          maturityDate: new Date(2022, 0, 1),
          tempusPool: {
            protocol: 'rari',
          },
        },
        {
          parentId: 'USDC-ethereum',
          chain: 'ethereum',
          token: 'USDC',
          maturityDate: new Date(2022, 6, 1),
          tempusPool: {
            protocol: 'rari',
          },
        },
        {
          parentId: 'USDC-ethereum',
          chain: 'ethereum',
          token: 'USDC',
          maturityDate: new Date(2022, 0, 1),
          tempusPool: {
            protocol: 'yearn',
          },
        },
        {
          parentId: 'USDC-ethereum',
          chain: 'ethereum',
          token: 'USDC',
          maturityDate: new Date(2022, 3, 1),
          tempusPool: {
            protocol: 'yearn',
          },
        },
        {
          parentId: 'USDC-ethereum',
          chain: 'ethereum',
          token: 'USDC',
          maturityDate: new Date(2022, 6, 1),
          tempusPool: {
            protocol: 'yearn',
          },
        },
      ];
      const expected = [
        {
          id: 'ETH-ethereum',
          chain: 'ethereum',
          maturityRange: [new Date(2022, 0, 1), new Date(2022, 6, 1)],
          parentId: null,
          protocols: ['lido'],
          token: 'ETH',
        },
        {
          id: 'USDC-ethereum',
          chain: 'ethereum',
          maturityRange: [new Date(2022, 0, 1), new Date(2022, 6, 1)],
          parentId: null,
          protocols: ['rari', 'yearn'],
          token: 'USDC',
        },
      ];

      expect((dashboardDataAdapter as any).getParentRows(childRows)).toEqual(expected);
    });
  });

  describe('getChildParent()', () => {
    test('returns a row with matched parent ID', () => {
      const rowChild = { parentId: 'WILL_BE_MATCHED' };
      const rowParents = [
        {
          id: 'NOT_MATCHED_0',
        },
        {
          id: rowChild.parentId,
        },
        {
          id: 'NOT_MATCHED_1',
        },
        {
          id: 'NOT_MATCHED_2',
        },
      ];

      expect((dashboardDataAdapter as any).getChildParent(rowChild, rowParents)).toEqual(rowParents[1]);
    });

    test('test with no matches, returns undefined', () => {
      const rowChild = { parentId: 'WILL_BE_MATCHED' };
      const rowParents = [
        {
          id: 'NOT_MATCHED_0',
        },
        {
          id: 'NOT_MATCHED_1',
        },
        {
          id: 'NOT_MATCHED_2',
        },
        {
          id: 'NOT_MATCHED_3',
        },
      ];

      expect((dashboardDataAdapter as any).getChildParent(rowChild, rowParents)).toEqual(undefined);
    });
  });

  describe('getParentChildren()', () => {
    test('returns an array with matched parent ID', () => {
      const mockParentId = 'WILL_BE_MATCHED';
      const mockRowChilds = [
        {
          parentId: 'NOT_MATCHED_0',
        },
        {
          parentId: mockParentId,
        },
        {
          parentId: 'NOT_MATCHED_1',
        },
        {
          parentId: 'NOT_MATCHED_2',
        },
        {
          parentId: mockParentId,
        },
      ];

      expect((dashboardDataAdapter as any).getParentChildren(mockParentId, mockRowChilds)).toEqual([
        mockRowChilds[1],
        mockRowChilds[4],
      ]);
    });

    test('test with no matches, returns []', () => {
      const mockParentId = 'WILL_BE_MATCHED';
      const mockRowChilds = [
        {
          parentId: 'NOT_MATCHED_0',
        },
        {
          parentId: 'NOT_MATCHED_1',
        },
        {
          parentId: 'NOT_MATCHED_2',
        },
        {
          parentId: 'NOT_MATCHED_3',
        },
      ];

      expect((dashboardDataAdapter as any).getParentChildren(mockParentId, mockRowChilds)).toEqual([]);
    });
  });
});
