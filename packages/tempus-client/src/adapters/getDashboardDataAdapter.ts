import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import getDefaultProvider from '../services/getDefaultProvider';
import getERC20TokenService from '../services/getERC20TokenService';
import getStatisticsService from '../services/getStatisticsService';
import getTempusAMMService from '../services/getTempusAMMService';
import getTempusPoolService from '../services/getTempusPoolService';
import DashboardDataAdapter from './DashboardDataAdapter';

let dashboardDataAdapter: DashboardDataAdapter;
const getDashboardDataAdapter = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): DashboardDataAdapter => {
  if (!dashboardDataAdapter) {
    dashboardDataAdapter = new DashboardDataAdapter();
    dashboardDataAdapter.init({
      signerOrProvider: getDefaultProvider(),
      eRC20TokenServiceGetter: getERC20TokenService,
      statisticsService: getStatisticsService(),
      tempusAMMService: getTempusAMMService(),
      tempusPoolService: getTempusPoolService(),
    });
  }

  if (signerOrProvider) {
    dashboardDataAdapter.init({
      signerOrProvider: signerOrProvider,
      eRC20TokenServiceGetter: getERC20TokenService,
      statisticsService: getStatisticsService(signerOrProvider),
      tempusAMMService: getTempusAMMService(signerOrProvider),
      tempusPoolService: getTempusPoolService(signerOrProvider),
    });
  }

  return dashboardDataAdapter;
};

export default getDashboardDataAdapter;
