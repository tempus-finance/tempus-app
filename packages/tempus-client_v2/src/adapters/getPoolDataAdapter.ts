import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import getDefaultProvider from '../services/getDefaultProvider';
import getERC20TokenService from '../services/getERC20TokenService';
import getStatisticsService from '../services/getStatisticsService';
import getTempusAMMService from '../services/getTempusAMMService';
import getTempusControllerService from '../services/getTempusControllerService';
import getTempusPoolService from '../services/getTempusPoolService';
import getVaultService from '../services/getVaultService';
import { Networks } from '../state/NetworkState';
import PoolDataAdapter from './PoolDataAdapter';

let poolDataAdapter: PoolDataAdapter;
const getPoolDataAdapter = (network: Networks, signerOrProvider?: JsonRpcSigner | JsonRpcProvider): PoolDataAdapter => {
  if (!poolDataAdapter) {
    poolDataAdapter = new PoolDataAdapter();
    poolDataAdapter.init({
      tempusControllerService: getTempusControllerService(network, getDefaultProvider(network)),
      tempusPoolService: getTempusPoolService(network, getDefaultProvider(network)),
      statisticService: getStatisticsService(network, getDefaultProvider(network)),
      tempusAMMService: getTempusAMMService(network, getDefaultProvider(network)),
      vaultService: getVaultService(network, getDefaultProvider(network)),
      network,
      eRC20TokenServiceGetter: getERC20TokenService,
    });
  }

  if (signerOrProvider) {
    poolDataAdapter.init({
      tempusControllerService: getTempusControllerService(network, signerOrProvider),
      tempusPoolService: getTempusPoolService(network, signerOrProvider),
      statisticService: getStatisticsService(network, signerOrProvider),
      tempusAMMService: getTempusAMMService(network, signerOrProvider),
      vaultService: getVaultService(network, signerOrProvider),
      network,
      eRC20TokenServiceGetter: getERC20TokenService,
    });
  }

  return poolDataAdapter;
};

export default getPoolDataAdapter;
