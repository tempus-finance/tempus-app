import { BigNumber, ethers } from 'ethers';
import { combineLatest, from, Observable, of, switchMap, throwError, timer, catchError } from 'rxjs';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { POLLING_INTERVAL, ZERO } from '../constants';
import { TempusPool } from '../interfaces/TempusPool';
import { increasePrecision, mul18f } from '../utils/weiMath';
import StatisticsService from '../services/StatisticsService';
import getERC20TokenService from '../services/getERC20TokenService';
import TempusPoolService from '../services/TempusPoolService';
import { AvailableToDeposit } from '../state/PoolDataState';
import { Networks } from '../state/NetworkState';

type UserBalanceDataAdapterParameters = {
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
  statisticsService: StatisticsService;
  tempusPoolService: TempusPoolService;
  network: Networks;
  eRC20TokenServiceGetter: typeof getERC20TokenService;
};

export default class UserBalanceDataAdapter {
  private network: Networks | null = null;
  private statisticsService: StatisticsService | null = null;
  private tempusPoolService: TempusPoolService | null = null;
  private eRC20TokenServiceGetter: null | typeof getERC20TokenService = null;

  public init(params: UserBalanceDataAdapterParameters) {
    this.network = params.network;
    this.statisticsService = params.statisticsService;
    this.tempusPoolService = params.tempusPoolService;
    this.eRC20TokenServiceGetter = params.eRC20TokenServiceGetter;
  }

  getUserUSDBalanceForPool(
    tempusPool: TempusPool,
    userWalletAddress: string,
    userWalletSigner: JsonRpcSigner,
  ): Observable<BigNumber[]> {
    if (!this.statisticsService) {
      return throwError(() => new Error('UserBalanceDataAdapter - getUserBalanceForPool() - Adapter not initialized!'));
    }

    const interval$ = timer(0, POLLING_INTERVAL);
    return interval$
      .pipe(
        // Fetch user balance for (principals, yields and LP tokens)
        switchMap(() => {
          if (this.eRC20TokenServiceGetter && this.network) {
            try {
              const principalsService = this.eRC20TokenServiceGetter(
                tempusPool.principalsAddress,
                this.network,
                userWalletSigner,
              );
              const yieldsService = this.eRC20TokenServiceGetter(
                tempusPool.yieldsAddress,
                this.network,
                userWalletSigner,
              );
              const lpTokenService = this.eRC20TokenServiceGetter(
                tempusPool.ammAddress,
                this.network,
                userWalletSigner,
              );

              const principalsBalance$ = from(principalsService.balanceOf(userWalletAddress));
              const yieldsBalance$ = from(yieldsService.balanceOf(userWalletAddress));
              const lpTokenBalance$ = from(lpTokenService.balanceOf(userWalletAddress));

              return combineLatest([principalsBalance$, yieldsBalance$, lpTokenBalance$]);
            } catch (error: any) {
              throwError(() => new Error(error));
            }
          }
          return throwError(
            () => new Error('UserBalanceDataAdapter - getUserBalanceForPool() - Adapter not initialized!'),
          );
        }),
        catchError(error => {
          console.error('UserBalanceDataAdapter - getUserBalanceForPool() - Adapter not initialized!', error);
          return of([]);
        }),
      )
      .pipe(
        // Fetch backing token rate and user balance in backing tokens
        switchMap(([userPrincipalsBalance, userYieldsBalance, userLPBalance]) => {
          if (this.statisticsService && userPrincipalsBalance && userYieldsBalance && userLPBalance) {
            const backingTokenRate$ = from(this.statisticsService.getRate(tempusPool.backingToken));
            const presentValueInBackingTokens$ = from(
              this.statisticsService.estimateExitAndRedeem(
                tempusPool.ammAddress,
                userLPBalance,
                userPrincipalsBalance,
                userYieldsBalance,
                true,
              ),
            );
            return combineLatest([backingTokenRate$, presentValueInBackingTokens$]);
          }
          return throwError(
            () => new Error('UserBalanceDataAdapter - getUserBalanceForPool() - Adapter not initialized!'),
          );
        }),
        catchError(error => {
          console.error('UserBalanceDataAdapter - getUserBalanceForPool() - Adapter not initialized!', error);
          return of([]);
        }),
      )
      .pipe(
        switchMap(([backingTokenRate, exitEstimate]) => {
          if (this.statisticsService && backingTokenRate && exitEstimate.tokenAmount) {
            const userPoolBalanceInFiat = mul18f(exitEstimate.tokenAmount, backingTokenRate);
            return of([userPoolBalanceInFiat, exitEstimate.tokenAmount]);
          }
          return throwError(
            () => new Error('UserBalanceDataAdapter - getUserBalanceForPool() - Adapter not initialized!'),
          );
        }),
        catchError(error => {
          console.error('UserBalanceDataAdapter - getUserBalanceForPool() - Adapter not initialized!', error);
          return of([ZERO, ZERO]);
        }),
      );
  }

  async getUserAvailableToDepositForPool(
    tempusPool: TempusPool,
    userWalletAddress: string,
    userWalletSigner: JsonRpcSigner,
    backingTokenPrecision: number,
    yieldBearingTokenPrecision: number,
  ): Promise<AvailableToDeposit> {
    if (!this.statisticsService || !this.tempusPoolService || !this.eRC20TokenServiceGetter || !this.network) {
      return Promise.reject('UserBalanceDataAdapter - getUserBalanceForPool() - Adapter not initialized!');
    }

    try {
      const backingToken = this.eRC20TokenServiceGetter(tempusPool.backingTokenAddress, this.network, userWalletSigner);
      const yieldBearingToken = this.eRC20TokenServiceGetter(
        tempusPool.yieldBearingTokenAddress,
        this.network,
        userWalletSigner,
      );
      const [backingTokensAvailable, yieldTokensAvailable, backingTokenToUSD, interestRate] = await Promise.all([
        backingToken.balanceOf(userWalletAddress),
        yieldBearingToken.balanceOf(userWalletAddress),
        this.statisticsService.getRate(tempusPool.backingToken),
        this.tempusPoolService.currentInterestRate(tempusPool.address),
      ]);

      const yieldBearingToBackingTokenRate = await this.tempusPoolService.numAssetsPerYieldToken(
        tempusPool.address,
        ethers.utils.parseEther('1'),
        interestRate,
      );

      const backingTokenValueInFiat = mul18f(
        backingTokensAvailable,
        backingTokenToUSD,
        tempusPool.tokenPrecision.backingToken,
      );
      const yieldBearingTokenValueInBackingToken = mul18f(yieldTokensAvailable, yieldBearingToBackingTokenRate);
      const yieldBearingTokenValueInFiat = mul18f(
        yieldBearingTokenValueInBackingToken,
        // TODO - Handle a case in which backingTokenPrecision > yieldBearingTokenPrecision
        backingTokenPrecision < yieldBearingTokenPrecision
          ? increasePrecision(backingTokenToUSD, yieldBearingTokenPrecision - backingTokenPrecision)
          : backingTokenToUSD,
        tempusPool.tokenPrecision.yieldBearingToken,
      );

      return {
        backingTokenValueInFiat,
        yieldBearingTokenValueInFiat,
        backingTokensAvailable,
        yieldBearingTokenValueInBackingToken,
      };
    } catch (error) {
      console.error('UserBalanceDatAdapter - getUserUSDAvailableToDepositForPool', error);
      return Promise.reject();
    }
  }
}
