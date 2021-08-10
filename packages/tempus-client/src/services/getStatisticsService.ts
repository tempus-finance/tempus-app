// External libraries
import { Contract } from 'ethers';
import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';

// ABI
import StatisticsABI from '../abi/Statistics.json';

// Config
import getConfig from '../util/get-config';

// Service
import StatisticsService from './StatisticsService';
import getDefaultProvider from './getDefaultProvider';

let statisticsService: StatisticsService;
const getStatisticsService = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider) => {
  if (!statisticsService) {
    statisticsService = new StatisticsService();
    statisticsService.init({
      Contract: Contract,
      address: getConfig().statisticsContract,
      abi: StatisticsABI,
      signerOrProvider: getDefaultProvider(),
    });
  }

  if (signerOrProvider) {
    statisticsService.init({
      Contract: Contract,
      address: getConfig().statisticsContract,
      abi: StatisticsABI,
      signerOrProvider: signerOrProvider,
    });
  }

  return statisticsService;
};

export default getStatisticsService;
