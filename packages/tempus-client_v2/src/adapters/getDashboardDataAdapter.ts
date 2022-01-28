import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import getStatisticsService from '../services/getStatisticsService';
import { Chain } from '../interfaces/Chain';
import DashboardDataAdapter from './DashboardDataAdapter';

let dashboardDataAdapters = new Map<Chain, DashboardDataAdapter>();
const getDashboardDataAdapter = (
  chain: Chain,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): DashboardDataAdapter => {
  if (!dashboardDataAdapters.get(chain)) {
    const dashboardDataAdapter = new DashboardDataAdapter();
    dashboardDataAdapter.init({
      statisticsService: getStatisticsService(chain),
    });
    dashboardDataAdapters.set(chain, dashboardDataAdapter);
  }

  const dashboardDataAdapter = dashboardDataAdapters.get(chain);
  if (!dashboardDataAdapter) {
    throw new Error(`Failed to get DashboardDataAdapter for ${chain} chain!`);
  }

  if (signerOrProvider) {
    dashboardDataAdapter.init({
      statisticsService: getStatisticsService(chain, signerOrProvider),
    });
  }

  return dashboardDataAdapter;
};

export default getDashboardDataAdapter;
