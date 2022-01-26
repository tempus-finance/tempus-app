import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import TempusControllerABI from '../abi/TempusController.json';
import { getNetworkConfig } from '../utils/getConfig';
import TempusControllerService from './TempusControllerService';
import getDefaultProvider from './getDefaultProvider';
import getTempusAMMService from './getTempusAMMService';
import { Networks } from '../state/NetworkState';

let tempusControllerService: TempusControllerService;
const getTempusControllerService = (
  network: Networks,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): TempusControllerService => {
  if (!tempusControllerService) {
    tempusControllerService = new TempusControllerService();
    tempusControllerService.init({
      Contract: Contract,
      address: getNetworkConfig(network).tempusControllerContract,
      abi: TempusControllerABI,
      signerOrProvider: getDefaultProvider(network),
      tempusAMMService: getTempusAMMService(network),
      network,
    });
  }

  if (signerOrProvider) {
    tempusControllerService.init({
      Contract: Contract,
      address: getNetworkConfig(network).tempusControllerContract,
      abi: TempusControllerABI,
      signerOrProvider: signerOrProvider,
      tempusAMMService: getTempusAMMService(network, signerOrProvider),
      network,
    });
  }

  return tempusControllerService;
};

export default getTempusControllerService;
