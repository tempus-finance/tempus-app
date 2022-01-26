import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import getDefaultProvider from '../services/getDefaultProvider';
import getERC20TokenService from '../services/getERC20TokenService';
import getStatisticsService from '../services/getStatisticsService';
import getTempusPoolService from '../services/getTempusPoolService';
import { Networks } from '../state/NetworkState';
import UserBalanceDataAdapter from './UserBalanceDataAdapter';

let userBalanceDataAdapter: UserBalanceDataAdapter;
const getUserBalanceDataAdapter = (
  network: Networks,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): UserBalanceDataAdapter => {
  if (!userBalanceDataAdapter) {
    userBalanceDataAdapter = new UserBalanceDataAdapter();
    userBalanceDataAdapter.init({
      network,
      signerOrProvider: getDefaultProvider(network),
      statisticsService: getStatisticsService(network),
      tempusPoolService: getTempusPoolService(network),
      eRC20TokenServiceGetter: getERC20TokenService,
    });
  }

  if (signerOrProvider) {
    userBalanceDataAdapter.init({
      network,
      signerOrProvider: signerOrProvider,
      statisticsService: getStatisticsService(network, signerOrProvider),
      tempusPoolService: getTempusPoolService(network, signerOrProvider),
      eRC20TokenServiceGetter: getERC20TokenService,
    });
  }

  return userBalanceDataAdapter;
};

export default getUserBalanceDataAdapter;
