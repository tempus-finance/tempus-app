import { BigNumber } from 'ethers';
import { combineLatest, from, Observable, of, switchMap, throwError, timer } from 'rxjs';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { POLLING_INTERVAL } from '../constants';
import { TempusPool } from '../interfaces/TempusPool';
import { mul18f } from '../utils/weiMath';
import StatisticsService from '../services/StatisticsService';
import getERC20TokenService from '../services/getERC20TokenService';

type UserBalanceDataAdapterParameters = {
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
  statisticsService: StatisticsService;
  eRC20TokenServiceGetter: typeof getERC20TokenService;
};

export default class UserBalanceDataAdapter {
  private statisticsService: StatisticsService | null = null;
  private eRC20TokenServiceGetter: null | typeof getERC20TokenService = null;

  public init(params: UserBalanceDataAdapterParameters) {
    this.statisticsService = params.statisticsService;
    this.eRC20TokenServiceGetter = params.eRC20TokenServiceGetter;
  }

  getUserUSDBalanceForPool(
    tempusPool: TempusPool,
    userWalletAddress: string,
    userWalletSigner: JsonRpcSigner,
  ): Observable<BigNumber> {
    if (!this.statisticsService) {
      return throwError(() => new Error('UserBalanceDataAdapter - getUserBalanceForPool() - Adapter not initialized!'));
    }

    const interval$ = timer(0, POLLING_INTERVAL);
    return interval$
      .pipe(
        // Fetch user balance for (principals, yields and LP tokens)
        switchMap(() => {
          if (this.eRC20TokenServiceGetter) {
            const principalsService = this.eRC20TokenServiceGetter(tempusPool.principalsAddress, userWalletSigner);
            const yieldsService = this.eRC20TokenServiceGetter(tempusPool.yieldsAddress, userWalletSigner);
            const lpTokenService = this.eRC20TokenServiceGetter(tempusPool.ammAddress, userWalletSigner);

            const principalsBalance$ = from(principalsService.balanceOf(userWalletAddress));
            const yieldsBalance$ = from(yieldsService.balanceOf(userWalletAddress));
            const lpTokenBalance$ = from(lpTokenService.balanceOf(userWalletAddress));

            return combineLatest([principalsBalance$, yieldsBalance$, lpTokenBalance$]);
          }
          return throwError(
            () => new Error('UserBalanceDataAdapter - getUserBalanceForPool() - Adapter not initialized!'),
          );
        }),
      )
      .pipe(
        // Fetch backing token rate and user balance in backing tokens
        switchMap(([userPrincipalsBalance, userYieldsBalance, userLPBalance]) => {
          if (this.statisticsService) {
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
      )
      .pipe(
        // Convert balance in backing tokens to USD
        switchMap(([backingTokenRate, presentValueInBackingTokens]) => {
          if (this.statisticsService) {
            return of(mul18f(presentValueInBackingTokens, backingTokenRate));
          }
          return throwError(
            () => new Error('UserBalanceDataAdapter - getUserBalanceForPool() - Adapter not initialized!'),
          );
        }),
      );
  }
}
