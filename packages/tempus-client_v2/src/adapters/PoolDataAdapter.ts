import { BigNumber, ContractTransaction, ethers } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Observable, from, of, interval, switchMap, combineLatest, map, throwError, timer } from 'rxjs';
import TempusAMMService from '../services/TempusAMMService';
import StatisticsService from '../services/StatisticsService';
import TempusControllerService, { DepositedEvent, RedeemedEvent } from '../services/TempusControllerService';
import TempusPoolService from '../services/TempusPoolService';
import getERC20TokenService from '../services/getERC20TokenService';
import VaultService, { SwapEvent, SwapKind } from '../services/VaultService';
import { TransferEventListener } from '../services/ERC20TokenService';
import getDefaultProvider from '../services/getDefaultProvider';
import { getEventBackingTokenValue } from '../services/EventUtils';
import { div18f, mul18f } from '../utils/weiMath';
import {
  BLOCK_DURATION_SECONDS,
  DAYS_IN_A_YEAR,
  ONE_ETH_IN_WEI,
  POLLING_INTERVAL,
  SECONDS_IN_A_DAY,
  ZERO_ETH_ADDRESS,
} from '../constants';
import { Ticker } from '../interfaces/Token';
import { TempusPool } from '../interfaces/TempusPool';
import { SelectedYield } from '../interfaces/SelectedYield';

export interface UserTransaction {
  event: DepositedEvent | RedeemedEvent;
  block: ethers.providers.Block;
  usdValue: BigNumber;
}

type PoolDataAdapterParameters = {
  tempusControllerAddress: string;
  tempusControllerService: TempusControllerService;
  tempusPoolService: TempusPoolService;
  statisticService: StatisticsService;
  tempusAMMService: TempusAMMService;
  vaultService: VaultService;
  eRC20TokenServiceGetter: typeof getERC20TokenService;
};

export default class PoolDataAdapter {
  private tempusControllerService: TempusControllerService | undefined = undefined;
  private tempusControllerAddress: string = '';
  private tempusPoolService: TempusPoolService | null = null;
  private statisticService: StatisticsService | null = null;
  private tempusAMMService: TempusAMMService | null = null;
  private vaultService: VaultService | null = null;
  private eRC20TokenServiceGetter: null | typeof getERC20TokenService = null;

  init({
    tempusControllerService,
    tempusControllerAddress,
    tempusPoolService,
    statisticService,
    tempusAMMService,
    vaultService,
    eRC20TokenServiceGetter,
  }: PoolDataAdapterParameters) {
    this.tempusControllerService = tempusControllerService;
    this.tempusControllerAddress = tempusControllerAddress;
    this.tempusPoolService = tempusPoolService;
    this.statisticService = statisticService;
    this.tempusAMMService = tempusAMMService;
    this.vaultService = vaultService;
    this.eRC20TokenServiceGetter = eRC20TokenServiceGetter;
  }

  retrieveBalances(
    tempusPoolAddress: string,
    tempusAMMAddress: string,
    userWalletAddress: string,
    signer: JsonRpcSigner,
  ): Observable<{
    backingTokenBalance: BigNumber;
    backingTokenRate: BigNumber;
    yieldBearingTokenBalance: BigNumber;
    yieldBearingTokenRate: BigNumber;
    principalsTokenBalance: BigNumber;
    yieldsTokenBalance: BigNumber;
    lpTokensBalance: BigNumber;
  }> {
    if (!userWalletAddress) {
      console.error(
        'PoolDataAdapter - retrieveBalances() - Attempted to use PoolDataAdapter before connecting user wallet!',
      );
      return throwError(() => new Error());
    }

    if (!this.tempusPoolService || !this.statisticService || !this.eRC20TokenServiceGetter) {
      console.error('PoolDataAdapter - retrieveBalances() - Attempted to use PoolDataAdapter before initializing it!');
      return throwError(() => new Error());
    }

    const yieldTokenAmount = ethers.utils.parseEther('1');

    try {
      const ticker$ = timer(0, POLLING_INTERVAL);

      return combineLatest([
        from(this.getTokenServices(tempusPoolAddress, tempusAMMAddress, signer)),
        from(this.tempusPoolService.currentInterestRate(tempusPoolAddress)),
        from(this.tempusPoolService.getBackingTokenTicker(tempusPoolAddress)),
        ticker$,
      ]).pipe(
        map(([services, interestRate, backingTokenTicker]) => {
          return {
            services,
            interestRate,
            backingTokenTicker,
          };
        }),
        switchMap(payload => {
          if (this.tempusPoolService) {
            return combineLatest([
              of(payload),
              from(
                this.tempusPoolService.numAssetsPerYieldToken(
                  tempusPoolAddress,
                  yieldTokenAmount,
                  payload.interestRate,
                ),
              ),
            ]);
          }
          return throwError(() => new Error());
        }),
        switchMap(payload => {
          if (payload && this.statisticService) {
            const [originalPayload, yieldBearingTokenConversionRate] = payload;
            const {
              backingTokenTicker,
              services: {
                backingTokenService,
                yieldBearingTokenService,
                principalsTokenService,
                yieldsTokenService,
                lpTokenService,
              },
            } = originalPayload;

            return combineLatest([
              from(backingTokenService.balanceOf(userWalletAddress)),
              from(yieldBearingTokenService.balanceOf(userWalletAddress)),
              from(principalsTokenService.balanceOf(userWalletAddress)),
              from(yieldsTokenService.balanceOf(userWalletAddress)),
              from(this.statisticService.getRate(backingTokenTicker)),
              from(lpTokenService.balanceOf(userWalletAddress)),
              of(yieldBearingTokenConversionRate),
            ]);
          }
          return throwError(() => new Error());
        }),
        map(result => {
          const [
            backingTokenBalance,
            yieldBearingTokenBalance,
            principalsTokenBalance,
            yieldsTokenBalance,
            backingTokenRate,
            lpTokensBalance,
            yieldBearingTokenConversionRate,
          ] = result;
          return {
            backingTokenBalance,
            backingTokenRate,
            yieldBearingTokenBalance,
            yieldBearingTokenRate: mul18f(yieldBearingTokenConversionRate, backingTokenRate),
            principalsTokenBalance,
            yieldsTokenBalance,
            lpTokensBalance,
          };
        }),
      );
    } catch (error) {
      console.error('PoolDataAdapter - retrieveBalances() - Failed to retrieve balances!', error);
      return throwError(() => new Error());
    }
  }

