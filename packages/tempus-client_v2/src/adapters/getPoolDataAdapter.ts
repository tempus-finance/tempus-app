import { JsonRpcSigner } from '@ethersproject/providers';
import {
  Chain,
  getDefaultProvider,
  getERC20TokenService,
  getTempusAMMService,
  getTempusControllerService,
  getTempusPoolService,
  getStatisticsService,
  getVaultService,
} from 'tempus-core-services';
import { getConfig, getChainConfig } from '../utils/getConfig';
import PoolDataAdapter from './PoolDataAdapter';

let poolDataAdapters = new Map<Chain, PoolDataAdapter>();
const getPoolDataAdapter = (chain: Chain, signerOrProvider?: JsonRpcSigner): PoolDataAdapter => {
  if (!poolDataAdapters.get(chain)) {
    const poolDataAdapter = new PoolDataAdapter();
    poolDataAdapter.init({
      tempusControllerService: getTempusControllerService(
        chain,
        getChainConfig,
        getDefaultProvider(chain, getChainConfig),
      ),
      tempusPoolService: getTempusPoolService(chain, getChainConfig, getDefaultProvider(chain, getChainConfig)),
      statisticService: getStatisticsService(
        chain,
        getConfig,
        getChainConfig,
        getDefaultProvider(chain, getChainConfig),
      ),
      tempusAMMService: getTempusAMMService(chain, getChainConfig, getDefaultProvider(chain, getChainConfig)),
      vaultService: getVaultService(chain, getChainConfig),
      chain,
      eRC20TokenServiceGetter: getERC20TokenService,
    });
    poolDataAdapters.set(chain, poolDataAdapter);
  }

  const poolDataAdapter = poolDataAdapters.get(chain);
  if (!poolDataAdapter) {
    throw new Error(`Failed to get PoolDataAdapter for ${chain} chain!`);
  }

  if (signerOrProvider) {
    poolDataAdapter.init({
      tempusControllerService: getTempusControllerService(chain, getChainConfig, signerOrProvider),
      tempusPoolService: getTempusPoolService(chain, getChainConfig, signerOrProvider),
      statisticService: getStatisticsService(chain, getConfig, getChainConfig, signerOrProvider),
      tempusAMMService: getTempusAMMService(chain, getChainConfig, signerOrProvider),
      vaultService: getVaultService(chain, getChainConfig, signerOrProvider),
      chain,
      eRC20TokenServiceGetter: getERC20TokenService,
    });
  }

  return poolDataAdapter;
};

export default getPoolDataAdapter;
