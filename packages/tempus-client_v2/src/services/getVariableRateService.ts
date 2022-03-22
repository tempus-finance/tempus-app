import { JsonRpcSigner } from '@ethersproject/providers';
import { Vaults as RariVault } from 'rari-sdk';
import {
  Chain,
  getDefaultProvider,
  getProviderFromSignerOrProvider,
  getTempusAMMService,
  getTempusPoolService,
  getVaultService,
} from 'tempus-core-services';
import { getChainConfig } from '../utils/getConfig';
import VariableRateService from './VariableRateService';

let variableRateServices = new Map<Chain, VariableRateService>();
const getVariableRateService = (chain: Chain, signer?: JsonRpcSigner): VariableRateService => {
  if (!variableRateServices.get(chain)) {
    const variableRateService = new VariableRateService();
    variableRateService.init(
      getDefaultProvider(chain, getChainConfig),
      getTempusPoolService(chain, getChainConfig),
      getVaultService(chain, getChainConfig),
      getTempusAMMService(chain, getChainConfig),
      new RariVault(getDefaultProvider(chain, getChainConfig)),
      getChainConfig(chain),
    );
    variableRateServices.set(chain, variableRateService);
  }

  const variableRateService = variableRateServices.get(chain);
  if (!variableRateService) {
    throw new Error(`Failed to get VariableRateService for ${chain} chain!`);
  }

  if (signer) {
    variableRateService.init(
      signer,
      getTempusPoolService(chain, getChainConfig, signer),
      getVaultService(chain, getChainConfig, signer),
      getTempusAMMService(chain, getChainConfig, signer),
      new RariVault(getProviderFromSignerOrProvider(signer)),
      getChainConfig(chain),
    );
  }

  return variableRateService;
};

export default getVariableRateService;
