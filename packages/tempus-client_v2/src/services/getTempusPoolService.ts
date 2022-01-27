import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

import TempusPoolABI from '../abi/TempusPool.json';
import { getNetworkConfig } from '../utils/getConfig';
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
      tempusPoolAddresses: getNetworkConfig(chain).tempusPools.map(tempusPoolConfig => tempusPoolConfig.address),
      TempusPoolABI: TempusPoolABI,
      signerOrProvider: defaultProvider,
      eRC20TokenServiceGetter: getERC20TokenService,
      chain: chain,
    });
    tempusPoolServices.set(chain, tempusPoolService);
  }

  const tempusPoolService = tempusPoolServices.get(chain);
  if (!tempusPoolService) {
    throw new Error(`Failed to get TempusPoolService for ${chain} network!`);
  }

  if (signerOrProvider) {
    tempusPoolService.init({
      Contract: Contract,
      tempusPoolAddresses: getNetworkConfig(chain).tempusPools.map(tempusPoolConfig => tempusPoolConfig.address),
      TempusPoolABI: TempusPoolABI,
      signerOrProvider: signerOrProvider,
      eRC20TokenServiceGetter: getERC20TokenService,
      chain: chain,
    });
  }

  return tempusPoolService;
};

export default getTempusPoolService;
