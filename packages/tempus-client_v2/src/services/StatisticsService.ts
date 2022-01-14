import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber, CallOverrides, Contract, ethers } from 'ethers';
import Axios from 'axios';
import { Stats } from '../abi/Stats';
import StatsABI from '../abi/Stats.json';
import { div18f, mul18f } from '../utils/weiMath';
import { Ticker } from '../interfaces/Token';
import TempusAMMService from './TempusAMMService';
import { tokenPrecision } from '../constants';

const backingTokenToCoingeckoIdMap = new Map<string, string>();
backingTokenToCoingeckoIdMap.set('ETH', 'ethereum');
backingTokenToCoingeckoIdMap.set('USDC', 'usd-coin');

type StatisticsServiceParameters = {
  Contract: typeof Contract;
  address: string;
  abi: typeof StatsABI;
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
  tempusAMMService: TempusAMMService;
};

class StatisticsService {
  private stats: Stats | null = null;

  private tempusAMMService: TempusAMMService | null = null;

  private coinGeckoCache = new Map<string, { promise: Promise<any>; cachedAt: number }>();

  init(params: StatisticsServiceParameters) {
    try {
      this.stats = new Contract(params.address, params.abi, params.signerOrProvider) as Stats;
    } catch (error) {
      console.error('StatisticsService - init', error);
    }

    this.tempusAMMService = params.tempusAMMService;
  }

  public async totalValueLockedInBackingTokens(tempusPool: string, overrides?: CallOverrides) {
    if (!this.stats) {
      console.error(
        'StatisticsService - totalValueLockedInBackingTokens() - Attempted to use statistics contract before initializing it!',
      );
      return Promise.reject();
    }

    try {
      if (overrides) {
        return await this.stats.totalValueLockedInBackingTokens(tempusPool, overrides);
      } else {
        return await this.stats.totalValueLockedInBackingTokens(tempusPool);
      }
    } catch (error) {
      console.error(
        'StatisticsService - totalValueLockedInBackingTokens() - Failed to get total value locked in backing tokens!',
        error,
      );
      return Promise.reject(error);
    }
  }

  public async totalValueLockedUSD(
    tempusPool: string,
    poolBackingTokenTicker: Ticker,
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
      console.error(
        'StatisticsService - totalValueLockedUSD() - Failed to get total value locked at given rate from contract. Falling back to CoinGecko API!',
      );

      const rate = await this.getCoingeckoRate(poolBackingTokenTicker);

      let backingTokensLocked: BigNumber;
      try {
        backingTokensLocked = await this.stats.totalValueLockedInBackingTokens(tempusPool);
      } catch (error) {
        console.error(
          'StatisticsService - totalValueLockedUSD() - Failed to get total value locked in backing tokens!',
          error,
        );
        return Promise.reject(error);
      }

      return mul18f(rate, backingTokensLocked);
    }

