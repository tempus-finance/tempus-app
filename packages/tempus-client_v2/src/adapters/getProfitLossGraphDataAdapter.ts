import { JsonRpcSigner } from '@ethersproject/providers';
import getERC20TokenService from '../services/getERC20TokenService';
import { Chain } from '../interfaces/Chain';
import ProfitLossGraphDataAdapter from './ProfitLossGraphDataAdapter';

let profitLossGraphDataAdapters = new Map<Chain, ProfitLossGraphDataAdapter>();
const getProfitLossGraphDataAdapter = (chain: Chain, signer: JsonRpcSigner): ProfitLossGraphDataAdapter => {
  let profitLossGraphDataAdapter = profitLossGraphDataAdapters.get(chain);
  if (profitLossGraphDataAdapter) {
    return profitLossGraphDataAdapter;
  }

  profitLossGraphDataAdapter = new ProfitLossGraphDataAdapter();
  profitLossGraphDataAdapter.init({
    signer: signer,
    chain: chain,
    eRC20TokenServiceGetter: getERC20TokenService,
  });

  profitLossGraphDataAdapters.set(chain, profitLossGraphDataAdapter);

  return profitLossGraphDataAdapter;
};

export default getProfitLossGraphDataAdapter;
