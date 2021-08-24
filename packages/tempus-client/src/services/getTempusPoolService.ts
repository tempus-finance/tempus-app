import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

import TempusPoolABI from '../abi/TempusPool.json';
import TempusPoolService from './TempusPoolService';
import getDefaultProvider from './getDefaultProvider';
import getConfig from '../utils/get-config';

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
    });
  }

  if (signerOrProvider) {
    tempusPoolService.init({
      Contract: Contract,
      tempusPoolAddresses: getConfig().tempusPools.map(tempusPoolConfig => tempusPoolConfig.address),
      TempusPoolABI: TempusPoolABI,
      signerOrProvider: signerOrProvider,
    });
  }

  return tempusPoolService;
};

export default getTempusPoolService;
