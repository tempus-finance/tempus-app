import { BigNumber, ContractTransaction, ethers } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import ERC20TokenService from '../services/ERC20TokenService';
import StatisticsService from '../services/StatisticsService';
import TempusControllerService from '../services/TempusControllerService';
import TempusPoolService from '../services/TempusPoolService';
import { mul18f } from '../utils/wei-math';

type PoolDataAdapterParameters = {
  tempusControllerAddress: string;
  tempusControllerService: TempusControllerService;
  tempusPoolService: TempusPoolService;
  statisticService: StatisticsService;
  eRC20TokenServiceGetter: (backingToken: string, signer: JsonRpcSigner) => ERC20TokenService;
};

export default class PoolDataAdapter {
  private tempusControllerService: TempusControllerService | undefined = undefined;
  private tempusControllerAddress: string = '';
  private tempusPoolService: TempusPoolService | undefined = undefined;
  private statisticService: StatisticsService | undefined = undefined;
  private eRC20TokenServiceGetter: undefined | ((backingToken: string, signer: JsonRpcSigner) => ERC20TokenService) =
    undefined;

  init({
    tempusControllerService,
    tempusControllerAddress,
    tempusPoolService,
    statisticService,
    eRC20TokenServiceGetter,
  }: PoolDataAdapterParameters) {
    this.tempusControllerService = tempusControllerService;
    this.tempusControllerAddress = tempusControllerAddress;
    this.tempusPoolService = tempusPoolService;
    this.statisticService = statisticService;
    this.eRC20TokenServiceGetter = eRC20TokenServiceGetter;
  }

  async retrieveBalances(
    tempusPoolAddress: string,
    tempusAMMAddress: string,
    userWalletAddress: string,
    signer: JsonRpcSigner,
  ): Promise<
    | {
        backingTokenBalance: BigNumber;
        backingTokenRate: BigNumber;
        yieldBearingTokenBalance: BigNumber;
        yieldBearingTokenRate: BigNumber;
        principalsTokenBalance: BigNumber;
        yieldsTokenBalance: BigNumber;
        lpTokensBalance: BigNumber;
      }
    | undefined
  > {
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
      const [
        backingTokenAddress,
        yieldBearingTokenAddress,
        backingTokenTicker,
        yieldBearingTokenConversionRate,
        principalsTokenAddress,
        yieldsTokenAddress,
      ] = await Promise.all([
        this.tempusPoolService.getBackingTokenAddress(tempusPoolAddress),
        this.tempusPoolService.getYieldBearingTokenAddress(tempusPoolAddress),
        this.tempusPoolService.getBackingTokenTicker(tempusPoolAddress),
        this.tempusPoolService.numAssetsPerYieldToken(tempusPoolAddress, yieldTokenAmount, interestRate),
        this.tempusPoolService.getPrincipalTokenAddress(tempusPoolAddress),
        this.tempusPoolService.getYieldTokenAddress(tempusPoolAddress),
      ]);

      const backingTokenService = this.eRC20TokenServiceGetter(backingTokenAddress, signer);
      const yieldBearingTokenService = this.eRC20TokenServiceGetter(yieldBearingTokenAddress, signer);
      const principalsTokenService = this.eRC20TokenServiceGetter(principalsTokenAddress, signer);
      const yieldsTokenService = this.eRC20TokenServiceGetter(yieldsTokenAddress, signer);
      const lpTokenService = this.eRC20TokenServiceGetter(tempusAMMAddress, signer);

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
      Promise.reject();
    }
  }

  async getEstimatedDepositAmount(
    tempusAmmAddress: string,
    tokenAmount: number,
    isBackingToken: boolean,
  ): Promise<{
    fixedDeposit: number;
    variableDeposit: number[];
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
        fixedDeposit: parseFloat(ethers.utils.formatEther(fixedDeposit)),
        variableDeposit: variableDeposit.map(ethers.utils.formatEther).map(parseFloat),
      };
    } catch (error) {
      console.error('PoolDataAdapter - getEstimatedDepositAmount() - Failed to retrieve balances!', error);
      Promise.reject();
    }
  }

  async getEstimatedWithdrawAmount(
    tempusAmmAddress: string,
    principalAmount: number,
    yieldsAmount: number,
    lpAmount: number,
    isBackingToken: boolean,
  ): Promise<number | void> {
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
      return parseFloat(ethers.utils.formatEther(amount));
    } catch (error) {
      console.error('PoolDataAdapter - getEstimatedWithdrawAmount() - Failed to retrieve balances!', error);
      Promise.reject();
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
}
