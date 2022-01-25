// External libraries
import { Contract } from 'ethers';
import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';

// ABI
import StatisticsABI from '../abi/Stats.json';

// Config
import getConfig from '../utils/getConfig';

// Service
import StatisticsService from './StatisticsService';
import getDefaultProvider from './getDefaultProvider';
import getTempusAMMService from './getTempusAMMService';
import { selectedChainState } from '../state/ChainState';

let statisticsService: StatisticsService;
const getStatisticsService = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider) => {
  if (!statisticsService) {
    statisticsService = new StatisticsService();
    statisticsService.init({
      Contract: Contract,
      address: getConfig()[selectedChainState.get()].statisticsContract,
      abi: StatisticsABI,
      signerOrProvider: getDefaultProvider(),
      tempusAMMService: getTempusAMMService(),
    });
  }

  if (signerOrProvider) {
    statisticsService.init({
      Contract: Contract,
      address: getConfig()[selectedChainState.get()].statisticsContract,
      abi: StatisticsABI,
      signerOrProvider: signerOrProvider,
      tempusAMMService: getTempusAMMService(signerOrProvider),
    });
  }

  return statisticsService;
};

export default getStatisticsService;
