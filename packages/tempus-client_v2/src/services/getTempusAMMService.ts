import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import TempusAMMABI from '../abi/TempusAMM.json';
import getConfig from '../utils/getConfig';
import TempusAMMService from './TempusAMMService';
import getDefaultProvider from './getDefaultProvider';
import getTempusPoolService from './getTempusPoolService';
import getERC20TokenService from './getERC20TokenService';
import { selectedChainState } from '../state/ChainState';

let tempusAMMService: TempusAMMService;
const getTempusAMMService = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): TempusAMMService => {
  if (!tempusAMMService) {
    tempusAMMService = new TempusAMMService();
    tempusAMMService.init({
      Contract,
      tempusAMMAddresses: getConfig()[selectedChainState.get()].tempusPools.map(
        tempusPoolConfig => tempusPoolConfig.ammAddress,
      ),
      TempusAMMABI: TempusAMMABI,
      signerOrProvider: getDefaultProvider(),
      tempusPoolService: getTempusPoolService(),
      eRC20TokenServiceGetter: getERC20TokenService,
      config: getConfig()[selectedChainState.get()],
    });
  }

  if (signerOrProvider) {
    tempusAMMService.init({
      Contract: Contract,
      tempusAMMAddresses: getConfig()[selectedChainState.get()].tempusPools.map(
        tempusPoolConfig => tempusPoolConfig.ammAddress,
      ),
      TempusAMMABI: TempusAMMABI,
      signerOrProvider: signerOrProvider,
      tempusPoolService: getTempusPoolService(signerOrProvider),
      eRC20TokenServiceGetter: getERC20TokenService,
      config: getConfig()[selectedChainState.get()],
    });
  }

  return tempusAMMService;
};

export default getTempusAMMService;
