import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

import PriceOracleService from './PriceOracleService';
import getDefaultProvider from './getDefaultProvider';

import config from '../config';

let priceOracleService: PriceOracleService;
const getPriceOracleService = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider) => {
  if (!priceOracleService) {
    priceOracleService = new PriceOracleService();
    priceOracleService.init({
      Contract: Contract,
      signerOrProvider: getDefaultProvider(),
      priceOraclesConfig: config.priceOracles,
    });
  }

  if (signerOrProvider) {
    priceOracleService.init({
      Contract: Contract,
      signerOrProvider: signerOrProvider,
      priceOraclesConfig: config.priceOracles,
    });
  }

  return priceOracleService;
};

export default getPriceOracleService;
