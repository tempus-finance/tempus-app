import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import VaultABI from '../abi/Vault.json';
import VaultService from './VaultService';
import getDefaultProvider from './getDefaultProvider';
import { getNetworkConfig } from '../utils/getConfig';
import getTempusAMMService from '../../../tempus-client_v2/src/services/getTempusAMMService';
import { Networks } from '../state/NetworkState';

let vaultService: VaultService;
const getVaultService = (network: Networks, signerOrProvider?: JsonRpcSigner | JsonRpcProvider): VaultService => {
  if (!vaultService) {
    vaultService = new VaultService();
    vaultService.init({
      Contract: Contract,
      address: getNetworkConfig(network).vaultContract,
      abi: VaultABI,
      signerOrProvider: getDefaultProvider(network),
      tempusAMMService: getTempusAMMService(network),
      network,
    });
  }

  if (signerOrProvider) {
    vaultService.init({
      Contract: Contract,
      address: getNetworkConfig(network).vaultContract,
      abi: VaultABI,
      signerOrProvider,
      tempusAMMService: getTempusAMMService(network, signerOrProvider),
      network,
    });
  }

  return vaultService;
};

export default getVaultService;
