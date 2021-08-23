import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import getDefaultProvider from '../services/getDefaultProvider';
import DashboardDataAdapter from './DashboardDataAdapter';

let dashboardDataAdapter: DashboardDataAdapter;
const getDashboardDataAdapter = (
  userWalletAddress: string,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): DashboardDataAdapter => {
  if (!dashboardDataAdapter) {
    dashboardDataAdapter = new DashboardDataAdapter();
    dashboardDataAdapter.init({
      signerOrProvider: getDefaultProvider(),
      userWalletAddress: userWalletAddress,
    });
  }

  if (signerOrProvider) {
    dashboardDataAdapter.init({
      signerOrProvider: signerOrProvider,
      userWalletAddress: userWalletAddress,
    });
  }

  return dashboardDataAdapter;
};

export default getDashboardDataAdapter;
