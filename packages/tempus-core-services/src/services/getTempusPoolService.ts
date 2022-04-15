import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import TempusPoolABI from '../abi/TempusPool.json';
import { Chain, ChainConfig, TempusPool } from '../interfaces';
import { TempusPoolService } from './TempusPoolService';
import { getDefaultProvider } from './getDefaultProvider';
import { getERC20TokenService } from './getERC20TokenService';

const tempusPoolServices = new Map<Chain, TempusPoolService>();
export const getTempusPoolService = (
  chain: Chain,
  getChainConfig: (chain: Chain) => ChainConfig,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): TempusPoolService => {
  if (!tempusPoolServices.get(chain)) {
    const defaultProvider = getDefaultProvider(chain, getChainConfig);

    const tempusPoolService = new TempusPoolService();
    tempusPoolService.init({
      Contract,
      tempusPoolAddresses: getChainConfig(chain).tempusPools.map((tempusPool: TempusPool) => tempusPool.address),
      TempusPoolABI,
      signerOrProvider: defaultProvider,
      eRC20TokenServiceGetter: getERC20TokenService,
      chain,
      getChainConfig,
    });
    tempusPoolServices.set(chain, tempusPoolService);
  }

  const tempusPoolService = tempusPoolServices.get(chain);
  if (!tempusPoolService) {
    throw new Error(`Failed to get TempusPoolService for ${chain} chain!`);
  }

  if (signerOrProvider) {
    tempusPoolService.init({
      Contract,
      tempusPoolAddresses: getChainConfig(chain).tempusPools.map((tempusPool: TempusPool) => tempusPool.address),
      TempusPoolABI,
      signerOrProvider,
      eRC20TokenServiceGetter: getERC20TokenService,
      chain,
      getChainConfig,
    });
  }

  return tempusPoolService;
};
