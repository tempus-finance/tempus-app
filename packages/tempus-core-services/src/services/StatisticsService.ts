import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber, CallOverrides, Contract, ethers } from 'ethers';
import { catchError, combineLatest, from, map, mergeMap, Observable, of, throwError } from 'rxjs';
import { Stats } from '../abi/Stats';
import StatsABI from '../abi/Stats.json';
import { DEFAULT_TOKEN_PRECISION, tokenPrecision } from '../constants';
import { Decimal, decreasePrecision, increasePrecision, ZERO } from '../datastructures';
import { Chain, Config, TempusPool, Ticker } from '../interfaces';
import { getTokenPrecision, mul18f } from '../utils';
import { getChainlinkFeed } from './getChainlinkFeed';
import { getCoingeckoRate } from './coinGeckoFeed';
import { TempusAMMService } from './TempusAMMService';
import { getERC20TokenService } from './getERC20TokenService';

type StatisticsServiceParameters = {
  Contract: typeof Contract;
  address: string;
  abi: typeof StatsABI;
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
  tempusAMMService: TempusAMMService;
  getConfig: () => Config;
};

export class StatisticsService {
  private stats: Stats | null = null;

  private tempusAMMService: TempusAMMService | null = null;

  private getConfig: (() => Config) | null = null;

  init({ address, abi, signerOrProvider, Contract, tempusAMMService, getConfig }: StatisticsServiceParameters): void {
    try {
      this.stats = new Contract(address, abi, signerOrProvider) as Stats;
    } catch (error) {
      console.error('StatisticsService - init', error);
    }
    this.getConfig = getConfig;
    this.tempusAMMService = tempusAMMService;
  }

  public async totalValueLockedInBackingTokens(tempusPool: string, overrides?: CallOverrides): Promise<BigNumber> {
    if (!this.stats) {
      console.error(
        'StatisticsService - totalValueLockedInBackingTokens() - Attempted to use statistics contract before initializing it!',
      );
      return Promise.reject();
    }

    try {
      if (overrides) {
        return await this.stats.totalValueLockedInBackingTokens(tempusPool, overrides);
      }
      return await this.stats.totalValueLockedInBackingTokens(tempusPool);
    } catch (error) {
      console.error(
        'StatisticsService - totalValueLockedInBackingTokens() - Failed to get total value locked in backing tokens!',
        error,
      );
      return Promise.reject(error);
    }
  }

  totalValueLockedUSD(
    chain: Chain,
    tempusPool: string,
    poolBackingTokenTicker: Ticker,
    overrides?: CallOverrides,
  ): Observable<Decimal> {
    if (!this.stats) {
      console.error(
        'StatisticsService totalValueLockedUSD Attempted to use statistics contract before initializing it...',
      );
      return throwError(() => new Error('0'));
    }

    const chainLinkAggregator = getChainlinkFeed(chain, poolBackingTokenTicker);

    try {
      if (overrides) {
        return from(this.stats.totalValueLockedAtGivenRate(tempusPool, chainLinkAggregator, overrides)).pipe(
          map<BigNumber, Decimal>((value: BigNumber) => new Decimal(value)),
        );
      }

      return from(this.stats.totalValueLockedAtGivenRate(tempusPool, chainLinkAggregator)).pipe(
        map<BigNumber, Decimal>((value: BigNumber) => new Decimal(value)),
      );
    } catch (error) {
      console.error(
        'StatisticsService - totalValueLockedUSD() - Failed to get total value locked at given rate from contract. Falling back to CoinGecko API!',
        error,
      );

      const precision = tokenPrecision[poolBackingTokenTicker] || DEFAULT_TOKEN_PRECISION;
      return from<Promise<[BigNumber, BigNumber]>>(
        Promise.all([
          getCoingeckoRate(poolBackingTokenTicker, precision),
          this.stats.totalValueLockedInBackingTokens(tempusPool),
        ]),
      ).pipe(
        map(values => {
          const [rate, backingTokensLocked] = values;
          return mul18f(rate, backingTokensLocked, precision);
        }),
        map<BigNumber, Decimal>((value: BigNumber) => new Decimal(value)),
        catchError(coinGeckoError => {
          console.error(
            'StatisticsService - totalValueLockedUSD() - Failed to get total value locked at given rate from contract. Falling back to CoinGecko API!',
            coinGeckoError,
          );
          return throwError(() => new Error('0'));
        }),
      );
    }
  }

