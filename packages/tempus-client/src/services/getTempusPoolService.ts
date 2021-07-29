import { Contract, Signer } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';

import TempusPoolABI from '../abi/TempusPool.json';
import config from '../config';
import TempusPoolService from './TempusPoolService';

let tempusPoolService: TempusPoolService;
const getTempusPoolService = (signerOrProvider?: Signer | Provider) => {
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
