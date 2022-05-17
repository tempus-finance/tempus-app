import { JsonRpcSigner } from '@ethersproject/providers';
import { Vaults as RariVault } from 'rari-sdk';
import { getDefaultProvider } from './getDefaultProvider';
import { getProviderFromSignerOrProvider } from '../utils';
import { getTempusAMMService } from './getTempusAMMService';
import { getTempusPoolService } from './getTempusPoolService';
import { getVaultService } from './getVaultService';
import { ChainConfig, Chain } from '../interfaces';
import { VariableRateService } from './VariableRateService';

let variableRateServices = new Map<Chain, VariableRateService>();
export const getVariableRateService = (
  chain: Chain,
  getChainConfig: (chain: Chain) => ChainConfig,
  signer?: JsonRpcSigner,
): VariableRateService => {
  if (!variableRateServices.get(chain)) {
    const variableRateService = new VariableRateService();
    variableRateService.init({
      signerOrProvider: getDefaultProvider(chain),
      tempusPoolService: getTempusPoolService(chain, getChainConfig),
      vaultService: getVaultService(chain, getChainConfig),
      tempusAMMService: getTempusAMMService(chain, getChainConfig),
      rariVault: new RariVault(getDefaultProvider(chain)),
      config: getChainConfig(chain),
      getChainConfig,
    });
    variableRateServices.set(chain, variableRateService);
  }

  const variableRateService = variableRateServices.get(chain);
  if (!variableRateService) {
    throw new Error(`Failed to get VariableRateService for ${chain} chain!`);
  }

  if (signer) {
    variableRateService.init({
      signerOrProvider: signer,
      tempusPoolService: getTempusPoolService(chain, getChainConfig, signer),
      vaultService: getVaultService(chain, getChainConfig, signer),
      tempusAMMService: getTempusAMMService(chain, getChainConfig, signer),
      rariVault: new RariVault(getProviderFromSignerOrProvider(signer)),
      config: getChainConfig(chain),
      getChainConfig,
    });
  }

  return variableRateService;
};
