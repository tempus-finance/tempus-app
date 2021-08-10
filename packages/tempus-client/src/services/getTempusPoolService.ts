import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

import TempusPoolABI from '../abi/TempusPool.json';
import config from '../config';
import TempusPoolService from './TempusPoolService';
import getPriceOracleService from './getPriceOracleService';
import getDefaultProvider from './getDefaultProvider';

let tempusPoolService: TempusPoolService;
const getTempusPoolService = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider) => {
  if (!tempusPoolService) {
    const defaultProvider = getDefaultProvider();

    tempusPoolService = new TempusPoolService();
    tempusPoolService.init({
      Contract,
      tempusPoolAddresses: config.tempusPools.map(tempusPoolConfig => tempusPoolConfig.address),
      TempusPoolABI: TempusPoolABI,
      priceOracleService: getPriceOracleService(defaultProvider),
      signerOrProvider: defaultProvider,
    });
  }

  if (signerOrProvider) {
    tempusPoolService.init({
      Contract: Contract,
      tempusPoolAddresses: config.tempusPools.map(tempusPoolConfig => tempusPoolConfig.address),
      TempusPoolABI: TempusPoolABI,
      priceOracleService: getPriceOracleService(signerOrProvider),
      signerOrProvider: signerOrProvider,
    });
  }

  return tempusPoolService;
};

export default getTempusPoolService;
