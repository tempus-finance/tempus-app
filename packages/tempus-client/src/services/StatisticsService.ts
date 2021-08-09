// External libraries
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber, Contract, ethers } from 'ethers';

// Contract typings
import { Statistics } from '../abi/Statistics';

// ABI
import StatisticsABI from '../abi/Statistics.json';

type StatisticsServiceParameters = {
  Contract: typeof Contract;
  address: string;
  abi: typeof StatisticsABI;
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
};

class StatisticsService {
  private statistics: Statistics | null = null;

  init(params: StatisticsServiceParameters) {
    this.statistics = new Contract(params.address, params.abi, params.signerOrProvider) as Statistics;
  }

  public async totalValueLockedUSD(tempusPool: string, poolBackingTokenTicker: string): Promise<BigNumber> {
    let totalValueLockedUSD = BigNumber.from('0');

    if (!this.statistics) {
      console.error(
        'StatisticsService totalValueLockedUSD Attempted to use statistics contract before initializing it...',
      );
      return Promise.reject(totalValueLockedUSD);
    }

    const chainlinkAggregatorEnsHash = ethers.utils.namehash(`${poolBackingTokenTicker.toLowerCase()}-usd.data.eth`);
    try {
      totalValueLockedUSD = await this.statistics.totalValueLockedAtGivenRate(tempusPool, chainlinkAggregatorEnsHash);
    } catch (error) {
      console.error(`StatisticsService totalValueLockedUSD ${error}`);
      return Promise.reject(error);
    }

    return totalValueLockedUSD;
  }
}

export default StatisticsService;
