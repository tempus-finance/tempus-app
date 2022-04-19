import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { Chain, ChainConfig } from '../interfaces';
import { getTempusPoolService } from './getTempusPoolService';
import { TempusPoolService } from './TempusPoolService';

interface Services {
  poolService: TempusPoolService;
}

let services: Services | null;

export const getServices = (
  chain: Chain,
  getChainConfig: (chain: Chain) => ChainConfig,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): Services => {
  if (!services) {
    services = {
      poolService: getTempusPoolService(chain, getChainConfig),
    };
  }

  if (signerOrProvider) {
    services = {
      poolService: getTempusPoolService(chain, getChainConfig, signerOrProvider),
    };
  }

  return services;
};
