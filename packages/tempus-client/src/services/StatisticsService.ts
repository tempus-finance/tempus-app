// External libraries
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber, CallOverrides, Contract, ethers } from 'ethers';

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

  public async totalValueLockedUSD(
    tempusPool: string,
    poolBackingTokenTicker: string,
    overrides?: CallOverrides,
  ): Promise<BigNumber> {
    let totalValueLockedUSD = BigNumber.from('0');

    if (!this.statistics) {
      console.error(
        'StatisticsService totalValueLockedUSD Attempted to use statistics contract before initializing it...',
      );

      return Promise.reject(totalValueLockedUSD);
    }

    const chainlinkAggregatorEnsHash = ethers.utils.namehash(`${poolBackingTokenTicker.toLowerCase()}-usd.data.eth`);
    try {
      totalValueLockedUSD = await this.statistics.totalValueLockedAtGivenRate(
        tempusPool,
        chainlinkAggregatorEnsHash,
        overrides,
      );
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
    if (!this.statistics) {
      console.error(
        'StatisticsService totalValueLockedUSD Attempted to use statistics contract before initializing it...',
      );

      return Promise.reject(0);
    }

    const ensNameHash = ethers.utils.namehash(`${tokenTicker.toLowerCase()}-usd.data.eth`);

    let rate: BigNumber;
    let rateDenominator: BigNumber;
    try {
      [rate, rateDenominator] = await this.statistics.getRate(ensNameHash, overrides);
    } catch (error) {
      console.error(`Failed to get exchange rate for ${tokenTicker}!`, error);
      return Promise.reject(error);
    }

    return Number(ethers.utils.formatEther(rate)) / Number(ethers.utils.formatEther(rateDenominator));
  }
}

export default StatisticsService;
