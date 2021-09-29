import { BigNumber, ContractTransaction, ethers } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import TempusAMMService from '../services/TempusAMMService';
import StatisticsService from '../services/StatisticsService';
import TempusControllerService, { DepositedEvent, RedeemedEvent } from '../services/TempusControllerService';
import TempusPoolService from '../services/TempusPoolService';
import getERC20TokenService from '../services/getERC20TokenService';
import { div18f, mul18f } from '../utils/wei-math';
import { DAYS_IN_A_YEAR, ONE_ETH_IN_WEI, SECONDS_IN_A_DAY, ZERO_ETH_ADDRESS } from '../constants';
import { Ticker } from '../interfaces';
import VaultService, { SwapKind } from '../services/VaultService';

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

  async retrieveBalances(
    tempusPoolAddress: string,
    tempusAMMAddress: string,
    userWalletAddress: string,
    signer: JsonRpcSigner,
  ): Promise<{
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
      return Promise.reject();
    }

    if (!this.tempusPoolService || !this.statisticService || !this.eRC20TokenServiceGetter) {
      console.error('PoolDataAdapter - retrieveBalances() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    const yieldTokenAmount = ethers.utils.parseEther('1');

    try {
      const [
        { backingTokenService, yieldBearingTokenService, principalsTokenService, yieldsTokenService, lpTokenService },
        interestRate,
      ] = await Promise.all([
        this.getTokenServices(tempusPoolAddress, tempusAMMAddress, signer),
        this.tempusPoolService.currentInterestRate(tempusPoolAddress),
      ]);

      const [backingTokenTicker, yieldBearingTokenConversionRate] = await Promise.all([
        this.tempusPoolService.getBackingTokenTicker(tempusPoolAddress),
        this.tempusPoolService.numAssetsPerYieldToken(tempusPoolAddress, yieldTokenAmount, interestRate),
      ]);

      const [
        backingTokenBalance,
        yieldBearingTokenBalance,
        principalsTokenBalance,
        yieldsTokenBalance,
        backingTokenRate,
        lpTokensBalance,
      ] = await Promise.all([
        backingTokenService.balanceOf(userWalletAddress),
        yieldBearingTokenService.balanceOf(userWalletAddress),
        principalsTokenService.balanceOf(userWalletAddress),
        yieldsTokenService.balanceOf(userWalletAddress),
        this.statisticService.getRate(backingTokenTicker),
        lpTokenService.balanceOf(userWalletAddress),
      ]);

      const yieldBearingTokenRate = mul18f(yieldBearingTokenConversionRate, backingTokenRate);

      return {
        backingTokenBalance,
        backingTokenRate,
        yieldBearingTokenBalance,
        yieldBearingTokenRate,
        principalsTokenBalance,
        yieldsTokenBalance,
        lpTokensBalance,
      };
    } catch (error) {
      console.error('PoolDataAdapter - retrieveBalances() - Failed to retrieve balances!', error);
      return Promise.reject();
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
        variableDeposit,
      };
    } catch (error) {
      console.error('PoolDataAdapter - getEstimatedDepositAmount() - Failed to retrieve balances!', error);
      return Promise.reject();
    }
  }

  async getEstimatedWithdrawAmount(
    tempusAmmAddress: string,
    principalAmount: BigNumber,
    yieldsAmount: BigNumber,
    lpAmount: BigNumber,
    isBackingToken: boolean,
  ): Promise<BigNumber> {
    if (!this.statisticService) {
      console.error(
        'PoolDataAdapter - getEstimatedWithdrawAmount() - Attempted to use PoolDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    if (!tempusAmmAddress || principalAmount === undefined || yieldsAmount === undefined || lpAmount === undefined) {
      console.error(
        'PoolDataAdapter - getEstimatedDepositAmount() - Tempus AMM address, principals, yields or lp tokens amount not valid',
      );
      return Promise.reject();
    }

    try {
      const amount = await this.statisticService.estimateExitAndRedeem(
        tempusAmmAddress,
        principalAmount,
        yieldsAmount,
        lpAmount,
        isBackingToken,
      );
      return amount;
    } catch (error) {
      console.error('PoolDataAdapter - getEstimatedWithdrawAmount() - Failed to retrieve balances!', error);
      return Promise.reject();
    }
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

  async executeDeposit(
    tempusAMM: string,
    tokenAmount: BigNumber,
    isBackingToken: boolean,
    minTYSRate: BigNumber,
    isEthDeposit?: boolean,
  ): Promise<ContractTransaction | undefined> {
    if (!this.tempusControllerService) {
      console.error('PoolDataAdapter - executeDeposit() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    try {
      return await this.tempusControllerService.depositAndFix(
        tempusAMM,
        tokenAmount,
        isBackingToken,
        minTYSRate,
        isEthDeposit,
      );
    } catch (error) {
      console.error(`TempusPoolService - executeDeposit() - Failed to make a deposit to the pool!`, error);
      return Promise.reject(error);
    }
  }

  async executeWithdraw(tempusAMM: string, isBackingToken: boolean): Promise<ContractTransaction | undefined> {
    if (!this.tempusControllerService) {
      console.error('PoolDataAdapter - executeWithdraw() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    try {
      return await this.tempusControllerService.completeExitAndRedeem(tempusAMM, isBackingToken);
    } catch (error) {
      console.error(`TempusPoolService - executeWithdraw() - Failed to make a deposit to the pool!`, error);
      return Promise.reject(error);
    }
  }

  public async getExpectedReturnForLPTokens(
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

    try {
      return await this.tempusAMMService.getExpectedTokensOutGivenBPTIn(tempusAMMAddress, lpTokenAmount);
    } catch (error) {
      console.error(
        'PoolDataAdapter - getExpectedReturnForLPTokens() - Failed to fetch expected token return from LP Tokens',
      );
      return Promise.reject(error);
    }
  }

  public async getUserTransactionEvents(
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
        this.tempusControllerService.getDepositedEvents(tempusPoolAddress, userWalletAddress),
        this.tempusControllerService.getRedeemedEvents(tempusPoolAddress, userWalletAddress),
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

  async getExpectedReturnForShareToken(amm: string, amount: BigNumber, yieldShareIn: boolean) {
    if (!this.tempusAMMService) {
      return Promise.reject();
    }

    try {
      return await this.tempusAMMService.getExpectedReturnGivenIn(amm, amount, yieldShareIn);
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

  async getBackingTokenRate(ticker: string) {
    if (!this.statisticService) {
      console.error(
        'PoolDataAdapter - getBackingTokenRate() - Attempted to use PoolDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    try {
      return await this.statisticService.getRate(ticker);
    } catch (error) {
      console.error('PoolDataAdapter - getBackingTokenRate() - Failed to get backing token rate!', error);
      return Promise.reject(error);
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
}
