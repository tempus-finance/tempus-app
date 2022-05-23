import { Contract } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import VaultABI from '../abi/Vault.json';
import { ChainConfig, Chain } from '../interfaces';
import { getDefaultProvider } from './getDefaultProvider';
import { getTempusAMMService } from './getTempusAMMService';
import { VaultService } from './VaultService';

let vaultServices = new Map<Chain, VaultService>();
export const getVaultService = (
  chain: Chain,
  getChainConfig: (chain: Chain) => ChainConfig,
  signerOrProvider?: JsonRpcSigner,
): VaultService => {
  if (!vaultServices.get(chain)) {
    const vaultService = new VaultService();
    vaultService.init({
      Contract: Contract,
      address: getChainConfig(chain).vaultContract,
      abi: VaultABI,
      signerOrProvider: getDefaultProvider(chain),
      tempusAMMService: getTempusAMMService(chain, getChainConfig),
      chain,
      getChainConfig,
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
      getChainConfig,
    });
  }

  return vaultService;
};
