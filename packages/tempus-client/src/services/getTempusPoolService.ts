import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

import TempusPoolABI from '../abi/TempusPool.json';
import config from '../config';
import TempusPoolService from './TempusPoolService';

let tempusPoolService: TempusPoolService;
const getTempusPoolService = (signerOrProvider: JsonRpcSigner | JsonRpcProvider) => {
  if (!tempusPoolService) {
    tempusPoolService = new TempusPoolService();
    tempusPoolService.init({
      Contract,
      tempusPoolAddresses: config.tempusPools,
      TempusPoolABI: TempusPoolABI,
      signerOrProvider,
    });
  }

  return tempusPoolService;
};

export default getTempusPoolService;
