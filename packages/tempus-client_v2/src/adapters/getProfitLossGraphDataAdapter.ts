import { JsonRpcSigner } from '@ethersproject/providers';
import getERC20TokenService from '../services/getERC20TokenService';
import ProfitLossGraphDataAdapter from './ProfitLossGraphDataAdapter';

let profitLossGraphDataAdapter: ProfitLossGraphDataAdapter;
const getProfitLossGraphDataAdapter = (signerOrProvider: JsonRpcSigner): ProfitLossGraphDataAdapter => {
  if (profitLossGraphDataAdapter) {
    return profitLossGraphDataAdapter;
  }

  profitLossGraphDataAdapter = new ProfitLossGraphDataAdapter();
  profitLossGraphDataAdapter.init({
    signer: signerOrProvider,
    eRC20TokenServiceGetter: getERC20TokenService,
  });

  return profitLossGraphDataAdapter;
};

export default getProfitLossGraphDataAdapter;
