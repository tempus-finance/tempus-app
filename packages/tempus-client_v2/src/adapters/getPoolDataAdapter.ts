import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import getDefaultProvider from '../services/getDefaultProvider';
import getERC20TokenService from '../services/getERC20TokenService';
import getStatisticsService from '../services/getStatisticsService';
import getTempusAMMService from '../services/getTempusAMMService';
import getTempusControllerService from '../services/getTempusControllerService';
import getTempusPoolService from '../services/getTempusPoolService';
import getVaultService from '../services/getVaultService';
import { Chain } from '../interfaces/Chain';
import PoolDataAdapter from './PoolDataAdapter';

let poolDataAdapters = new Map<Chain, PoolDataAdapter>();
const getPoolDataAdapter = (chain: Chain, signerOrProvider?: JsonRpcSigner | JsonRpcProvider): PoolDataAdapter => {
  if (!poolDataAdapters.get(chain)) {
    const poolDataAdapter = new PoolDataAdapter();
    poolDataAdapter.init({
      tempusControllerService: getTempusControllerService(chain, getDefaultProvider(chain)),
      tempusPoolService: getTempusPoolService(chain, getDefaultProvider(chain)),
      statisticService: getStatisticsService(chain, getDefaultProvider(chain)),
      tempusAMMService: getTempusAMMService(chain, getDefaultProvider(chain)),
      vaultService: getVaultService(chain, getDefaultProvider(chain)),
      chain: chain,
      eRC20TokenServiceGetter: getERC20TokenService,
    });
    poolDataAdapters.set(chain, poolDataAdapter);
  }

  const poolDataAdapter = poolDataAdapters.get(chain);
  if (!poolDataAdapter) {
    throw new Error(`Failed to get PoolDataAdapter for ${chain} network!`);
  }

  if (signerOrProvider) {
    poolDataAdapter.init({
      tempusControllerService: getTempusControllerService(chain, signerOrProvider),
      tempusPoolService: getTempusPoolService(chain, signerOrProvider),
      statisticService: getStatisticsService(chain, signerOrProvider),
      tempusAMMService: getTempusAMMService(chain, signerOrProvider),
      vaultService: getVaultService(chain, signerOrProvider),
      chain: chain,
      eRC20TokenServiceGetter: getERC20TokenService,
    });
  }

  return poolDataAdapter;
};

export default getPoolDataAdapter;
