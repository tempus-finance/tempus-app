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
    userWalletAddress: string,
    signer: JsonRpcSigner,
  ): Promise<
    | {
        backingTokenBalance: BigNumber;
        backingTokenRate: BigNumber;
        yieldBearingTokenBalance: BigNumber;
        yieldBearingTokenRate: BigNumber;
      }
    | undefined
  > {
    if (!this.tempusPoolService || !this.statisticService || !this.eRC20TokenServiceGetter) {
      console.error('PoolDataAdapter - retrieveBalances() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    try {
      const [backingTokenAddress, yieldBearingTokenAddress, backingTokenTicker, yieldBearingTokenConversionRate] =
        await Promise.all([
          this.tempusPoolService.getBackingTokenAddress(tempusPoolAddress),
          this.tempusPoolService.getYieldBearingTokenAddress(tempusPoolAddress),
          this.tempusPoolService.getBackingTokenTicker(tempusPoolAddress),
          // TODO - Fetch interest rate from contract instead of hardcoded value=1
          this.tempusPoolService.numAssetsPerYieldToken(
            tempusPoolAddress,
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
          ),
        ]);

      const backingTokenService = this.eRC20TokenServiceGetter(backingTokenAddress, signer);
      const yieldBearingTokenService = this.eRC20TokenServiceGetter(yieldBearingTokenAddress, signer);

      const [backingTokenBalance, yieldBearingTokenBalance, backingTokenRate] = await Promise.all([
        backingTokenService.balanceOf(userWalletAddress),
        yieldBearingTokenService.balanceOf(userWalletAddress),
        this.statisticService.getRate(backingTokenTicker),
      ]);

      const yieldBearingTokenRate = mul18f(yieldBearingTokenConversionRate, backingTokenRate);

      return {
        backingTokenBalance,
        backingTokenRate,
        yieldBearingTokenBalance,
        yieldBearingTokenRate,
      };
    } catch (error) {
      console.error('PoolDataAdapter - retrieveBalances() - Failed to retrieve balances!', error);
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
      console.error('PoolDataAdapter - retrieveBalances() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    try {
      const tokenAddress = isBackingToken
        ? await this.tempusPoolService.getBackingTokenAddress(tempusPoolAddress)
        : await this.tempusPoolService.getYieldBearingTokenAddress(tempusPoolAddress);

      const tokenService = this.eRC20TokenServiceGetter(tokenAddress, signer);
      return tokenService.approve(this.tempusControllerAddress, ethers.utils.parseEther(approveAmount.toString()));
    } catch (error) {
      console.error('PoolDataAdapter - approveDeposit() - Failed to approve tokens for deposit!', error);
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
      console.error('PoolDataAdapter - retrieveBalances() - Attempted to use PoolDataAdapter before initializing it!');
      return Promise.reject();
    }

    try {
      return await this.tempusControllerService.depositAndFix(tempusAMM, tokenAmount, isBackingToken, minTYSRate);
    } catch (error) {
      console.error(`TempusPoolService - depositAndFix() - Failed to make a deposit to the pool!`, error);
      return Promise.reject(error);
    }
  }
}
