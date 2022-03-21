import { Contract } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Chain, getDefaultProvider, getTempusAMMService } from 'tempus-core-services';
import VaultABI from '../abi/Vault.json';
import VaultService from './VaultService';
import { getChainConfig } from '../utils/getConfig';

let vaultServices = new Map<Chain, VaultService>();
const getVaultService = (chain: Chain, signerOrProvider?: JsonRpcSigner): VaultService => {
  if (!vaultServices.get(chain)) {
    const vaultService = new VaultService();
    vaultService.init({
      Contract: Contract,
      address: getChainConfig(chain).vaultContract,
      abi: VaultABI,
      signerOrProvider: getDefaultProvider(chain, getChainConfig),
      tempusAMMService: getTempusAMMService(chain, getChainConfig),
      chain,
    });
    vaultServices.set(chain, vaultService);
  }

  const vaultService = vaultServices.get(chain);
  if (!vaultService) {
    throw new Error(`Failed to get VaultService for ${chain} chain!`);
  }

  if (signerOrProvider) {
    vaultService.init({
      Contract: Contract,
      address: getChainConfig(chain).vaultContract,
      abi: VaultABI,
      signerOrProvider,
      tempusAMMService: getTempusAMMService(chain, getChainConfig, signerOrProvider),
      chain,
    });
  }

  return vaultService;
};

export default getVaultService;
