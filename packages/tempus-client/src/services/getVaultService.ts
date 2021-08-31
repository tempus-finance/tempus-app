import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import VaultABI from '../abi/Vault.json';
import VaultService from './VaultService';
import getDefaultProvider from './getDefaultProvider';
import getConfig from '../utils/get-config';

let vaultService: VaultService;
const getVaultService = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): VaultService => {
  if (!vaultService) {
    vaultService = new VaultService();
    vaultService.init({
      Contract: Contract,
      address: getConfig().vaultContract,
      abi: VaultABI,
      signerOrProvider: getDefaultProvider(),
    });
  }

  if (signerOrProvider) {
    vaultService.init({
      Contract: Contract,
      address: getConfig().vaultContract,
      abi: VaultABI,
      signerOrProvider: signerOrProvider,
    });
  }

  return vaultService;
};

export default getVaultService;
