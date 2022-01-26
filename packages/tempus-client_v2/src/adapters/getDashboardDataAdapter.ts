import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import getStatisticsService from '../services/getStatisticsService';
import { Networks } from '../state/NetworkState';
import DashboardDataAdapter from './DashboardDataAdapter';

let dashboardDataAdapter: DashboardDataAdapter;
const getDashboardDataAdapter = (
  network: Networks,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): DashboardDataAdapter => {
  if (!dashboardDataAdapter) {
    dashboardDataAdapter = new DashboardDataAdapter();
    dashboardDataAdapter.init({
      statisticsService: getStatisticsService(network),
    });
  }

  if (signerOrProvider) {
    dashboardDataAdapter.init({
      statisticsService: getStatisticsService(network, signerOrProvider),
    });
  }

  return dashboardDataAdapter;
};

export default getDashboardDataAdapter;
