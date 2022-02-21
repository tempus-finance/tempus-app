import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

import TempusPoolABI from '../abi/TempusPool.json';
import { getChainConfig } from '../utils/getConfig';
import { Chain } from '../interfaces/Chain';
import TempusPoolService from './TempusPoolService';
import getDefaultProvider from './getDefaultProvider';
import getERC20TokenService from './getERC20TokenService';

let tempusPoolServices = new Map<Chain, TempusPoolService>();
const getTempusPoolService = (chain: Chain, signerOrProvider?: JsonRpcSigner | JsonRpcProvider) => {
  if (!tempusPoolServices.get(chain)) {
    const defaultProvider = getDefaultProvider(chain);

    const tempusPoolService = new TempusPoolService();
    tempusPoolService.init({
      Contract,
      tempusPoolAddresses: getChainConfig(chain).tempusPools.map(tempusPoolConfig => tempusPoolConfig.address),
      TempusPoolABI: TempusPoolABI,
      signerOrProvider: defaultProvider,
      eRC20TokenServiceGetter: getERC20TokenService,
      chain,
    });
    tempusPoolServices.set(chain, tempusPoolService);
  }

  const tempusPoolService = tempusPoolServices.get(chain);
  if (!tempusPoolService) {
    throw new Error(`Failed to get TempusPoolService for ${chain} chain!`);
  }

  if (signerOrProvider) {
    tempusPoolService.init({
      Contract: Contract,
      tempusPoolAddresses: getChainConfig(chain).tempusPools.map(tempusPoolConfig => tempusPoolConfig.address),
      TempusPoolABI: TempusPoolABI,
      signerOrProvider: signerOrProvider,
      eRC20TokenServiceGetter: getERC20TokenService,
      chain,
    });
  }

  return tempusPoolService;
};

export default getTempusPoolService;
