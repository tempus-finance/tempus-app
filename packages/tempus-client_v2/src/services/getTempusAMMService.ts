import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import TempusAMMABI from '../abi/TempusAMM.json';
import { getNetworkConfig } from '../utils/getConfig';
import { Chain } from '../interfaces/Chain';
import TempusAMMService from './TempusAMMService';
import getDefaultProvider from './getDefaultProvider';
import getTempusPoolService from './getTempusPoolService';
import getERC20TokenService from './getERC20TokenService';

let tempusAMMServices = new Map<Chain, TempusAMMService>();
const getTempusAMMService = (chain: Chain, signerOrProvider?: JsonRpcSigner | JsonRpcProvider): TempusAMMService => {
  if (!tempusAMMServices.get(chain)) {
    const tempusAMMService = new TempusAMMService();
    tempusAMMService.init({
      Contract,
      tempusAMMAddresses: getNetworkConfig(chain).tempusPools.map(tempusPoolConfig => tempusPoolConfig.ammAddress),
      TempusAMMABI: TempusAMMABI,
      signerOrProvider: getDefaultProvider(chain),
      tempusPoolService: getTempusPoolService(chain),
      eRC20TokenServiceGetter: getERC20TokenService,
      chain: chain,
    });
    tempusAMMServices.set(chain, tempusAMMService);
  }

  const tempusAMMService = tempusAMMServices.get(chain);
  if (!tempusAMMService) {
    throw new Error(`Failed to get TempusAMMService for ${chain} network!`);
  }

  if (signerOrProvider) {
    tempusAMMService.init({
      Contract: Contract,
      tempusAMMAddresses: getNetworkConfig(chain).tempusPools.map(tempusPoolConfig => tempusPoolConfig.ammAddress),
      TempusAMMABI: TempusAMMABI,
      signerOrProvider: signerOrProvider,
      tempusPoolService: getTempusPoolService(chain, signerOrProvider),
      eRC20TokenServiceGetter: getERC20TokenService,
      chain: chain,
    });
  }

  return tempusAMMService;
};

export default getTempusAMMService;