  /**
   * Returns conversion rate of specified token to USD
   * */
  public getRate(chain: Chain, tokenTicker: Ticker, overrides?: CallOverrides): Observable<Decimal | null> {
    if (!this.stats) {
      console.error(
        'StatisticsService totalValueLockedUSD Attempted to use statistics contract before initializing it...',
      );

      return throwError(() => new Error('0'));
    }

    const chainLinkAggregator = getChainlinkFeed(chain, tokenTicker);

    // TODO - Refactor getRate function to accept token precision as well as a parameter
    const precision = tokenPrecision[tokenTicker];

    return from(
      overrides ? this.stats.getRate(chainLinkAggregator, overrides) : this.stats.getRate(chainLinkAggregator),
    ).pipe(
      map<[BigNumber, BigNumber], Decimal>(([rate, rateDenominator]) => {
        const rate18f = increasePrecision(rate, DEFAULT_TOKEN_PRECISION - (precision ?? 0));
        const rateDenominator18f = increasePrecision(rateDenominator, DEFAULT_TOKEN_PRECISION - (precision ?? 0));
        return new Decimal(rate18f).div(rateDenominator18f);
      }),
      catchError(() => {
        console.warn(
          `Failed to get exchange rate for ${tokenTicker} from stats contract, falling back to CoinGecko API!`,
        );

        const precision = tokenPrecision[tokenTicker] || DEFAULT_TOKEN_PRECISION;
        return from(getCoingeckoRate(tokenTicker, precision)).pipe(
          map<BigNumber, Decimal>((value: BigNumber) => new Decimal(value)),
          catchError(() => {
            console.warn(`Failed to get exchange rate for ${tokenTicker} from CoinGecko API`);

            return of(null);
          }),
        );
      }),
    );
  }

  /**
   * Returns pool balance in USD
   * */
  public getUserPoolBalanceUSD(
    chain: Chain,
    tempusPool: TempusPool,
    userWalletAddress: string,
    tokenBalances?: {
      principalsBalance: Decimal;
      yieldsBalance: Decimal;
      lpTokenBalance: Decimal;
    },
    overrides?: CallOverrides,
  ): Observable<Decimal | null> {
    const { address, ammAddress, backingToken, principalsAddress, yieldsAddress, tokenPrecision } = tempusPool;

    const principalsBalance$ = tokenBalances
      ? of(tokenBalances.principalsBalance.toBigNumber(tokenPrecision.principals))
      : from(getERC20TokenService(principalsAddress, chain).balanceOf(userWalletAddress, overrides));
    const yieldsBalance$ = tokenBalances
      ? of(tokenBalances.yieldsBalance.toBigNumber(tokenPrecision.yields))
      : from(getERC20TokenService(yieldsAddress, chain).balanceOf(userWalletAddress, overrides));
    const lpTokenBalance$ = tokenBalances
      ? of(tokenBalances.lpTokenBalance.toBigNumber(tokenPrecision.lpTokens))
      : from(getERC20TokenService(ammAddress, chain).balanceOf(userWalletAddress, overrides));
    const backingTokenRate$ = from(this.getRate(chain, backingToken, overrides));
    const isBackingToken = true;

    const exitEstimate$ = combineLatest([principalsBalance$, yieldsBalance$, lpTokenBalance$]).pipe(
      mergeMap(([principalsBalance, yieldsBalance, lpTokenBalance]) =>
        from(
          this.estimateExitAndRedeem(
            address,
            ammAddress,
            lpTokenBalance,
            principalsBalance,
            yieldsBalance,
            isBackingToken,
            overrides,
          ),
        ),
      ),
    );

    const userPoolBalanceInUSD$ = combineLatest([exitEstimate$, backingTokenRate$]).pipe(
      map(([exitEstimate, backingTokenRate]) => {
        if (!backingTokenRate) {
          return null;
        }

        const userPoolBalanceInBackingToken = exitEstimate.tokenAmount;
        const userPoolBalanceInBackingToken18f = increasePrecision(
          userPoolBalanceInBackingToken,
          DEFAULT_TOKEN_PRECISION - (tokenPrecision.backingToken ?? DEFAULT_TOKEN_PRECISION),
        );
        const userPoolBalanceInUSD = backingTokenRate.mul(userPoolBalanceInBackingToken18f);
        return userPoolBalanceInUSD;
      }),
    );

    return userPoolBalanceInUSD$;
  }

