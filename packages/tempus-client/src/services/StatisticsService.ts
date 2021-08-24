// External libraries
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber, CallOverrides, Contract, ethers } from 'ethers';

// Contract typings
import { Stats } from '../abi/Stats';

// ABI
import StatsABI from '../abi/Stats.json';

type StatisticsServiceParameters = {
  Contract: typeof Contract;
  address: string;
  abi: typeof StatsABI;
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
};

class StatisticsService {
  private stats: Stats | null = null;

  init(params: StatisticsServiceParameters) {
    this.stats = new Contract(params.address, params.abi, params.signerOrProvider) as Stats;
  }

  public async totalValueLockedUSD(
    tempusPool: string,
    poolBackingTokenTicker: string,
    overrides?: CallOverrides,
  ): Promise<BigNumber> {
    let totalValueLockedUSD = BigNumber.from('0');

    if (!this.stats) {
      console.error(
        'StatisticsService totalValueLockedUSD Attempted to use statistics contract before initializing it...',
      );

      return Promise.reject(totalValueLockedUSD);
    }

    const chainlinkAggregatorEnsHash = ethers.utils.namehash(`${poolBackingTokenTicker.toLowerCase()}-usd.data.eth`);
    try {
      if (overrides) {
        totalValueLockedUSD = await this.stats.totalValueLockedAtGivenRate(
          tempusPool,
          chainlinkAggregatorEnsHash,
          overrides,
        );
      } else {
        totalValueLockedUSD = await this.stats.totalValueLockedAtGivenRate(tempusPool, chainlinkAggregatorEnsHash);
      }
    } catch (error) {
      console.error(`StatisticsService totalValueLockedUSD ${error}`);
      return Promise.reject(error);
    }

    return totalValueLockedUSD;
  }

  /**
   * Returns conversion rate of specified token to USD
   */
  public async getRate(tokenTicker: string, overrides?: CallOverrides): Promise<number> {
    if (!this.stats) {
      console.error(
        'StatisticsService totalValueLockedUSD Attempted to use statistics contract before initializing it...',
      );

      return Promise.reject(0);
    }

    const ensNameHash = ethers.utils.namehash(`${tokenTicker.toLowerCase()}-usd.data.eth`);

    let rate: BigNumber;
    let rateDenominator: BigNumber;
    try {
      if (overrides) {
        [rate, rateDenominator] = await this.stats.getRate(ensNameHash, overrides);
      } else {
        [rate, rateDenominator] = await this.stats.getRate(ensNameHash);
      }
    } catch (error) {
      console.error(`Failed to get exchange rate for ${tokenTicker}!`, error);
      return Promise.reject(error);
    }

    return Number(ethers.utils.formatEther(rate)) / Number(ethers.utils.formatEther(rateDenominator));
  }
}

export default StatisticsService;
