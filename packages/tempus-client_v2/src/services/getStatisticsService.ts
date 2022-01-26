import { Contract } from 'ethers';
import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import StatisticsABI from '../abi/Stats.json';
import StatisticsService from './StatisticsService';
import getDefaultProvider from './getDefaultProvider';
import getTempusAMMService from './getTempusAMMService';
import { Networks } from '../state/NetworkState';
import { getNetworkConfig } from '../utils/getConfig';

let statisticsService: StatisticsService;
const getStatisticsService = (network: Networks, signerOrProvider?: JsonRpcSigner | JsonRpcProvider) => {
  if (!statisticsService) {
    statisticsService = new StatisticsService();
    statisticsService.init({
      Contract: Contract,
      abi: StatisticsABI,
      signerOrProvider: getDefaultProvider(network),
      tempusAMMService: getTempusAMMService(network),
      address: getNetworkConfig(network).statisticsContract,
    });
  }

  if (signerOrProvider) {
    statisticsService.init({
      Contract: Contract,
      abi: StatisticsABI,
      signerOrProvider: signerOrProvider,
      tempusAMMService: getTempusAMMService(network, signerOrProvider),
      address: getNetworkConfig(network).statisticsContract,
    });
  }

  return statisticsService;
};

export default getStatisticsService;
