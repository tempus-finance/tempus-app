import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber, CallOverrides, Contract, ethers } from 'ethers';
import { Stats } from '../abi/Stats';
import StatsABI from '../abi/Stats.json';
import { div18f } from '../utils/wei-math';

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
   **/
  public async getRate(tokenTicker: string, overrides?: CallOverrides): Promise<BigNumber> {
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

    return div18f(rate, rateDenominator);
  }

  /**
   * Returns estimated amount of Principals tokens on fixed yield deposit
   **/
  async estimatedDepositAndFix(
    tempusAmmAddress: string,
    tokenAmount: BigNumber,
    isBackingToken: boolean,
  ): Promise<BigNumber> {
    if (!this.stats) {
      console.error(
        'StatisticsService - estimatedDepositAndFix: Attempted to use statistics contract before initializing it...',
      );
      return Promise.reject(0);
    }

    if (!tempusAmmAddress || !tokenAmount) {
      console.error('StatisticsService - estimatedDepositAndFix: invalid tempusAmmAddress or tokenAmount');
      return Promise.reject(0);
    }

    try {
      return this.stats.estimatedDepositAndFix(tempusAmmAddress, tokenAmount, isBackingToken);
    } catch (error) {
      console.error(`StatisticsService - estimatedDepositAndFix - Failed to get estimated fixed deposit amount`, error);
      return Promise.reject(0);
    }
  }

  /**
   * Returns estimated amount of Principals tokens on variable yield deposit
   **/
  async estimatedDepositAndProvideLiquidity(
    tempusAmmAddress: string,
    tokenAmount: BigNumber,
    isBackingToken: boolean,
  ): Promise<[BigNumber, BigNumber, BigNumber]> {
    if (!this.stats) {
      console.error(
        'StatisticsService estimatedDepositAndProvideLiquidity Attempted to use statistics contract before initializing it...',
      );
      return Promise.reject(0);
    }

    try {
      return this.stats.estimatedDepositAndProvideLiquidity(tempusAmmAddress, tokenAmount, isBackingToken);
    } catch (error) {
      console.error(`Failed to get estimated variable deposit amount`, error);
      return Promise.reject(0);
    }
  }

  /**
   * Returns estimated amount of Backing/Yield Bearing tokens on deposit
   **/
  async estimateExitAndRedeem(
    tempusAmmAddress: string,
    principalAmount: BigNumber,
    yieldsAmount: BigNumber,
    lpAmount: BigNumber,
    isBackingToken: boolean,
  ): Promise<BigNumber> {
    if (!this.stats) {
      console.error(
        'StatisticsService estimateExitAndRedeem Attempted to use statistics contract before initializing it...',
      );
      return Promise.reject(0);
    }

    try {
      return this.stats.estimateExitAndRedeem(
        tempusAmmAddress,
        principalAmount,
        yieldsAmount,
        lpAmount,
        isBackingToken,
      );
    } catch (error) {
      console.error(`Failed to get estimated withdraw amount`, error);
      return Promise.reject(0);
    }
  }

  async estimatedMintedShares(tempusPool: string, amount: BigNumber, isBackingToken: boolean): Promise<BigNumber> {
    if (!this.stats) {
      console.error(
        'StatisticsService - estimatedMintedShares() - Attempted to use statistics contract before initializing it!',
      );
      return Promise.reject();
    }

    try {
      return await this.stats.estimatedMintedShares(tempusPool, amount, isBackingToken);
    } catch (error) {
      console.error('StatisticsService - estimatedMintedShares() - Failed to fetch estimated minted shares!', error);
      return Promise.reject(error);
    }
  }
}

export default StatisticsService;
