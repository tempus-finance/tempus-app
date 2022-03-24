import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import {
  Chain,
  getDefaultProvider,
  getERC20TokenService,
  getTempusPoolService,
  getStatisticsService,
} from 'tempus-core-services';
import { getChainConfig, getConfig } from '../utils/getConfig';
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
      signerOrProvider: getDefaultProvider(chain, getChainConfig),
      statisticsService: getStatisticsService(chain, getConfig, getChainConfig),
      tempusPoolService: getTempusPoolService(chain, getChainConfig),
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
      statisticsService: getStatisticsService(chain, getConfig, getChainConfig, signerOrProvider),
      tempusPoolService: getTempusPoolService(chain, getChainConfig, signerOrProvider),
      eRC20TokenServiceGetter: getERC20TokenService,
    });
  }

  return userBalanceDataAdapter;
};

export default getUserBalanceDataAdapter;
