import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import getDefaultProvider from '../services/getDefaultProvider';
import DashboardDataAdapter from './DashboardDataAdapter';

let dashboardDataAdapter: DashboardDataAdapter;
const getDashboardDataAdapter = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): DashboardDataAdapter => {
  if (!dashboardDataAdapter) {
    dashboardDataAdapter = new DashboardDataAdapter();
    dashboardDataAdapter.init({
      signerOrProvider: getDefaultProvider(),
    });
  }

  if (signerOrProvider) {
    dashboardDataAdapter.init({
      signerOrProvider: signerOrProvider,
    });
  }

  return dashboardDataAdapter;
};

export default getDashboardDataAdapter;
