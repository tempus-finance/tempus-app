import * as eth from 'ethers';

import { aaveLendingPoolAddress, cEthAddress } from '../constants';
import getConfig from '../utils/get-config';
import VariableRate from './VariableRateService';

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

jest.mock('../services/TempusPoolService');
const TempusPoolService = jest.requireMock('../services/TempusPoolService').default;

jest.mock('../services/VaultService');
const VaultService = jest.requireMock('../services/VaultService').default;

jest.mock('../services/TempusAMMService');
const TempusAMMService = jest.requireMock('../services/TempusAMMService').default;

let instance: VariableRate;
const mockLiquidityRate = eth.BigNumber.from('123000000000000000000000000');
const mockGetReserveData = jest.fn();
const mockGetLastCompletedReportDelta = jest.fn();
const mockPostTotalPooledEther = eth.BigNumber.from('10000000');
const mockPreTotalPooledEther = eth.BigNumber.from('5000000');
const mockTimeElapsed = eth.BigNumber.from('3000000');
const mockBorrowRatePerBlock = jest.fn();

jest.spyOn(eth as any, 'Contract').mockImplementation((address: any) => {
  if (address === aaveLendingPoolAddress) {
    return {
      getReserveData: mockGetReserveData,
    };
  }

  if (address === cEthAddress) {
    return {
      borrowRatePerBlock: mockBorrowRatePerBlock,
    };
  }

  if (address === getConfig().lidoOracle) {
    return { getLastCompletedReportDelta: mockGetLastCompletedReportDelta };
  }

  return undefined;
});

describe('VariableRate', () => {
  describe('getAprFromApy', () => {
    [
      { apy: 1, periods: 1, expected: 1 },
      { apy: 1, periods: 2, expected: 0.99751242241779 },
      { apy: 1, periods: 4, expected: 0.9962717257284481 },
      { apy: 1, periods: 12, expected: 0.9954457372153946 },
      { apy: 1, periods: 52, expected: 0.9951282924321347 },
      { apy: 1, periods: 365, expected: 0.995046648326281 },
      { apy: 2, periods: 1, expected: 2 },
      { apy: 2, periods: 2, expected: 1.990098767241566 },
      { apy: 2, periods: 4, expected: 1.9851726292815286 },
      { apy: 2, periods: 12, expected: 1.981897562304269 },
      { apy: 2, periods: 52, expected: 1.9806398390715962 },
      { apy: 2, periods: 365, expected: 1.9803164489521352 },
      { apy: 3, periods: 1, expected: 3 },
      { apy: 3, periods: 2, expected: 2.9778313018443914 },
      { apy: 3, periods: 4, expected: 2.96682871109315 },
      { apy: 3, periods: 12, expected: 2.9595237267644237 },
      { apy: 3, periods: 52, expected: 2.9567205014291 },
      { apy: 3, periods: 365, expected: 2.955999915440932 },
    ].forEach(item => {
      test('returns the APR of `aave` protocol', async () => {
        const result = VariableRate.getAprFromApy(item.apy, item.periods);
        expect(result).toEqual(item.expected);
      });
    });
  });

  describe('getAprRate(', () => {
    const mockProvider = new JsonRpcProvider();
    const mockTempusPoolService = new TempusPoolService();
    const mockVaultService = new VaultService();
    const mockTempusAMMservice = new TempusAMMService();

    instance = new VariableRate();
    instance.init(mockProvider, mockTempusPoolService, mockVaultService, mockTempusAMMservice, getConfig());

    test('returns a valid instance', () => {
      expect(instance).toBeInstanceOf(VariableRate);
    });

    test('returns the APR of `aave` protocol', async () => {
      mockGetReserveData.mockImplementation(() => {
        return {
          currentLiquidityRate: mockLiquidityRate,
        };
      });

      const tempusPoolAddress = 'abc';
      const yieldBearingTokenAddress = 'ybt-address';
      const fees = eth.utils.parseEther('0.001');

      const apr = await instance.getAprRate('aave', tempusPoolAddress, yieldBearingTokenAddress, fees);
      expect(apr).toEqual(0.124);
    });

    xtest('returns the APR of `compound` protocol', async () => {
      mockBorrowRatePerBlock.mockImplementation(() => {
        return {
          call: jest.fn().mockReturnValue(200),
        };
      });

      const tempusPoolAddress = 'dfg';
      const yieldBearingTokenAddress = 'ybt-address';
      const fees = eth.utils.parseEther('0.001');

      const apr = await instance.getAprRate('compound', tempusPoolAddress, yieldBearingTokenAddress, fees);
      expect(apr).toEqual(0.48075880352207445);
    });

    test('returns the APR of `lido` protocol', async () => {
      mockGetLastCompletedReportDelta.mockImplementation(() => {
        return Promise.resolve({
          postTotalPooledEther: mockPostTotalPooledEther,
          preTotalPooledEther: mockPreTotalPooledEther,
          timeElapsed: mockTimeElapsed,
        });
      });

      const tempusPoolAddress = 'dfg';
      const yieldBearingTokenAddress = 'ybt-address';
      const fees = eth.utils.parseEther('0.001');

      const apr = await instance.getAprRate('lido', tempusPoolAddress, yieldBearingTokenAddress, fees);
      expect(apr).toEqual(10.513);
    });
  });
});
