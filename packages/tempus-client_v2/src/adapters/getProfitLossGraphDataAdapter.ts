import { JsonRpcSigner } from '@ethersproject/providers';
import getERC20TokenService from '../services/getERC20TokenService';
import { Networks } from '../state/NetworkState';
import ProfitLossGraphDataAdapter from './ProfitLossGraphDataAdapter';

let profitLossGraphDataAdapter: ProfitLossGraphDataAdapter;
const getProfitLossGraphDataAdapter = (
  network: Networks,
  signerOrProvider: JsonRpcSigner,
): ProfitLossGraphDataAdapter => {
  if (profitLossGraphDataAdapter) {
    return profitLossGraphDataAdapter;
  }

  profitLossGraphDataAdapter = new ProfitLossGraphDataAdapter();
  profitLossGraphDataAdapter.init({
    signer: signerOrProvider,
    network,
    eRC20TokenServiceGetter: getERC20TokenService,
  });

  return profitLossGraphDataAdapter;
};

export default getProfitLossGraphDataAdapter;