    return totalValueLockedUSD;
  }

  async getCoingeckoRate(token: Ticker) {
    const coinGeckoTokenId = backingTokenToCoingeckoIdMap.get(token);
    if (!coinGeckoTokenId) {
      return Promise.reject();
    }

    const cachedResponse = this.coinGeckoCache.get(coinGeckoTokenId);
    if (cachedResponse && cachedResponse.cachedAt > Date.now() - 60000) {
      return ethers.utils.parseEther((await cachedResponse.promise).data[coinGeckoTokenId].usd.toString());
    }

    let value: BigNumber;
    try {
      const promise = Axios.get<any>(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoTokenId}&vs_currencies=usd`,
      );

      this.coinGeckoCache.set(coinGeckoTokenId, {
        promise: promise,
        cachedAt: Date.now(),
      });

      const result = await promise;

      value = ethers.utils.parseUnits(result.data[coinGeckoTokenId].usd.toString(), tokenPrecision[token]);
    } catch (error) {
      console.error(`Failed to get token '${token}' exchange rate from coin gecko!`, error);
      return Promise.reject(error);
    }

    return value;
  }

  /**
   * Returns conversion rate of specified token to USD
   **/
  public async getRate(tokenTicker: Ticker, overrides?: CallOverrides): Promise<BigNumber> {
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
      console.warn(
        `Failed to get exchange rate for ${tokenTicker} from stats contract, falling back to CoinGecko API!`,
      );

      return this.getCoingeckoRate(tokenTicker);
    }

    // TODO - Refactor getRate function to accept token precision as well as a parameter
    const precision = tokenPrecision[tokenTicker];

    return div18f(rate, rateDenominator, precision);
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
    lpAmount: BigNumber,
    principalAmount: BigNumber,
    yieldsAmount: BigNumber,
    isBackingToken: boolean,
    overrides?: CallOverrides,
  ): Promise<{
    tokenAmount: BigNumber;
    principalsStaked: BigNumber;
    yieldsStaked: BigNumber;
    principalsRate: BigNumber;
    yieldsRate: BigNumber;
  }> {
    if (!this.stats || !this.tempusAMMService) {
      console.error(
        'StatisticsService estimateExitAndRedeem Attempted to use statistics contract before initializing it...',
      );
      return Promise.reject();
    }

    if (lpAmount.isZero() && principalAmount.isZero() && yieldsAmount.isZero()) {
      return {
        tokenAmount: BigNumber.from('0'),
        principalsStaked: BigNumber.from('0'),
        yieldsStaked: BigNumber.from('0'),
        principalsRate: BigNumber.from('0'),
        yieldsRate: BigNumber.from('0'),
      };
    }

    let maxLeftoverShares = this.tempusAMMService.getMaxLeftoverShares(principalAmount, yieldsAmount, lpAmount);
    try {
      if (overrides) {
        return await this.stats.estimateExitAndRedeem(
          tempusAmmAddress,
          lpAmount,
          principalAmount,
          yieldsAmount,
          maxLeftoverShares,
          isBackingToken,
          overrides,
        );
      } else {
        return await this.stats.estimateExitAndRedeem(
          tempusAmmAddress,
          lpAmount,
          principalAmount,
          yieldsAmount,
          maxLeftoverShares,
          isBackingToken,
        );
      }
    } catch (error) {
      console.error(`Failed to get estimated withdraw amount`, error);
      console.log('Debug info:');
      console.log(`TempusAMM address: ${tempusAmmAddress}`);
      console.log(`LP Token amount: ${lpAmount.toHexString()} ${ethers.utils.formatEther(lpAmount)}`);
      console.log(`Principals amount: ${principalAmount.toHexString()} ${ethers.utils.formatEther(principalAmount)}`);
      console.log(`Yields amount: ${yieldsAmount.toHexString()} ${ethers.utils.formatEther(yieldsAmount)}`);
      console.log(
        `Max leftover shares: ${maxLeftoverShares.toHexString()} ${ethers.utils.formatEther(maxLeftoverShares)}`,
      );
      console.log(`Is backing token: ${isBackingToken}`);
      return Promise.reject(error);
    }
  }

  async estimatedMintedShares(
    tempusPool: string,
    amount: BigNumber,
    isBackingToken: boolean,
    overrides?: CallOverrides,
  ): Promise<BigNumber> {
    if (!this.stats) {
      console.error(
        'StatisticsService - estimatedMintedShares() - Attempted to use statistics contract before initializing it!',
      );
      return Promise.reject();
    }

    try {
      if (overrides) {
        return await this.stats.estimatedMintedShares(tempusPool, amount, isBackingToken, overrides);
      } else {
        return await this.stats.estimatedMintedShares(tempusPool, amount, isBackingToken);
      }
    } catch (error) {
      console.error('StatisticsService - estimatedMintedShares() - Failed to fetch estimated minted shares!', error);
      return Promise.reject(error);
    }
  }

  async estimatedRedeem(
    tempusPool: string,
    principalsAmount: BigNumber,
    yieldsAmount: BigNumber,
    toBackingToken: boolean,
  ): Promise<BigNumber> {
    if (!this.stats) {
      console.error(
        'StatisticsService - estimatedMintedShares() - Attempted to use statistics contract before initializing it!',
      );
      return Promise.reject();
    }

    try {
      return this.stats.estimatedRedeem(tempusPool, principalsAmount, yieldsAmount, toBackingToken);
    } catch (error) {
      console.error('StatisticsService - estimatedRedeem() - Failed to fetch estimated redeem amount!');
      return Promise.reject(error);
    }
  }
}

export default StatisticsService;
