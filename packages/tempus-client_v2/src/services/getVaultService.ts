import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import VaultABI from '../abi/Vault.json';
import VaultService from './VaultService';
import getDefaultProvider from './getDefaultProvider';
import { getNetworkConfig } from '../utils/getConfig';
import getTempusAMMService from '../../../tempus-client_v2/src/services/getTempusAMMService';
import { Chain } from '../interfaces/Chain';

let vaultServices = new Map<Chain, VaultService>();
const getVaultService = (chain: Chain, signerOrProvider?: JsonRpcSigner | JsonRpcProvider): VaultService => {
  if (!vaultServices.get(chain)) {
    const vaultService = new VaultService();
    vaultService.init({
      Contract: Contract,
      address: getNetworkConfig(chain).vaultContract,
      abi: VaultABI,
      signerOrProvider: getDefaultProvider(chain),
      tempusAMMService: getTempusAMMService(chain),
      chain: chain,
    });
    vaultServices.set(chain, vaultService);
  }

  const vaultService = vaultServices.get(chain);
  if (!vaultService) {
    throw new Error(`Failed to get VaultService for ${chain} network!`);
  }

  if (signerOrProvider) {
    vaultService.init({
      Contract: Contract,
      address: getNetworkConfig(chain).vaultContract,
      abi: VaultABI,
      signerOrProvider,
      tempusAMMService: getTempusAMMService(chain, signerOrProvider),
      chain: chain,
    });
  }

  return vaultService;
};

export default getVaultService;
