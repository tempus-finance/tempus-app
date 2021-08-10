// External libraries
import { ethers } from 'ethers';

// Adapters
import TVLChartDataAdapter from './TVLChartDataAdapter';

jest.mock('ethers');
const { Contract } = jest.requireMock('ethers');
const { BigNumber } = jest.requireActual('ethers');

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

let instance: TVLChartDataAdapter;
let mockProvider = new JsonRpcProvider();

describe('generateChartData()', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Contract.mockImplementation(() => {
      return {};
    });

    // TODO - Find a better way to mock private members of a class
    (TVLChartDataAdapter.prototype as any).fetchDataPointBlocks = jest.fn().mockImplementation(() => {
      return [
        {
          timestamp: 1,
          number: 1,
        },
        {
          timestamp: 2,
          number: 2,
        },
      ];
    });
    (TVLChartDataAdapter.prototype as any).getTempusTotalTVL = jest.fn().mockImplementation(() => {
      return BigNumber.from('100');
    });
    ethers.utils.formatEther = jest.fn().mockImplementation((value: number) => {
      return value;
    });

    instance = new TVLChartDataAdapter();
    instance.init(mockProvider);
  });

  test('it returns an array of data points for past 2 days', async () => {
    const chartData = await instance.generateChartData();

    expect(chartData.length).toBe(2);
    expect(chartData[0].value).toBe(100);
    expect(chartData[0].valueIncrease).toBe(0);
  });
});
