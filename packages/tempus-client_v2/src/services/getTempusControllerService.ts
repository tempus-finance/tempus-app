import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import TempusControllerABI from '../abi/TempusController.json';
import getConfig from '../utils/getConfig';
import TempusControllerService from './TempusControllerService';
import getDefaultProvider from './getDefaultProvider';
import getTempusAMMService from './getTempusAMMService';
import { selectedChainState } from '../state/ChainState';

let tempusControllerService: TempusControllerService;
const getTempusControllerService = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): TempusControllerService => {
  if (!tempusControllerService) {
    tempusControllerService = new TempusControllerService();
    tempusControllerService.init({
      Contract: Contract,
      address: getConfig()[selectedChainState.get()].tempusControllerContract,
      abi: TempusControllerABI,
      signerOrProvider: getDefaultProvider(),
      tempusAMMService: getTempusAMMService(),
    });
  }

  if (signerOrProvider) {
    tempusControllerService.init({
      Contract: Contract,
      address: getConfig()[selectedChainState.get()].tempusControllerContract,
      abi: TempusControllerABI,
      signerOrProvider: signerOrProvider,
      tempusAMMService: getTempusAMMService(signerOrProvider),
    });
  }

  return tempusControllerService;
};

export default getTempusControllerService;
