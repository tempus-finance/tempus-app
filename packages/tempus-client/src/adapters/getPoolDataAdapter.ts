import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import getERC20TokenService from '../services/getERC20TokenService';
import getStatisticsService from '../services/getStatisticsService';
import getTempusAMMService from '../services/getTempusAMMService';
import getTempusControllerService from '../services/getTempusControllerService';
import getTempusPoolService from '../services/getTempusPoolService';
import getVaultService from '../services/getVaultService';
import getConfig from '../utils/get-config';
import PoolDataAdapter from './PoolDataAdapter';

let poolDataAdapter: PoolDataAdapter;
let actualSignerOrProvider: JsonRpcSigner | JsonRpcProvider;
const getPoolDataAdapter = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): PoolDataAdapter => {
  if (!poolDataAdapter) {
    poolDataAdapter = new PoolDataAdapter();
  }

  if (signerOrProvider !== undefined && signerOrProvider !== actualSignerOrProvider) {
    actualSignerOrProvider = signerOrProvider;
    poolDataAdapter.init({
      tempusControllerAddress: getConfig().tempusControllerContract,
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
