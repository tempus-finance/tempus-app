import getDashboardDataService from './getDashboardDataAdapter';
import DashboardDataAdapter from './DashboardDataAdapter';

jest.mock('ethers');
const { Contract } = jest.requireMock('ethers');

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

// Adding any here so that I can mock private functions - there doesn't seem to by any other way to do so.
let instance: any;
let spyGetChildRows: any;
let spyGetParentRows: any;

let mockProvider = new JsonRpcProvider();

describe('DashboardDataAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Contract.mockImplementation(() => {
      return {};
    });

    instance = new DashboardDataAdapter();
    spyGetChildRows = jest.spyOn(instance, 'getChildRows').mockImplementation(() => {
      return [
        {
          id: 'test-child-row-id',
        },
      ];
    });
    spyGetParentRows = jest.spyOn(instance, 'getParentRows').mockImplementation(() => {
      return [
        {
          id: 'test-parent-row-id',
        },
      ];
    });

    instance.init(mockProvider);
  });

  describe('getDashboardDataAdapter()', () => {
    test('returns a not null DashboardDataAdapter instance', () => {
      const instance: DashboardDataAdapter = getDashboardDataService();

      expect(instance).toBeInstanceOf(DashboardDataAdapter);
      expect(instance).not.toBe(null);
    });
  });

  describe('getRows()', () => {
    test('returns an Array of rows ', async () => {
      const rows = await instance.getRows();

      expect(spyGetChildRows).toHaveBeenCalledTimes(1);
      expect(spyGetParentRows).toHaveBeenCalledTimes(1);

      expect(Array.isArray(rows)).toBe(true);
      expect(rows[0].id).toBe('test-parent-row-id');
      expect(rows[1].id).toBe('test-child-row-id');
    });
  });
});
