import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import getDefaultProvider from '../services/getDefaultProvider';
import getERC20TokenService from '../services/getERC20TokenService';
import getStatisticsService from '../services/getStatisticsService';
import getTempusAMMService from '../services/getTempusAMMService';
import getTempusControllerService from '../services/getTempusControllerService';
import getTempusPoolService from '../services/getTempusPoolService';
import getVaultService from '../services/getVaultService';
import PoolDataAdapter from './PoolDataAdapter';

let poolDataAdapter: PoolDataAdapter;
const getPoolDataAdapter = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): PoolDataAdapter => {
  if (!poolDataAdapter) {
    poolDataAdapter = new PoolDataAdapter();
    poolDataAdapter.init({
      tempusControllerService: getTempusControllerService(getDefaultProvider()),
      tempusPoolService: getTempusPoolService(getDefaultProvider()),
      statisticService: getStatisticsService(getDefaultProvider()),
      tempusAMMService: getTempusAMMService(getDefaultProvider()),
      vaultService: getVaultService(getDefaultProvider()),
      eRC20TokenServiceGetter: getERC20TokenService,
    });
  }

  if (signerOrProvider) {
    poolDataAdapter.init({
      tempusControllerService: getTempusControllerService(signerOrProvider),
      tempusPoolService: getTempusPoolService(signerOrProvider),
      statisticService: getStatisticsService(signerOrProvider),
      tempusAMMService: getTempusAMMService(signerOrProvider),
      vaultService: getVaultService(signerOrProvider),
      eRC20TokenServiceGetter: getERC20TokenService,
    });
  }

  return poolDataAdapter;
};

export default getPoolDataAdapter;
