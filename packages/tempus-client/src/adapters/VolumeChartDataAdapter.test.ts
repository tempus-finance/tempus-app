import VolumeChartDataAdapter from './VolumeChartDataAdapter';

jest.mock('ethers');
const { Contract } = jest.requireMock('ethers');

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

// Adding any here so that I can mock private functions - there doesn't seem to by any other way to do so.
let instance: any;
let spyFetchData: any;
let spyGetChartDataPoint: any;
let mockProvider = new JsonRpcProvider();

describe('generateChartData()', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Contract.mockImplementation(() => {
      return {};
    });

    instance = new VolumeChartDataAdapter();
    spyFetchData = jest.spyOn(instance, 'fetchData').mockImplementation(() => {});
    spyGetChartDataPoint = jest.spyOn(instance, 'getChartDataPoint').mockImplementation(() => {
      return {
        value: 100,
        date: new Date(1629180909484),
        valueIncrease: 50,
      };
    });

    instance.init(mockProvider);
  });

  test('it returns an array of data points for past 2 days', async () => {
    const chartData = await instance.generateChartData();

    expect(spyFetchData).toHaveBeenCalledTimes(1);
    expect(spyGetChartDataPoint).toHaveBeenCalledTimes(30);

    expect(chartData.length).toBe(30);
    expect(chartData[0].value).toBe(100);
    expect(chartData[0].date).toBeInstanceOf(Date);
    expect(chartData[0].date.getFullYear()).toBe(2021);
    expect(chartData[0].date.getMonth()).toBe(7);
    expect(chartData[0].date.getUTCDate()).toBe(17);
    expect(chartData[0].valueIncrease).toBe(50);
  });
});
