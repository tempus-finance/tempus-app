import getDashboardDataService from './getDashboardDataService';
import DashboardDataService from './DashboardDataService';

describe('DashboardDataService', () => {
  describe('getDashboardDataService()', () => {
    test('returns a not null DashboardDataService instance', () => {
      const instance: DashboardDataService = getDashboardDataService();
      expect(instance).not.toBe(null);
    });
  });

  describe('getRows()', () => {
    test('returns an Array of rows ', () => {
      const instance: DashboardDataService = getDashboardDataService();
      const rows = instance.getRows();
      expect(Array.isArray(rows)).toBe(true);
    });
  });
});
