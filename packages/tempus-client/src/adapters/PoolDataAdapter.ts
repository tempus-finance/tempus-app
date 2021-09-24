import { BigNumber, ContractTransaction, ethers } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import TempusAMMService from '../services/TempusAMMService';
import StatisticsService from '../services/StatisticsService';
import TempusControllerService, { DepositedEvent, RedeemedEvent } from '../services/TempusControllerService';
import TempusPoolService from '../services/TempusPoolService';
import getERC20TokenService from '../services/getERC20TokenService';
import { mul18f } from '../utils/wei-math';
import { Ticker } from '../interfaces';

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
  eRC20TokenServiceGetter: typeof getERC20TokenService;
};

export default class PoolDataAdapter {
  private tempusControllerService: TempusControllerService | undefined = undefined;
  private tempusControllerAddress: string = '';
  private tempusPoolService: TempusPoolService | null = null;
  private statisticService: StatisticsService | null = null;
  private tempusAMMService: TempusAMMService | null = null;
  private eRC20TokenServiceGetter: null | typeof getERC20TokenService = null;

  init({
    tempusControllerService,
    tempusControllerAddress,
    tempusPoolService,
    statisticService,
    tempusAMMService,
    eRC20TokenServiceGetter,
  }: PoolDataAdapterParameters) {
    this.tempusControllerService = tempusControllerService;
    this.tempusControllerAddress = tempusControllerAddress;
    this.tempusPoolService = tempusPoolService;
    this.statisticService = statisticService;
    this.tempusAMMService = tempusAMMService;
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

    // TODO - Fetch interest rate from contract instead of hardcoded values
    const yieldTokenAmount = BigNumber.from('1');
    const interestRate = BigNumber.from('1');

    try {
      const {
        backingTokenService,
        yieldBearingTokenService,
        principalsTokenService,
        yieldsTokenService,
        lpTokenService,
      } = await this.getTokenServices(tempusPoolAddress, tempusAMMAddress, signer);

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

  async getEstimatedDepositAmount(
    tempusAmmAddress: string,
    tokenAmount: BigNumber,
    isBackingToken: boolean,
  ): Promise<{
    fixedDeposit: BigNumber;
    variableDeposit: BigNumber[];
  } | void> {
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
        this.statisticService?.estimatedDepositAndFix(tempusAmmAddress, tokenAmount, isBackingToken),
        this.statisticService?.estimatedDepositAndProvideLiquidity(tempusAmmAddress, tokenAmount, isBackingToken),
      ]);

      return {
        fixedDeposit,
        variableDeposit,
      };
    } catch (error) {
      console.error('PoolDataAdapter - getEstimatedDepositAmount() - Failed to retrieve balances!', error);
      Promise.reject();
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
      const amount = await this.statisticService?.estimateExitAndRedeem(
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
    approveAmount = 0,
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
      return tokenService.approve(this.tempusControllerAddress, ethers.utils.parseEther(approveAmount.toString()));
    } catch (error) {
      console.error('PoolDataAdapter - approve() - Failed to approve tokens for deposit!', error);
      Promise.reject();
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
  ): Promise<ContractTransaction | undefined> {
    if (!this.tempusControllerService) {
      console.error('PoolDataAdapter - executeDeposit() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    try {
      return await this.tempusControllerService.depositAndFix(tempusAMM, tokenAmount, isBackingToken, minTYSRate);
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
}
