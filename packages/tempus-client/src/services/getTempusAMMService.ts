import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import TempusAMMABI from '../abi/TempusAMM.json';
import getConfig from '../utils/get-config';
import TempusAMMService from './TempusAMMService';
import getDefaultProvider from './getDefaultProvider';
import getTempusPoolService from './getTempusPoolService';
import getVaultService from './getVaultService';

let tempusAMMService: TempusAMMService;
const getTempusAMMService = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): TempusAMMService => {
  if (!tempusAMMService) {
    tempusAMMService = new TempusAMMService();
    tempusAMMService.init({
      Contract,
      tempusAMMAddresses: getConfig().tempusPools.map(tempusPoolConfig => tempusPoolConfig.ammAddress),
      TempusAMMABI: TempusAMMABI,
      signerOrProvider: getDefaultProvider(),
      tempusPoolService: getTempusPoolService(),
      vaultService: getVaultService(),
    });
  }

  if (signerOrProvider) {
    tempusAMMService.init({
      Contract: Contract,
      tempusAMMAddresses: getConfig().tempusPools.map(tempusPoolConfig => tempusPoolConfig.ammAddress),
      TempusAMMABI: TempusAMMABI,
      signerOrProvider: signerOrProvider,
      tempusPoolService: getTempusPoolService(signerOrProvider),
      vaultService: getVaultService(signerOrProvider),
    });
  }

  return tempusAMMService;
};

export default getTempusAMMService;
