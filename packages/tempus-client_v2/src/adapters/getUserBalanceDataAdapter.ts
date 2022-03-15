import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import getDefaultProvider from '../services/getDefaultProvider';
import getERC20TokenService from '../services/getERC20TokenService';
import getStatisticsService from '../services/getStatisticsService';
import getTempusPoolService from '../services/getTempusPoolService';
import { Chain } from '../interfaces/Chain';
import UserBalanceDataAdapter from './UserBalanceDataAdapter';

let userBalanceDataAdapters = new Map<Chain, UserBalanceDataAdapter>();
const getUserBalanceDataAdapter = (
  chain: Chain,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): UserBalanceDataAdapter => {
  if (!userBalanceDataAdapters.get(chain)) {
    const userBalanceDataAdapter = new UserBalanceDataAdapter();
    userBalanceDataAdapter.init({
      chain,
      signerOrProvider: getDefaultProvider(chain),
      statisticsService: getStatisticsService(chain),
      tempusPoolService: getTempusPoolService(chain),
      eRC20TokenServiceGetter: getERC20TokenService,
    });
    userBalanceDataAdapters.set(chain, userBalanceDataAdapter);
  }

  const userBalanceDataAdapter = userBalanceDataAdapters.get(chain);
  if (!userBalanceDataAdapter) {
    throw new Error(`Failed to get UserBalanceDataAdapter for ${chain} chain!`);
  }

  if (signerOrProvider) {
    userBalanceDataAdapter.init({
      chain,
      signerOrProvider: signerOrProvider,
      statisticsService: getStatisticsService(chain, signerOrProvider),
      tempusPoolService: getTempusPoolService(chain, signerOrProvider),
      eRC20TokenServiceGetter: getERC20TokenService,
    });
  }

  return userBalanceDataAdapter;
};

export default getUserBalanceDataAdapter;
