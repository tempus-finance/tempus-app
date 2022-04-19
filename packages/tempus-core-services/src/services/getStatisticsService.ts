import { Contract } from 'ethers';
import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import StatisticsABI from '../abi/Stats.json';
import { ChainConfig, Chain, Config } from '../interfaces';
import { getDefaultProvider } from './getDefaultProvider';
import { getTempusAMMService } from './getTempusAMMService';
import { StatisticsService } from './StatisticsService';

const statisticsServices = new Map<Chain, StatisticsService>();
export const getStatisticsService = (
  chain: Chain,
  getConfig: () => Config,
  getChainConfig: (chain: Chain) => ChainConfig,
  signerOrProvider?: JsonRpcSigner | JsonRpcProvider,
): StatisticsService => {
  if (!statisticsServices.get(chain)) {
    const statisticsService = new StatisticsService();
    statisticsService.init({
      StatsContract: Contract,
      abi: StatisticsABI,
      signerOrProvider: getDefaultProvider(chain, getChainConfig),
      tempusAMMService: getTempusAMMService(chain, getChainConfig),
      address: getChainConfig(chain).statisticsContract,
      getConfig,
    });
    statisticsServices.set(chain, statisticsService);
  }

  const statisticsService = statisticsServices.get(chain);
  if (!statisticsService) {
    throw new Error(`Failed to get StatisticsService for ${chain} chain!`);
  }

  if (signerOrProvider) {
    statisticsService.init({
      StatsContract: Contract,
      abi: StatisticsABI,
      signerOrProvider,
      tempusAMMService: getTempusAMMService(chain, getChainConfig, signerOrProvider),
      address: getChainConfig(chain).statisticsContract,
      getConfig,
    });
  }

  return statisticsService;
};
