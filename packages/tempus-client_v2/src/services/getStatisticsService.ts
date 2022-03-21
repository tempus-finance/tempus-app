import { Contract } from 'ethers';
import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import { Chain, getDefaultProvider, getTempusAMMService } from 'tempus-core-services';
import StatisticsABI from '../abi/Stats.json';
import { getChainConfig } from '../utils/getConfig';
import StatisticsService from './StatisticsService';

let statisticsServices = new Map<Chain, StatisticsService>();
const getStatisticsService = (chain: Chain, signerOrProvider?: JsonRpcSigner | JsonRpcProvider) => {
  if (!statisticsServices.get(chain)) {
    const statisticsService = new StatisticsService();
    statisticsService.init({
      Contract: Contract,
      abi: StatisticsABI,
      signerOrProvider: getDefaultProvider(chain, getChainConfig),
      tempusAMMService: getTempusAMMService(chain, getChainConfig),
      address: getChainConfig(chain).statisticsContract,
    });
    statisticsServices.set(chain, statisticsService);
  }

  const statisticsService = statisticsServices.get(chain);
  if (!statisticsService) {
    throw new Error(`Failed to get StatisticsService for ${chain} chain!`);
  }

  if (signerOrProvider) {
    statisticsService.init({
      Contract: Contract,
      abi: StatisticsABI,
      signerOrProvider: signerOrProvider,
      tempusAMMService: getTempusAMMService(chain, getChainConfig, signerOrProvider),
      address: getChainConfig(chain).statisticsContract,
    });
  }

  return statisticsService;
};

export default getStatisticsService;
