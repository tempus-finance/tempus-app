import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

import TempusPoolABI from '../abi/TempusPool.json';
import TempusPoolService from './TempusPoolService';
import getDefaultProvider from './getDefaultProvider';
import getERC20TokenService from './getERC20TokenService';
import getConfig from '../utils/getConfig';

let tempusPoolService: TempusPoolService;
const getTempusPoolService = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider) => {
  if (!tempusPoolService) {
    const defaultProvider = getDefaultProvider();

    tempusPoolService = new TempusPoolService();
    tempusPoolService.init({
      Contract,
      tempusPoolAddresses: getConfig().tempusPools.map(tempusPoolConfig => tempusPoolConfig.address),
      TempusPoolABI: TempusPoolABI,
      signerOrProvider: defaultProvider,
      eRC20TokenServiceGetter: getERC20TokenService,
    });
  }

  if (signerOrProvider) {
    tempusPoolService.init({
      Contract: Contract,
      tempusPoolAddresses: getConfig().tempusPools.map(tempusPoolConfig => tempusPoolConfig.address),
      TempusPoolABI: TempusPoolABI,
      signerOrProvider: signerOrProvider,
      eRC20TokenServiceGetter: getERC20TokenService,
    });
  }

  return tempusPoolService;
};

export default getTempusPoolService;
