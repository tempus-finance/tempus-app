import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import TempusControllerABI from '../abi/TempusController.json';
import TempusControllerService from './TempusControllerService';
import getDefaultProvider from './getDefaultProvider';
import getConfig from '../utils/get-config';

let tempusControllerService: TempusControllerService;
const getTempusControllerService = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): TempusControllerService => {
  if (!tempusControllerService) {
    tempusControllerService = new TempusControllerService();
    tempusControllerService.init({
      Contract: Contract,
      address: getConfig().tempusControllerContract,
      abi: TempusControllerABI,
      signerOrProvider: getDefaultProvider(),
    });
  }

  if (signerOrProvider) {
    tempusControllerService.init({
      Contract: Contract,
      address: getConfig().tempusControllerContract,
      abi: TempusControllerABI,
      signerOrProvider: signerOrProvider,
    });
  }

  return tempusControllerService;
};

export default getTempusControllerService;