  /**
   * Returns estimated amount of Principals tokens on fixed yield deposit
   * */
  estimatedDepositAndFix(
    tempusPool: TempusPool,
    tokenAmount: Decimal,
    isBackingToken: boolean,
    overrides?: CallOverrides,
  ): Observable<Decimal> {
    if (!this.stats) {
      console.error(
        'StatisticsService - estimatedDepositAndFix: Attempted to use statistics contract before initializing it...',
      );
      return of(ZERO);
    }

    if (!tokenAmount) {
      console.error('StatisticsService - estimatedDepositAndFix: invalid tokenAmount');
      return of(ZERO);
    }

    const precision = isBackingToken
      ? tempusPool.tokenPrecision.backingToken
      : tempusPool.tokenPrecision.yieldBearingToken;

    try {
      if (overrides) {
        return from(
          this.stats.estimatedDepositAndFix(
            tempusPool.ammAddress,
            tokenAmount.toBigNumber(precision),
            isBackingToken,
            overrides,
          ),
        ).pipe(map(value => new Decimal(value, tempusPool.tokenPrecision.principals)));
      }
      return from(
        this.stats.estimatedDepositAndFix(tempusPool.ammAddress, tokenAmount.toBigNumber(precision), isBackingToken),
      ).pipe(map(value => new Decimal(value, tempusPool.tokenPrecision.principals)));
    } catch (error) {
      console.error('StatisticsService - estimatedDepositAndFix - Failed to get estimated fixed deposit amount', error);
      return of(ZERO);
    }
  }

  /**
   * Returns estimated amount of Principals tokens on variable yield deposit
   * */
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
      console.error('Failed to get estimated variable deposit amount', error);
      return Promise.reject(0);
    }
  }

  /**
   * Returns estimated amount of Backing/Yield Bearing tokens on deposit
   * */
  async estimateExitAndRedeem(
    tempusPoolAddress: string,
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
    if (!this.stats || !this.tempusAMMService || !this.getConfig) {
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

    const config = this.getConfig();

    const principalsPrecision = getTokenPrecision(tempusPoolAddress, 'principals', config);
    const lpTokenPrecision = getTokenPrecision(tempusPoolAddress, 'lpTokens', config);

    let lpTokensAmountParsed = lpAmount;
    if (lpTokenPrecision > principalsPrecision) {
      lpTokensAmountParsed = decreasePrecision(lpAmount, lpTokenPrecision - principalsPrecision);
    }

    const maxLeftoverShares = this.tempusAMMService.getMaxLeftoverShares(
      principalAmount,
      yieldsAmount,
      lpTokensAmountParsed,
    );

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
      }
      return await this.stats.estimateExitAndRedeem(
        tempusAmmAddress,
        lpAmount,
        principalAmount,
        yieldsAmount,
        maxLeftoverShares,
        isBackingToken,
      );
    } catch (error) {
      console.error('Failed to get estimated withdraw amount', error);
      console.log('Debug info:');
      console.log(`TempusAMM address: ${tempusAmmAddress}`);
      console.log(`LP Token amount: ${lpAmount.toHexString()} ${ethers.utils.formatUnits(lpAmount)}`);
      console.log(`Principals amount: ${principalAmount.toHexString()} ${ethers.utils.formatUnits(principalAmount)}`);
      console.log(`Yields amount: ${yieldsAmount.toHexString()} ${ethers.utils.formatUnits(yieldsAmount)}`);
      console.log(
        `Max leftover shares: ${maxLeftoverShares.toHexString()} ${ethers.utils.formatUnits(maxLeftoverShares)}`,
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
      }
      return await this.stats.estimatedMintedShares(tempusPool, amount, isBackingToken);
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
