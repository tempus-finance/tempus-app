import { DashboardRow } from '../interfaces';
import { mockData } from './mockdata';

export default class DashboardDataService {
  getRows(): DashboardRow[] {
    const data = this.getData();

    // TODO: convert pools to DashboardRow
    const rows: DashboardRow[] = [...data];

    return rows;
  }

  private getData(): any[] {
    // TODO: retrieve pools
    return mockData;
  }
}
