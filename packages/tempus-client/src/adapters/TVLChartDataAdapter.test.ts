import * as ejs from 'ethers';
import * as ejsp from '@ethersproject/providers';
import getDefaultProvider from '../services/getDefaultProvider';
import TVLChartDataAdapter from './TVLChartDataAdapter';
import { SECONDS_IN_A_DAY } from '../constants';

describe('TVLChartDataAdapter', () => {
  let adapter: TVLChartDataAdapter;

  // 100 days ago
  const poolStartTime = Math.floor(Date.now() / 1000) - SECONDS_IN_A_DAY * 100;

  const mockGetBlock = jest.fn();
  const mockStartTime = jest.fn();
  const mockTotalValueLockedAtGivenRate = jest.fn();

  beforeEach(() => {
    mockGetBlock.mockImplementation((blockNumber: number | 'latest') => {
      if (blockNumber === 'latest') {
        return {
          number: 1000,
          timestamp: Math.floor(Date.now() / 1000),
        };
      } else {
        return {
          number: blockNumber,
          timestamp: Math.floor(Date.now() / 1000) - SECONDS_IN_A_DAY * 101,
        };
      }
    });
    mockStartTime.mockImplementation(() => {
      return ejs.BigNumber.from(poolStartTime);
    });
    mockTotalValueLockedAtGivenRate.mockImplementation(() => {
      return ejs.BigNumber.from(ejs.utils.parseEther('1000'));
    });

    jest.spyOn(ejs, 'Contract').mockImplementation(() => {
      return {
        startTime: mockStartTime,
        totalValueLockedAtGivenRate: mockTotalValueLockedAtGivenRate,
      };
    });

    jest.spyOn(ejsp, 'JsonRpcProvider').mockImplementation(() => {
      return {
        getBlock: mockGetBlock,
      };
    });

    adapter = new TVLChartDataAdapter();
    adapter.init({
      signerOrProvider: getDefaultProvider(),
    });
  });

  describe('init()', () => {
    test('it properly injects required services', () => {
      expect(adapter['statisticsService']).toBeDefined();
      expect(adapter['tempusPoolService']).toBeDefined();
    });
  });

  describe('generateChartData()', () => {
    test('returns generated chart data', async () => {
      const data = await adapter.generateChartData();

      expect(data).toBeDefined();
    });

    test('it returns generated data for last 30 days', async () => {
      const data = await adapter.generateChartData();

      expect(data.length).toBe(30);
    });

    test('it returns correct TVL for last day', async () => {
      const data = await adapter.generateChartData();

      expect(data[data.length - 1].value).toBe(1000);
    });

    test('it sorts result from oldest to newest', async () => {
      const data = await adapter.generateChartData();

      expect(data[data.length - 1].date.getTime() - data[0].date.getTime()).toBeGreaterThan(0);
    });

    test('it returns zero tvl for days before contract was deployed', async () => {
      const data = await adapter.generateChartData();

      expect(data[0].value).toBe(0);
    });

    test('it console logs the error and returns rejected promise if service is not initialized before use', async () => {
      const adapterUninitialized = new TVLChartDataAdapter();

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(adapterUninitialized.generateChartData()).rejects.toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Attempted to use TVLChartDataAdapter before initializing it.');
    });
  });
});
