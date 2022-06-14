import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import TempusControllerABI from '../abi/TempusControllerV1ABI.json';
import { Chain, ChainConfig } from '../interfaces';
import { getDefaultProvider } from './getDefaultProvider';
import { getTempusAMMService } from './getTempusAMMService';
import { TempusControllerService } from './TempusControllerService';

let tempusControllerServices = new Map<Chain, TempusControllerService>();
export const getTempusControllerService = (
  chain: Chain,
  getChainConfig: (chain: Chain) => ChainConfig,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): TempusControllerService => {
  if (!tempusControllerServices.get(chain)) {
    const tempusControllerService = new TempusControllerService();
    tempusControllerService.init({
      Contract: Contract,
      address: getChainConfig(chain).tempusControllerContract,
      abi: TempusControllerABI,
      signerOrProvider: getDefaultProvider(chain),
      tempusAMMService: getTempusAMMService(chain, getChainConfig),
      chain,
      getChainConfig,
    });
    tempusControllerServices.set(chain, tempusControllerService);
  }

  const tempusControllerService = tempusControllerServices.get(chain);
  if (!tempusControllerService) {
    throw new Error(`Failed to get TempusControllerService for ${chain} chain!`);
  }

  if (signerOrProvider) {
    tempusControllerService.init({
      Contract: Contract,
      address: getChainConfig(chain).tempusControllerContract,
      abi: TempusControllerABI,
      signerOrProvider: signerOrProvider,
      tempusAMMService: getTempusAMMService(chain, getChainConfig, signerOrProvider),
      chain,
      getChainConfig,
    });
  }

  return tempusControllerService;
};
