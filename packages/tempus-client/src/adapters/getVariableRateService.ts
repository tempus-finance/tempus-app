import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import VariableRateService from './VariableRateService';
import getTempusPoolService from '../services/getTempusPoolService';

let variableRateService: VariableRateService;
let actualSignerOrProvider: JsonRpcSigner | JsonRpcProvider;
const getVariableRateService = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): VariableRateService => {
  if (!variableRateService) {
    variableRateService = new VariableRateService();
  }

  if (signerOrProvider !== undefined && signerOrProvider !== actualSignerOrProvider) {
    actualSignerOrProvider = signerOrProvider;
    variableRateService.init(actualSignerOrProvider, getTempusPoolService(actualSignerOrProvider));
  }

  return variableRateService;
};

export default getVariableRateService;
