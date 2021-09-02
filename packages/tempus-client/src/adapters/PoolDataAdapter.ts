import { BigNumber, ContractTransaction, ethers } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import ERC20TokenService from '../services/ERC20TokenService';
import StatisticsService from '../services/StatisticsService';
import TempusControllerService from '../services/TempusControllerService';
import TempusPoolService from '../services/TempusPoolService';

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
        backingTokenRate: number;
        yieldBearingTokenBalance: BigNumber;
        yieldBearingTokenRate: number;
      }
    | undefined
  > {
    try {
      if (this.eRC20TokenServiceGetter) {
        const backingTokenAddress = await this.tempusPoolService?.getBackingTokenAddress(tempusPoolAddress);
        const backingTokenService = this.eRC20TokenServiceGetter(backingTokenAddress || '', signer);
        const backingTokenBalance = await backingTokenService.balanceOf(userWalletAddress);

        const yieldBearingTokenAddress =
          (await this.tempusPoolService?.getYieldBearingTokenAddress(tempusPoolAddress)) || '';
        const yieldBearingTokenService = this.eRC20TokenServiceGetter(yieldBearingTokenAddress, signer);
        const yieldBearingTokenBalance = await yieldBearingTokenService.balanceOf(userWalletAddress);

        const backingTokenTicker = (await this.tempusPoolService?.getBackingTokenTicker(tempusPoolAddress)) || '';
        const backingTokenRate = (await this.statisticService?.getRate(backingTokenTicker)) || 1;

        const yieldBearingTokenConversionRate =
          (await this.tempusPoolService?.numAssetsPerYieldToken(tempusPoolAddress, 1, 1)) || 1;
        const yieldBearingTokenRate = Number(yieldBearingTokenConversionRate.toString()) * backingTokenRate;

        return {
          backingTokenBalance,
          backingTokenRate,
          yieldBearingTokenBalance,
          yieldBearingTokenRate,
        };
      }
      throw new Error('PoolDataAdapter:retrieveBalances():Missing eRC20TokenServiceGetter');
    } catch (error) {
      console.error('PoolDataAdapter:retrieveBalances():', error);
      Promise.reject();
    }
  }

  async approve(
    tempusPoolAddress: string,
    isBackingToken: boolean,
    signer: JsonRpcSigner,
    approveAmount = 0,
  ): Promise<ContractTransaction | void> {
    try {
      if (this.eRC20TokenServiceGetter) {
        const tokenAddress = isBackingToken
          ? await this.tempusPoolService?.getBackingTokenAddress(tempusPoolAddress)
          : await this.tempusPoolService?.getYieldBearingTokenAddress(tempusPoolAddress);
        const tokenService = this.eRC20TokenServiceGetter(tokenAddress || '', signer);
        return tokenService.approve(this.tempusControllerAddress, ethers.utils.parseEther(approveAmount.toString()));
      }
      throw new Error('PoolDataAdapter:approveDeposit():Missing eRC20TokenServiceGetter');
    } catch (error) {
      console.error('PoolDataAdapter:approveDeposit():', error);
      Promise.reject();
    }
  }

  async executeDeposit(
    tempusAMM: string,
    tokenAmount: BigNumber,
    isBackingToken: boolean,
    minTYSRate: BigNumber,
  ): Promise<ContractTransaction | undefined> {
    try {
      return await this.tempusControllerService?.depositAndFix(tempusAMM, tokenAmount, isBackingToken, minTYSRate);
    } catch (error) {
      console.error(`TempusPoolService - depositAndFix() - Failed to make a deposit to the pool!`, error);
      return Promise.reject(error);
    }
  }
}
