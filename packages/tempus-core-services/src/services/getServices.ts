import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { Chain, ChainConfig, Config } from '../interfaces';
import { getVariableRateService } from './getVariableRateService';
import { getTempusPoolService } from './getTempusPoolService';
import { getTempusControllerService } from './getTempusControllerService';
import { getStatisticsService } from './getStatisticsService';
import { getVaultService } from './getVaultService';
import { getStorageService } from './getStorageService';

type ServiceName =
  | 'TempusPoolService'
  | 'TempusControllerService'
  | 'StatisticsService'
  | 'VaultService'
  | 'VariableRateService'
  | 'StorageService';

type ServiceMap = { [key in ServiceName]?: any };

const serviceMap = new Map<Chain, ServiceMap>();

export const initServices = (
  chain: Chain,
  config: Config,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): void => {
  const getChainConfig = (selectedChain: Chain): ChainConfig => config[selectedChain];
  const getConfig = () => config;

  let services = {};

  if (signerOrProvider) {
    services = {
      TempusPoolService: getTempusPoolService(chain, getChainConfig, signerOrProvider),
      TempusControllerService: getTempusControllerService(chain, getChainConfig, signerOrProvider),
      StatisticsService: getStatisticsService(chain, getConfig, getChainConfig, signerOrProvider),
      VaultService: getVaultService(chain, getChainConfig, signerOrProvider as unknown as JsonRpcSigner),
      VariableRateService: getVariableRateService(chain, getChainConfig, signerOrProvider as unknown as JsonRpcSigner),
      StorageService: getStorageService(),
    };
  } else {
    services = {
      TempusPoolService: getTempusPoolService(chain, getChainConfig),
      TempusControllerService: getTempusControllerService(chain, getChainConfig),
      StatisticsService: getStatisticsService(chain, getConfig, getChainConfig),
      VaultService: getVaultService(chain, getChainConfig),
      VariableRateService: getVariableRateService(chain, getChainConfig),
      StorageService: getStorageService(),
    };
  }

  // TODO if the map has already a chain we should destroy the services
  serviceMap.set(chain, services);
};

export const getServices = (chain: Chain): ServiceMap | null =>
  serviceMap.has(chain) ? (serviceMap.get(chain) as ServiceMap) : null;