  async getTokenBalance(address: string, userAddress: string, signer: JsonRpcSigner): Promise<BigNumber> {
    if (!this.eRC20TokenServiceGetter) {
      return Promise.reject();
    }

    const tokenService = this.eRC20TokenServiceGetter(address, signer);
    try {
      return await tokenService.balanceOf(userAddress);
    } catch (error) {
      console.error('PoolDataAdapter - getTokenBalance() - Failed to get token balance!', error);
      return Promise.reject(error);
    }
  }

  async getEstimatedDepositAmount(
    tempusAmmAddress: string,
    tokenAmount: BigNumber,
    isBackingToken: boolean,
  ): Promise<{
    fixedDeposit: BigNumber;
    variableDeposit: BigNumber[];
  }> {
    if (!this.statisticService) {
      console.error(
        'PoolDataAdapter - getEstimatedDepositAmount() - Attempted to use PoolDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    if (!tempusAmmAddress || tokenAmount === undefined) {
      console.error('PoolDataAdapter - getEstimatedDepositAmount() - Tempus AMM address or token amount not valid');
      return Promise.reject();
    }

    try {
      const [fixedDeposit, variableDeposit] = await Promise.all([
        this.statisticService.estimatedDepositAndFix(tempusAmmAddress, tokenAmount, isBackingToken),
        this.statisticService.estimatedDepositAndProvideLiquidity(tempusAmmAddress, tokenAmount, isBackingToken),
      ]);

      return {
        fixedDeposit,
        variableDeposit, // [lpTokens, principals, yields]
      };
    } catch (error) {
      console.error('PoolDataAdapter - getEstimatedDepositAmount() - Failed to retrieve balances!', error);
      return Promise.reject();
    }
  }

  getEstimatedWithdrawAmount(
    tempusAmmAddress: string,
    lpAmount: BigNumber,
    principalAmount: BigNumber,
    yieldsAmount: BigNumber,
    isBackingToken: boolean,
  ): Observable<{
    tokenAmount: BigNumber;
    principalsStaked: BigNumber;
    yieldsStaked: BigNumber;
    principalsRate: BigNumber;
    yieldsRate: BigNumber;
  }> {
    if (!this.statisticService) {
      console.error(
        'PoolDataAdapter - getEstimatedWithdrawAmount() - Attempted to use PoolDataAdapter before initializing it!',
      );
      return throwError(() => new Error());
    }

    try {
      return from(
        this.statisticService.estimateExitAndRedeem(
          tempusAmmAddress,
          lpAmount,
          principalAmount,
          yieldsAmount,
          isBackingToken,
        ),
      );
    } catch (error) {
      console.error(
        'PoolDataAdapter - getEstimatedWithdrawAmount() - Failed to retrieve estimated withdraw amount!',
        error,
      );
      return throwError(() => new Error());
    }
  }

  async estimatedRedeem(
    tempusPool: string,
    yieldsAmount: BigNumber,
    principalsAmount: BigNumber,
    toBackingToken: boolean,
  ) {
    if (!this.statisticService) {
      console.error('PoolDataAdapter - estimateRedeem() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    return this.statisticService.estimatedRedeem(tempusPool, yieldsAmount, principalsAmount, toBackingToken);
  }

  async approve(
    tempusPoolAddress: string,
    isBackingToken: boolean,
    signer: JsonRpcSigner,
    approveAmount: BigNumber,
  ): Promise<ContractTransaction | void> {
    if (!this.tempusPoolService || !this.eRC20TokenServiceGetter) {
      console.error('PoolDataAdapter - approve() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    try {
      const tokenAddress = isBackingToken
        ? await this.tempusPoolService.getBackingTokenAddress(tempusPoolAddress)
        : await this.tempusPoolService.getYieldBearingTokenAddress(tempusPoolAddress);

      const tokenService = this.eRC20TokenServiceGetter(tokenAddress, signer);
      return tokenService.approve(this.tempusControllerAddress, approveAmount);
    } catch (error) {
      console.error('PoolDataAdapter - approve() - Failed to approve tokens for deposit!', error);
      Promise.reject();
    }
  }

  async approveToken(
    tokenAddress: string,
    spenderAddress: string,
    amount: BigNumber,
    signer: JsonRpcSigner,
  ): Promise<ContractTransaction | void> {
    if (!this.eRC20TokenServiceGetter) {
      console.error('PoolDataAdapter - approveToken() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    const tokenService = this.eRC20TokenServiceGetter(tokenAddress, signer);
    try {
      return await tokenService.approve(spenderAddress, amount);
    } catch (error) {
      console.error('PoolDataAdapter - approveToken() - Failed to approve token amount!', error);
      return Promise.reject(error);
    }
  }

  async getApprovedAllowance(
    userWalletAddress: string,
    tempusPoolAddress: string,
    isBackingToken: boolean,
    signer: JsonRpcSigner,
  ): Promise<number> {
    if (!this.tempusPoolService || !this.eRC20TokenServiceGetter) {
      console.error(
        'PoolDataAdapter - getApprovedAllowance() - Attempted to use PoolDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    try {
      const tokenAddress = isBackingToken
        ? await this.tempusPoolService.getBackingTokenAddress(tempusPoolAddress)
        : await this.tempusPoolService.getYieldBearingTokenAddress(tempusPoolAddress);

      // In case of ETH, total user balance is always approved.
      if (tokenAddress === ZERO_ETH_ADDRESS) {
        return Number(ethers.utils.formatEther(await signer.getBalance()));
      }

      const tokenService = this.eRC20TokenServiceGetter(tokenAddress, signer);
      const allowance = await tokenService.getAllowance(userWalletAddress, this.tempusControllerAddress);
      if (allowance) {
        return parseFloat(ethers.utils.formatEther(allowance));
      }
      return 0;
    } catch (error) {
      console.error('PoolDataAdapter - approve() - Failed to approve tokens for deposit!', error);
      return Promise.reject();
    }
  }

  async getTokenAllowance(
    tokenAddress: string,
    spender: string,
    userWalletAddress: string,
    signer: JsonRpcSigner,
  ): Promise<BigNumber> {
    if (!this.tempusPoolService || !this.eRC20TokenServiceGetter) {
      console.error(
        'PoolDataAdapter - getApprovedAllowance() - Attempted to use PoolDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    try {
      // In case of ETH, total user balance is always approved.
      if (tokenAddress === ZERO_ETH_ADDRESS) {
        return await signer.getBalance();
      }

      const tokenService = this.eRC20TokenServiceGetter(tokenAddress, signer);

      return await tokenService.getAllowance(userWalletAddress, spender);
    } catch (error) {
      console.error('PoolDataAdapter - approve() - Failed to approve tokens for deposit!', error);
      return Promise.reject();
    }
  }

  async executeDeposit(
    tempusAMM: string,
    tokenAmount: BigNumber,
    isBackingToken: boolean,
    minTYSRate: BigNumber,
    yieldType: SelectedYield,
    isEthDeposit?: boolean,
  ): Promise<ContractTransaction | undefined> {
    if (!this.tempusControllerService) {
      console.error('PoolDataAdapter - executeDeposit() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    try {
      if (yieldType === 'Fixed') {
        return await this.tempusControllerService.depositAndFix(
          tempusAMM,
          tokenAmount,
          isBackingToken,
          minTYSRate,
          isEthDeposit,
        );
      } else if (yieldType === 'Variable') {
        return await this.tempusControllerService.depositAndProvideLiquidity(
          tempusAMM,
          tokenAmount,
          isBackingToken,
          isEthDeposit,
        );
      }
    } catch (error) {
      console.error(`TempusPoolService - executeDeposit() - Failed to make a deposit to the pool!`, error);
      return Promise.reject(error);
    }
  }

  async executeWithdraw(
    tempusAMM: string,
    userPrincipalsBalance: BigNumber,
    userYieldsBalance: BigNumber,
    userLPBalance: BigNumber,
    minPrincipalsStaked: BigNumber,
    minYieldsStaked: BigNumber,
    isBackingToken: boolean,
  ): Promise<ContractTransaction | undefined> {
    if (!this.tempusControllerService) {
      console.error('PoolDataAdapter - executeWithdraw() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    try {
      return await this.tempusControllerService.exitTempusAmmAndRedeem(
        tempusAMM,
        userLPBalance,
        userPrincipalsBalance,
        userYieldsBalance,
        minPrincipalsStaked,
        minYieldsStaked,
        isBackingToken,
      );
    } catch (error) {
      console.error(`TempusPoolService - executeWithdraw() - Failed to make a deposit to the pool!`, error);
      return Promise.reject(error);
    }
  }

  async getExpectedReturnForLPTokens(
    tempusAMMAddress: string,
    lpTokenAmount: BigNumber,
  ): Promise<{
    principals: BigNumber;
    yields: BigNumber;
  }> {
    if (!this.tempusAMMService) {
      console.error(
        'PoolDataAdapter - getExpectedReturnForLPTokens() - Attempted to use PoolDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    if (lpTokenAmount.isZero()) {
      return {
        principals: BigNumber.from('0'),
        yields: BigNumber.from('0'),
      };
    }

    try {
      return await this.tempusAMMService.getExpectedTokensOutGivenBPTIn(tempusAMMAddress, lpTokenAmount);
    } catch (error) {
      console.error(
        'PoolDataAdapter - getExpectedReturnForLPTokens() - Failed to fetch expected token return from LP Tokens',
      );
      return Promise.reject(error);
    }
  }

  async getExpectedLPTokensForShares(
    tempusAMM: string,
    principalsAddress: string,
    yieldsAddress: string,
    principalsIn: BigNumber,
    yieldsIn: BigNumber,
  ): Promise<BigNumber> {
    if (!this.tempusAMMService) {
      console.error(
        'PoolDataAdapter - getExpectedLPTokensForShares() - Attempted to use PoolDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    try {
      return await this.tempusAMMService.getExpectedLPTokensForTokensIn(
        tempusAMM,
        principalsAddress,
        yieldsAddress,
        principalsIn,
        yieldsIn,
      );
    } catch (error) {
      console.error(
        'PoolDataAdapter - getExpectedLPTokensForShares() - Failed to fetch expected LP token return!',
        error,
      );
      return Promise.reject(error);
    }
  }

  async getPoolRatioOfAssets(
    tempusAMM: string,
    principalsAddress: string,
    yieldsAddress: string,
  ): Promise<{ principalsShare: number; yieldsShare: number }> {
    if (!this.vaultService || !this.tempusAMMService) {
      return Promise.reject();
    }

    const poolId = await this.tempusAMMService.poolId(tempusAMM);

    const poolTokens = await this.vaultService.getPoolTokens(poolId);
    const principalsIndex = poolTokens.tokens.findIndex(poolTokenAddress => principalsAddress === poolTokenAddress);
    const yieldsIndex = poolTokens.tokens.findIndex(poolTokenAddress => yieldsAddress === poolTokenAddress);
    const poolShareBalance = {
      principals: poolTokens.balances[principalsIndex],
      yields: poolTokens.balances[yieldsIndex],
    };

    if (poolShareBalance.principals.isZero() && poolShareBalance.yields.isZero()) {
      return {
        principalsShare: 0,
        yieldsShare: 0,
      };
    } else if (poolShareBalance.principals.isZero() && !poolShareBalance.yields.isZero()) {
      return {
        principalsShare: 0,
        yieldsShare: 1,
      };
    } else if (!poolShareBalance.principals.isZero() && poolShareBalance.yields.isZero()) {
      return {
        principalsShare: 1,
        yieldsShare: 0,
      };
    } else {
      const totalTokens = poolShareBalance.principals.add(poolShareBalance.yields);

      return {
        principalsShare: Number(ethers.utils.formatEther(div18f(poolShareBalance.principals, totalTokens))),
        yieldsShare: Number(ethers.utils.formatEther(div18f(poolShareBalance.yields, totalTokens))),
      };
    }
  }

  async getPoolShareForLPTokensIn(tempusAmm: string, amountIn: BigNumber): Promise<number> {
    if (!this.vaultService || !this.eRC20TokenServiceGetter) {
      console.error(
        'PoolDataAdapter - getPoolShareForLPTokensIn() - Attempted to use PoolDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    let lpTotalSupply: BigNumber;
    try {
      lpTotalSupply = await this.eRC20TokenServiceGetter(tempusAmm).totalSupply();
      if (lpTotalSupply.isZero()) {
        return 1;
      }
    } catch (error) {
      console.error('PoolDataAdapter - getPoolShareForLPTokensIn() - Failed to fetch total LP supply!', error);
      return Promise.reject(error);
    }

    return Number(ethers.utils.formatEther(div18f(amountIn, amountIn.add(lpTotalSupply))));
  }

  async provideLiquidity(
    tempusAmm: string,
    userWalletAddress: string,
    principalsAddress: string,
    yieldsAddress: string,
    principalsIn: BigNumber,
    yieldsIn: BigNumber,
  ): Promise<ContractTransaction> {
    if (!this.vaultService || !this.tempusAMMService) {
      console.error('PoolDataAdapter - provideLiquidity() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    try {
      const poolId = await this.tempusAMMService.poolId(tempusAmm);
      return await this.vaultService.provideLiquidity(
        poolId,
        userWalletAddress,
        principalsAddress,
        yieldsAddress,
        principalsIn,
        yieldsIn,
      );
    } catch (error) {
      console.error('PoolDataAdapter - provideLiquidity() - Failed to provide liquidity to tempus pool AMM!', error);
      return Promise.reject();
    }
  }

  async removeLiquidity(
    tempusAmm: string,
    userWalletAddress: string,
    principalsAddress: string,
    yieldsAddress: string,
    lpAmount: BigNumber,
  ): Promise<ContractTransaction> {
    if (!this.vaultService || !this.tempusAMMService) {
      console.error('PoolDataAdapter - removeLiquidity() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    try {
      const poolId = await this.tempusAMMService.poolId(tempusAmm);
      return await this.vaultService.removeLiquidity(
        poolId,
        userWalletAddress,
        principalsAddress,
        yieldsAddress,
        lpAmount,
      );
    } catch (error) {
      console.error('PoolDataAdapter - removeLiquidity() - Failed to remove liquidity from tempus pool AMM!', error);
      return Promise.reject();
    }
  }

  async getUserTransactionEvents(
    tempusPoolAddress: string,
    userWalletAddress: string,
    backingTokenTicker: Ticker,
  ): Promise<UserTransaction[]> {
    if (!this.tempusControllerService || !this.statisticService) {
      console.error(
        'PoolDataAdapter - getUserTransactions() - Attempted to use PoolDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    let events: (DepositedEvent | RedeemedEvent)[] = [];
    try {
      // TODO - Swap events (transactions) do not contain user address - if they do at some point we should include them here.
      const [depositedEvents, redeemedEvents] = await Promise.all([
        this.tempusControllerService.getDepositedEvents({ forPool: tempusPoolAddress, forUser: userWalletAddress }),
        this.tempusControllerService.getRedeemedEvents({ forPool: tempusPoolAddress, forUser: userWalletAddress }),
      ]);
      events = [...depositedEvents, ...redeemedEvents];
    } catch (error) {
      console.error('PoolDataAdapter - getUserTransactions() - Failed to fetch user events!', error);
      return Promise.reject(error);
    }

    let backingTokenRate: BigNumber;
    try {
      backingTokenRate = await this.statisticService.getRate(backingTokenTicker);
    } catch (error) {
      console.error(
        'PoolDataAdapter - getUserTransactions() - Failed to fetch backing token conversion rate to USD!',
        error,
      );
      return Promise.reject(error);
    }

    let userTransactions: UserTransaction[] = [];
    try {
      userTransactions = await Promise.all(
        events.map(async event => {
          if (!this.statisticService) {
            console.error(
              'PoolDataAdapter - getUserTransactions() - Attempted to use PoolDataAdapter before initializing it!',
            );
            return Promise.reject();
          }

          const eventBlock = await event.getBlock();

          return {
            event: event,
            block: eventBlock,
            usdValue: mul18f(event.args.backingTokenValue, backingTokenRate),
          };
        }),
      );
    } catch (error) {
      console.error('PoolDataAdapter - getUserTransactions() - Failed to fetch user transaction data!', error);
      return Promise.reject(error);
    }

    return userTransactions;
  }

  async getEstimatedFixedApr(
    tokenAmount: BigNumber,
    isBackingToken: boolean,
    tempusPoolAddress: string,
    tempusAMMAddress: string,
  ): Promise<BigNumber> {
    if (!this.tempusPoolService || !this.tempusAMMService || !this.statisticService) {
      console.error(
        'PoolDataAdapter - getEstimatedFixedApr() - Attempted to use PoolDataAdapter before initializing it.',
      );
      return Promise.reject();
    }

    if (!tokenAmount) {
      console.error('PoolDataAdapter - getEstimatedFixedApr() - Invalid backingTokenAmount amount.');
      return Promise.reject();
    }

    try {
      const [tempusPoolStartTime, tempusPoolMaturityTime] = await Promise.all([
        this.tempusPoolService.getStartTime(tempusPoolAddress),
        this.tempusPoolService.getMaturityTime(tempusPoolAddress),
      ]);

      const poolDuration = (tempusPoolMaturityTime.getTime() - tempusPoolStartTime.getTime()) / 1000;
      const scaleFactor = ethers.utils.parseEther(((SECONDS_IN_A_DAY * DAYS_IN_A_YEAR) / poolDuration).toString());

      const principals = await this.statisticService.estimatedDepositAndFix(
        tempusAMMAddress,
        tokenAmount,
        isBackingToken,
      );

      if (isBackingToken) {
        const ratio = div18f(principals, tokenAmount);
        const pureInterest = ratio.sub(BigNumber.from(ONE_ETH_IN_WEI));
        return mul18f(pureInterest, scaleFactor);
      }
      const interestRate = await this.tempusPoolService.currentInterestRate(tempusPoolAddress);

      const backingAmount = await this.tempusPoolService.numAssetsPerYieldToken(
        tempusPoolAddress,
        tokenAmount,
        interestRate,
      );

      const ratio = div18f(principals, backingAmount);
      const pureInterest = ratio.sub(BigNumber.from(ONE_ETH_IN_WEI));
      return mul18f(pureInterest, scaleFactor);
    } catch (error) {
      console.error('PoolDataAdapter - getEstimatedFixedApr() - Failed to get value.', error);
      return Promise.reject();
    }
  }

  async getExpectedReturnForShareToken(tempusAmm: string, amount: BigNumber, yieldShareIn: boolean) {
    if (!this.tempusAMMService) {
      return Promise.reject();
    }

    try {
      return await this.tempusAMMService.getExpectedReturnGivenIn(tempusAmm, amount, yieldShareIn);
    } catch (error) {
      console.error('PoolDataAdapter - getExpectedReturnForShareToken() - Failed to get expected return value!', error);
      return Promise.reject(error);
    }
  }

  async swapShareTokens(
    tempusAMM: string,
    kind: SwapKind,
    fromToken: string,
    toToken: string,
    amount: BigNumber,
    userWallet: string,
  ) {
    if (!this.vaultService || !this.tempusAMMService) {
      return Promise.reject();
    }

    let poolId: string = '';
    try {
      poolId = await this.tempusAMMService.poolId(tempusAMM);
    } catch (error) {
      console.error('PoolDataAdapter - swapShareTokens() - Failed to fetch pool ID!', error);
      return Promise.reject(error);
    }

    try {
      return await this.vaultService.swap(poolId, kind, userWallet, fromToken, toToken, amount);
    } catch (error) {
      console.error('PoolDataAdapter - swapShareTokens() - Failed to swap tokens!');
      return Promise.reject(error);
    }
  }

  getBackingTokenRate(ticker: Ticker): Observable<BigNumber> {
    if (!this.statisticService) {
      console.error(
        'PoolDataAdapter - getBackingTokenRate() - Attempted to use PoolDataAdapter before initializing it!',
      );
      return of(BigNumber.from('0'));
    }

    try {
      const ticker$ = interval(POLLING_INTERVAL);

      return ticker$.pipe(
        switchMap(() => {
          if (this.statisticService) {
            return from(this.statisticService.getRate(ticker));
          }
          return of(BigNumber.from('0'));
        }),
      );
    } catch (error) {
      console.error('PoolDataAdapter - getBackingTokenRate() - Failed to get backing token rate!', error);
      return of(BigNumber.from('0'));
    }
  }

  estimatedMintedShares(tempusPool: string, amount: BigNumber, isBackingToken: boolean): Observable<BigNumber> {
    if (!this.statisticService) {
      console.error(
        'PoolDataAdapter - estimatedMintedShares() - Attempted to use PoolDataAdapter before initializing it!',
      );
      return throwError(() => new Error());
    }

    try {
      const ticker$ = timer(0, POLLING_INTERVAL);

      return ticker$.pipe(
        switchMap(() => {
          if (this.statisticService) {
            return from(this.statisticService.estimatedMintedShares(tempusPool, amount, isBackingToken));
          }
          return of(BigNumber.from('0'));
        }),
      );
    } catch (error) {
      console.error('PoolDataAdapter - estimatedMintedShares() - Failed to fetch estimated minted shares!', error);
      return throwError(() => new Error());
    }
  }

  async getYieldBearingTokenRate(tempusPool: string, backingTokenTicker: Ticker) {
    if (!this.statisticService || !this.tempusPoolService) {
      console.error(
        'PoolDataAdapter - getYieldBearingTokenRate() - Attempted to use PoolDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    const yieldTokenAmount = ethers.utils.parseEther('1');
    try {
      const interestRate = await this.tempusPoolService.currentInterestRate(tempusPool);
      const yieldBearingTokenConversionRate = await this.tempusPoolService.numAssetsPerYieldToken(
        tempusPool,
        yieldTokenAmount,
        interestRate,
      );
      const backingTokenRate = await this.statisticService.getRate(backingTokenTicker);

      return mul18f(yieldBearingTokenConversionRate, backingTokenRate);
    } catch (error) {
      console.error('PoolDataAdapter - getBackingTokenRate() - Failed to get backing token rate!', error);
      return Promise.reject(error);
    }
  }

  async deposit(
    tempusPool: string,
    amount: BigNumber,
    recipient: string,
    isBackingToken: boolean,
    isEthDeposit?: boolean,
  ): Promise<ContractTransaction> {
    if (!this.tempusControllerService) {
      console.error('PoolDataAdapter - deposit() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    try {
      if (isBackingToken) {
        return this.tempusControllerService.depositBacking(tempusPool, amount, recipient, isEthDeposit);
      } else {
        return this.tempusControllerService.depositYieldBearing(tempusPool, amount, recipient);
      }
    } catch (error) {
      console.error('PoolDataAdapter - deposit() - Failed to make a deposit!', error);
      return Promise.reject(error);
    }
  }

  async onTokenReceived(
    tokenAddress: string,
    userWalletAddress: string,
    signer: JsonRpcSigner,
    listener: TransferEventListener,
  ) {
    if (!this.eRC20TokenServiceGetter) {
      return;
    }

    const tokenContract = this.eRC20TokenServiceGetter(tokenAddress, signer);

    tokenContract.onTransfer(null, userWalletAddress, listener);
  }

  async onTokenSent(
    tokenAddress: string,
    userWalletAddress: string,
    signer: JsonRpcSigner,
    listener: TransferEventListener,
  ) {
    if (this.eRC20TokenServiceGetter) {
      const tokenContract = this.eRC20TokenServiceGetter(tokenAddress, signer);

      tokenContract.onTransfer(userWalletAddress, null, listener);
    }
  }

  async getPoolFees(tempusPoolAddress: string, tempusAMMAddress: string): Promise<BigNumber[]> {
    if (!this.tempusPoolService || !this.tempusAMMService) {
      console.error('PoolDataAdapter - getPoolFees() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    try {
      const [poolFees, swapFee] = await Promise.all([
        this.tempusPoolService.getFeesConfig(tempusPoolAddress),
        this.tempusAMMService.getSwapFeePercentage(tempusAMMAddress),
      ]);
      // => [deposit, early redeem, redeem, swap]
      return [...poolFees, swapFee];
    } catch (error) {
      console.error('PoolDataAdapter - getPoolFees() - Failed to retrieve fees.', error);
      return Promise.reject(error);
    }
  }

  async executeRedeem(
    tempusPool: string,
    userWalletAddress: string,
    amountOfShares: BigNumber,
    toBacking: boolean,
  ): Promise<ContractTransaction> {
    if (!this.tempusControllerService) {
      console.error('PoolDataAdapter - executeRedeem() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    if (toBacking) {
      return this.tempusControllerService.redeemToBacking(tempusPool, userWalletAddress, amountOfShares);
    }

    return this.tempusControllerService.redeemToYieldBearing(tempusPool, userWalletAddress, amountOfShares);
  }

  async getPresentValueInBackingTokensForPool(
    pool: TempusPool,
    userWalletAddress: string,
  ): Promise<{
    tokenAmount: BigNumber;
    principalsStaked: BigNumber;
    yieldsStaked: BigNumber;
    principalsRate: BigNumber;
    yieldsRate: BigNumber;
  }> {
    if (!this.statisticService || !this.tempusPoolService || !this.eRC20TokenServiceGetter) {
      console.error(
        'PoolDataAdapter - getPresentValueInBackingTokensForPool() - Attempted to use PoolDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    try {
      const [yieldTokenAddress, principalTokenAddress] = await Promise.all([
        this.tempusPoolService.getYieldTokenAddress(pool.address),
        this.tempusPoolService.getPrincipalsTokenAddress(pool.address),
      ]);

      const yieldToken = this.eRC20TokenServiceGetter(yieldTokenAddress);
      const principalToken = this.eRC20TokenServiceGetter(principalTokenAddress);
      const lpToken = this.eRC20TokenServiceGetter(pool.ammAddress);

      const [userYieldSupply, userPrincipalSupply, userLpSupply] = await Promise.all([
        yieldToken.balanceOf(userWalletAddress),
        principalToken.balanceOf(userWalletAddress),
        lpToken.balanceOf(userWalletAddress),
      ]);

      return await this.statisticService.estimateExitAndRedeem(
        pool.ammAddress,
        userLpSupply,
        userPrincipalSupply,
        userYieldSupply,
        true,
      );
    } catch (error) {
      console.log(
        'PoolDataAdapter - getPresentValueInBackingTokensForPool() - Failed to fetch present value in backing tokens for pool!',
        error,
      );
      return Promise.reject(error);
    }
  }

  isCurrentYieldNegativeForPool(tempusPool: string): Observable<boolean> {
    if (!this.tempusPoolService) {
      console.error(
        'PoolDataAdapter - isCurrentYieldNegativeForPool() - Attempted to use PoolDataAdapter before initializing it!',
      );
      return throwError(() => new Error());
    }

    try {
      const ticker$ = timer(0, POLLING_INTERVAL);
      const currentInterestRate$ = switchMap(() => {
        if (this.tempusPoolService) {
          return this.tempusPoolService.currentInterestRate(tempusPool);
        }
        return throwError(() => new Error());
      });

      const initialInterestRate$ = switchMap((currentInterestRate: BigNumber | null) => {
        if (currentInterestRate && this.tempusPoolService) {
          return combineLatest([of(currentInterestRate), this.tempusPoolService.initialInterestRate(tempusPool)]);
        }
        return throwError(() => new Error());
      });

      return ticker$.pipe(
        currentInterestRate$,
        initialInterestRate$,
        map(values => {
          if (values) {
            const [currentInterestRate, initialInterestRate] = values;
            return currentInterestRate.lt(initialInterestRate);
          }

          return false;
        }),
      );
    } catch (error) {
      console.error(
        'PoolDataAdapter - isCurrentYieldNegativeForPool() - Failed to check if current pool yield is negative!',
        error,
      );
      return throwError(() => new Error());
    }
  }

  private async getTokenServices(tempusPoolAddress: string, tempusAMMAddress: string, signer: JsonRpcSigner) {
    if (!this.tempusPoolService || !this.statisticService || !this.eRC20TokenServiceGetter) {
      console.error('PoolDataAdapter - getTokenServices() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    try {
      const [backingTokenAddress, yieldBearingTokenAddress, principalsTokenAddress, yieldsTokenAddress] =
        await Promise.all([
          this.tempusPoolService.getBackingTokenAddress(tempusPoolAddress),
          this.tempusPoolService.getYieldBearingTokenAddress(tempusPoolAddress),
          this.tempusPoolService.getPrincipalsTokenAddress(tempusPoolAddress),
          this.tempusPoolService.getYieldTokenAddress(tempusPoolAddress),
        ]);

      const backingTokenService = this.eRC20TokenServiceGetter(backingTokenAddress, signer);
      const yieldBearingTokenService = this.eRC20TokenServiceGetter(yieldBearingTokenAddress, signer);
      const principalsTokenService = this.eRC20TokenServiceGetter(principalsTokenAddress, signer);
      const yieldsTokenService = this.eRC20TokenServiceGetter(yieldsTokenAddress, signer);
      const lpTokenService = this.eRC20TokenServiceGetter(tempusAMMAddress, signer);

      return {
        backingTokenService,
        yieldBearingTokenService,
        principalsTokenService,
        yieldsTokenService,
        lpTokenService,
      };
    } catch (error) {
      console.error('PoolDataAdapter - getTokenServices() - Failed to retrieve services!', error);
      return Promise.reject();
    }
  }

  async getPoolTVLChangeData(
    tempusPool: string,
    backingToken: Ticker,
    currentTVL: BigNumber,
    backingTokenPrecision?: number,
  ): Promise<BigNumber> {
    if (!this.statisticService) {
      console.error('PoolDataAdapter - getTokenServices() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    const provider = getDefaultProvider();
    let latestBlock;
    try {
      latestBlock = await provider.getBlock('latest');
    } catch (error) {
      console.error('Failed to get latest block data!');
      return Promise.reject();
    }

    // Get block number from 7 days ago (approximate - we need to find a better way to fetch exact block number)
    // TODO - Do not attempt to fetch TVL for blocks that were mined before tempus pool contract was deployed
    const fetchForBlock = latestBlock.number - Math.round(SECONDS_IN_A_DAY / BLOCK_DURATION_SECONDS) * 7;
    try {
      const [tvlInBackingTokens, backingTokenRate] = await Promise.all([
        this.statisticService.totalValueLockedInBackingTokens(tempusPool, {
          blockTag: fetchForBlock,
        }),
        this.statisticService.getRate(backingToken, {
          blockTag: fetchForBlock,
        }),
      ]);
      const pastTVL = mul18f(tvlInBackingTokens, backingTokenRate, backingTokenPrecision);

      const tvlDiff = currentTVL.sub(pastTVL);
      const tvlRatio = div18f(tvlDiff, pastTVL, backingTokenPrecision);

      return tvlRatio;
    } catch (error) {
      console.error('PoolDataAdapter - getPoolTVLChangeData() - Failed to fetch TVL data change percentage for pool.');
      return Promise.reject(error);
    }
  }

  async getPoolVolumeData(
    tempusPool: string,
    tempusPoolId: string,
    backingToken: Ticker,
    principalsAddress: string,
    userWalletSigner: JsonRpcSigner,
    backingTokenPrecision?: number,
  ): Promise<BigNumber> {
    if (
      !this.tempusPoolService ||
      !this.statisticService ||
      !this.tempusAMMService ||
      !this.tempusControllerService ||
      !this.vaultService
    ) {
      console.error('Attempted to use VolumeChartDataAdapter before initializing it!');
      return Promise.reject();
    }

    let latestBlock;
    try {
      latestBlock = await userWalletSigner.provider.getBlock('latest');
    } catch (error) {
      console.error('Failed to get latest block data!');
      return Promise.reject();
    }

    // Get block number from 7 days ago (approximate - we need to find a better way to fetch exact block number)
    // TODO - Do not attempt to fetch TVL for blocks that were mined before tempus pool contract was deployed
    // TODO - Maximum number of events returned is 10k if block range is larger then 2k. We need to fetch events in batches to make sure
    // this is going to work when usage of the app goes up and we have more then 10k events per week.
    const fetchFromBlock = latestBlock.number - Math.round(SECONDS_IN_A_DAY / BLOCK_DURATION_SECONDS) * 7;

    let depositEvents: DepositedEvent[];
    let redeemEvents: RedeemedEvent[];
    let swapEvents: SwapEvent[];
    try {
      const eventsForUser = undefined;
      [depositEvents, redeemEvents, swapEvents] = await Promise.all([
        this.tempusControllerService.getDepositedEvents({
          forPool: tempusPool,
          forUser: eventsForUser,
          fromBlock: fetchFromBlock,
        }),
        this.tempusControllerService.getRedeemedEvents({
          forPool: tempusPool,
          forUser: eventsForUser,
          fromBlock: fetchFromBlock,
        }),
        this.vaultService.getSwapEvents({ forPoolId: tempusPoolId, fromBlock: fetchFromBlock }),
      ]);
    } catch (error) {
      console.error('Failed to fetch deposit and redeem events for volume chart', error);
      return Promise.reject(error);
    }

    let poolBackingTokenRate: BigNumber;
    try {
      // TODO - Use chainlink historical data once we go to mainnet
      poolBackingTokenRate = await this.statisticService.getCoingeckoRate(backingToken);
    } catch (error) {
      console.error('Failed to get tempus pool exchange rate to USD!');
      return Promise.reject(error);
    }

    let totalVolume: BigNumber = BigNumber.from('0');

    const events = [...depositEvents, ...redeemEvents, ...swapEvents];
    events.forEach(event => {
      const eventBackingTokenValue = getEventBackingTokenValue(event, principalsAddress);

      totalVolume = totalVolume.add(mul18f(poolBackingTokenRate, eventBackingTokenValue, backingTokenPrecision));
    });

    return totalVolume;
  }
}
