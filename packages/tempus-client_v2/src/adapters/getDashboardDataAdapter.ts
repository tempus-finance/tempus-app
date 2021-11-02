import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import getStatisticsService from '../services/getStatisticsService';
import DashboardDataAdapter from './DashboardDataAdapter';

let dashboardDataAdapter: DashboardDataAdapter;
const getDashboardDataAdapter = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): DashboardDataAdapter => {
  if (!dashboardDataAdapter) {
    dashboardDataAdapter = new DashboardDataAdapter();
    dashboardDataAdapter.init({
      statisticsService: getStatisticsService(),
    });
  }

  if (signerOrProvider) {
    dashboardDataAdapter.init({
      statisticsService: getStatisticsService(signerOrProvider),
    });
  }

  return dashboardDataAdapter;
};

export default getDashboardDataAdapter;
