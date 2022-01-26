import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import { Vaults as RariVault } from 'rari-sdk';
import VariableRateService from './VariableRateService';
import getTempusPoolService from '../services/getTempusPoolService';
import getTempusAMMService from '../services/getTempusAMMService';
import getVaultService from '../services/getVaultService';
import { getNetworkConfig } from '../utils/getConfig';
import getProvider from '../utils/getProvider';
import { Networks } from '../state/NetworkState';

let variableRateService: VariableRateService;
let actualSignerOrProvider: JsonRpcSigner | JsonRpcProvider;
const getVariableRateService = (
  network: Networks,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): VariableRateService => {
  if (!variableRateService) {
    variableRateService = new VariableRateService();
  }

  if (signerOrProvider !== undefined && signerOrProvider !== actualSignerOrProvider) {
    actualSignerOrProvider = signerOrProvider;
    variableRateService.init(
      actualSignerOrProvider,
      getTempusPoolService(network, actualSignerOrProvider),
      getVaultService(network, actualSignerOrProvider),
      getTempusAMMService(network, actualSignerOrProvider),
      new RariVault(getProvider(signerOrProvider) as any),
      getNetworkConfig(network),
    );
  }

  return variableRateService;
};

export default getVariableRateService;
