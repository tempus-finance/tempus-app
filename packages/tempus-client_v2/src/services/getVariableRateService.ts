import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import { Vaults as RariVault } from 'rari-sdk';
import getTempusPoolService from '../services/getTempusPoolService';
import getTempusAMMService from '../services/getTempusAMMService';
import getVaultService from '../services/getVaultService';
import { getChainConfig } from '../utils/getConfig';
import getProviderFromSignerOrProvider from '../utils/getProviderFromSignerOrProvider';
import { Chain } from '../interfaces/Chain';
import VariableRateService from './VariableRateService';

let variableRateServices = new Map<Chain, VariableRateService>();
let actualSignerOrProviders = new Map<Chain, JsonRpcSigner | JsonRpcProvider>();
const getVariableRateService = (
  chain: Chain,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): VariableRateService => {
  if (!variableRateServices.get(chain)) {
    variableRateServices.set(chain, new VariableRateService());
  }

  const variableRateService = variableRateServices.get(chain);
  if (!variableRateService) {
    throw new Error(`Failed to get VariableRateService for ${chain} chain!`);
  }

  const actualSignerOrProvider = actualSignerOrProviders.get(chain);

  if (signerOrProvider !== undefined && signerOrProvider !== actualSignerOrProvider) {
    actualSignerOrProviders.set(chain, signerOrProvider);

    let rariVault: RariVault | null = null;

    if (signerOrProvider instanceof JsonRpcSigner) {
      rariVault = new RariVault(getProviderFromSignerOrProvider(signerOrProvider) as any);
    }

    variableRateService.init(
      signerOrProvider,
      getTempusPoolService(chain, signerOrProvider),
      getVaultService(chain, signerOrProvider),
      getTempusAMMService(chain, signerOrProvider),
      getChainConfig(chain),
      rariVault,
    );
  }

  return variableRateService;
};

export default getVariableRateService;
