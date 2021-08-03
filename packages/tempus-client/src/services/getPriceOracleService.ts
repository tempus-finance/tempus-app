import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

import PriceOracleService from './PriceOracleService';

import config from '../config';

let priceOracleService: PriceOracleService;
const getPriceOracleService = (signerOrProvider: JsonRpcSigner | JsonRpcProvider) => {
  if (!priceOracleService) {
    priceOracleService = new PriceOracleService();
    priceOracleService.init({
      Contract: Contract,
      signerOrProvider: signerOrProvider,
      priceOraclesConfig: config.priceOracles,
    });
  }

  return priceOracleService;
};

export default getPriceOracleService;
