import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import VariableRateService from './VariableRateService';

let variableRateService: VariableRateService;
let actualSignerOrProvider: JsonRpcSigner | JsonRpcProvider;
const getVariableRateService = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): VariableRateService => {
  if (!variableRateService) {
    variableRateService = new VariableRateService();
  }

  if (signerOrProvider !== undefined && signerOrProvider !== actualSignerOrProvider) {
    actualSignerOrProvider = signerOrProvider;
    variableRateService.init(actualSignerOrProvider);
  }

  return variableRateService;
};

export default getVariableRateService;
