import { Chain } from 'tempus-core-services';
import DashboardDataAdapter from './DashboardDataAdapter';

let dashboardDataAdapters = new Map<Chain | undefined, DashboardDataAdapter>();
const getDashboardDataAdapter = (chain?: Chain): DashboardDataAdapter => {
  if (!dashboardDataAdapters.get(chain)) {
    const dashboardDataAdapter = new DashboardDataAdapter();
    dashboardDataAdapters.set(chain, dashboardDataAdapter);
  }

  const dashboardDataAdapter = dashboardDataAdapters.get(chain);
  if (!dashboardDataAdapter) {
    throw new Error(`Failed to get DashboardDataAdapter for ${chain} chain!`);
  }

  return dashboardDataAdapter;
};

export default getDashboardDataAdapter;
