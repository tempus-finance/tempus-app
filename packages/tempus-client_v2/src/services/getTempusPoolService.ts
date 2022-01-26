import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

import TempusPoolABI from '../abi/TempusPool.json';
import TempusPoolService from './TempusPoolService';
import getDefaultProvider from './getDefaultProvider';
import getERC20TokenService from './getERC20TokenService';
import { getNetworkConfig } from '../utils/getConfig';
import { Networks } from '../state/NetworkState';

let tempusPoolService: TempusPoolService;
const getTempusPoolService = (network: Networks, signerOrProvider?: JsonRpcSigner | JsonRpcProvider) => {
  if (!tempusPoolService) {
    const defaultProvider = getDefaultProvider(network);

    tempusPoolService = new TempusPoolService();
    tempusPoolService.init({
      Contract,
      tempusPoolAddresses: getNetworkConfig(network).tempusPools.map(tempusPoolConfig => tempusPoolConfig.address),
      TempusPoolABI: TempusPoolABI,
      signerOrProvider: defaultProvider,
      eRC20TokenServiceGetter: getERC20TokenService,
      network,
    });
  }

  if (signerOrProvider) {
    tempusPoolService.init({
      Contract: Contract,
      tempusPoolAddresses: getNetworkConfig(network).tempusPools.map(tempusPoolConfig => tempusPoolConfig.address),
      TempusPoolABI: TempusPoolABI,
      signerOrProvider: signerOrProvider,
      eRC20TokenServiceGetter: getERC20TokenService,
      network,
    });
  }

  return tempusPoolService;
};

export default getTempusPoolService;
