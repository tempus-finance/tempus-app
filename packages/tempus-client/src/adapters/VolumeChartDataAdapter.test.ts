import * as ejs from 'ethers';
import { SECONDS_IN_A_DAY } from '../constants';

import VolumeChartDataAdapter from './VolumeChartDataAdapter';

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

let instance: VolumeChartDataAdapter;

describe('generateChartData()', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    let mockProvider = new JsonRpcProvider();

    jest.spyOn(ejs as any, 'Contract').mockReturnValue({
      getPoolId: jest.fn(),
      queryFilter: jest.fn(),
      filters: {
        Deposited: jest.fn(),
        Redeemed: jest.fn(),
        Swap: jest.fn(),
      },
    });

    let mockGetBlock = jest.fn();
    for (let i = 0; i < 30; i++) {
      mockGetBlock = mockGetBlock.mockResolvedValueOnce({
        number: i,
        timestamp: Math.floor(new Date().getTime() / 1000) - SECONDS_IN_A_DAY * (i / 2),
      });
    }

    const mockGetTempusControllerService = jest.fn().mockImplementation(() => {
      return {
        getDepositedEvents: jest.fn().mockResolvedValue([
          {
            name: 'd-event-1',
            blockNumber: 0,
            args: {
              depositor: 'depositor-1',
              pool: 'pool-1',
              backingTokenValue: ejs.utils.parseEther('20'),
            },
            getBlock: mockGetBlock,
          },
          {
            name: 'd-event-2',
            blockNumber: 1,
            args: {
              depositor: 'depositor-1',
              pool: 'pool-1',
              backingTokenValue: ejs.utils.parseEther('25'),
            },
            getBlock: mockGetBlock,
          },
        ]),
        getRedeemedEvents: jest.fn().mockResolvedValue([
          {
            name: 'r-event-1',
            blockNumber: 5,
            args: {
              redeemer: 'redeemer-1',
              pool: 'pool-1',
              backingTokenValue: ejs.utils.parseEther('26'),
            },
            getBlock: mockGetBlock,
          },
          {
            name: 'r-event-2',
            blockNumber: 2,
            args: {
              redeemer: 'redeemer-2',
              pool: 'pool-1',
              backingTokenValue: ejs.utils.parseEther('500'),
            },
            getBlock: mockGetBlock,
          },
        ]),
      };
    });

    const mockGetVaultService = jest.fn().mockImplementation(() => {
      return {
        getSwapEvents: jest.fn().mockResolvedValue([
          {
            name: 's-event-1',
            blockNumber: 3,
            args: {
              tokenIn: 'principal-address',
              amountIn: ejs.utils.parseEther('5'),
            },
            getBlock: mockGetBlock,
          },
          {
            name: 's-event-2',
            blockNumber: 3,
            args: {
              tokenIn: 'principal-address',
              amountIn: ejs.utils.parseEther('3'),
            },
            getBlock: mockGetBlock,
          },
        ]),
      };
    });

    const mockGetTempusAMMService = jest.fn().mockImplementation(() => {
      return {
        getTempusPoolAddressFromId: jest.fn().mockResolvedValue('pool-1'),
      };
    });

    const mockGetTempusPoolService = jest.fn().mockImplementation(() => {
      return {
        getBackingTokenTicker: jest.fn().mockResolvedValue('dai'),
        getPrincipalsTokenAddress: jest.fn().mockResolvedValue('principal-address'),
      };
    });

    const mockGetStatisticsService = jest.fn().mockImplementation(() => {
      return {
        getRate: jest.fn().mockResolvedValue(ejs.ethers.utils.parseEther('2')),
      };
    });

    instance = new VolumeChartDataAdapter();
    instance.init({
      signerOrProvider: mockProvider,
      statisticsService: mockGetStatisticsService(),
      tempusAMMService: mockGetTempusAMMService(),
      tempusControllerService: mockGetTempusControllerService(),
      tempusPoolService: mockGetTempusPoolService(),
      vaultService: mockGetVaultService(),
    });
  });

  test('it returns an array of data points for past 30 days', async () => {
    const chartData = await instance.generateChartData();

    expect(chartData.length).toBe(30);

    expect(chartData[29].value).toBe('90.0');
    expect(chartData[28].value).toBe('1016.0');
    expect(chartData[27].value).toBe('52.0');
    expect(chartData[26].value).toBe('0.0');

    expect(Number(chartData[29].valueIncrease).toFixed(2)).toBe('-91.14');
    expect(Number(chartData[28].valueIncrease).toFixed(2)).toBe('1853.85');
    expect(Number(chartData[27].valueIncrease).toFixed(2)).toBe('0.00');
    expect(Number(chartData[26].valueIncrease).toFixed(2)).toBe('0.00');
  });
});
