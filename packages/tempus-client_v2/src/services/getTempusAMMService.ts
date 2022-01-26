import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import TempusAMMABI from '../abi/TempusAMM.json';
import { getNetworkConfig } from '../utils/getConfig';
import TempusAMMService from './TempusAMMService';
import getDefaultProvider from './getDefaultProvider';
import getTempusPoolService from './getTempusPoolService';
import getERC20TokenService from './getERC20TokenService';
import { Networks } from '../state/NetworkState';

let tempusAMMService: TempusAMMService;
const getTempusAMMService = (
  network: Networks,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): TempusAMMService => {
  if (!tempusAMMService) {
    tempusAMMService = new TempusAMMService();
    tempusAMMService.init({
      Contract,
      tempusAMMAddresses: getNetworkConfig(network).tempusPools.map(tempusPoolConfig => tempusPoolConfig.ammAddress),
      TempusAMMABI: TempusAMMABI,
      signerOrProvider: getDefaultProvider(network),
      tempusPoolService: getTempusPoolService(network),
      eRC20TokenServiceGetter: getERC20TokenService,
      network,
    });
  }

  if (signerOrProvider) {
    tempusAMMService.init({
      Contract: Contract,
      tempusAMMAddresses: getNetworkConfig(network).tempusPools.map(tempusPoolConfig => tempusPoolConfig.ammAddress),
      TempusAMMABI: TempusAMMABI,
      signerOrProvider: signerOrProvider,
      tempusPoolService: getTempusPoolService(network, signerOrProvider),
      eRC20TokenServiceGetter: getERC20TokenService,
      network,
    });
  }

  return tempusAMMService;
};

export default getTempusAMMService;
