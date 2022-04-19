import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { getDefaultProvider } from './getDefaultProvider';
import { Chain, ChainConfig } from '../interfaces';
import TempusAMMABI from '../abi/TempusAMM';
import { TempusAMMService } from './TempusAMMService';

const tempusAMMServices = new Map<Chain, TempusAMMService>();
export const getTempusAMMService = (
  chain: Chain,
  getChainConfig: (chain: Chain) => ChainConfig,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): TempusAMMService => {
  if (!tempusAMMServices.get(chain)) {
    const tempusAMMService = new TempusAMMService();
    tempusAMMService.init({
      Contract,
      tempusAMMAddresses: getChainConfig(chain).tempusPools.map(tempusPoolConfig => tempusPoolConfig.ammAddress),
      TempusAMMABI,
      signerOrProvider: getDefaultProvider(chain, getChainConfig),
      chain,
      getChainConfig,
    });
    tempusAMMServices.set(chain, tempusAMMService);
  }

  const tempusAMMService = tempusAMMServices.get(chain);
  if (!tempusAMMService) {
    throw new Error(`Failed to get TempusAMMService for ${chain} chain!`);
  }

  if (signerOrProvider) {
    tempusAMMService.init({
      Contract,
      tempusAMMAddresses: getChainConfig(chain).tempusPools.map(tempusPoolConfig => tempusPoolConfig.ammAddress),
      TempusAMMABI,
      signerOrProvider,
      chain,
      getChainConfig,
    });
  }

  return tempusAMMService;
};
