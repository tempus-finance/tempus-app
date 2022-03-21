import { ethers } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { Chain, TempusPoolService, getERC20TokenService, increasePrecision, mul18f } from 'tempus-core-services';
import { TempusPool } from '../interfaces/TempusPool';
import StatisticsService from '../services/StatisticsService';
import { AvailableToDeposit } from '../state/PoolDataState';
import { getChainConfig } from '../utils/getConfig';

type UserBalanceDataAdapterParameters = {
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
  statisticsService: StatisticsService;
  tempusPoolService: TempusPoolService;
  chain: Chain;
  eRC20TokenServiceGetter: typeof getERC20TokenService;
};

export default class UserBalanceDataAdapter {
  private chain: Chain | null = null;
  private statisticsService: StatisticsService | null = null;
  private tempusPoolService: TempusPoolService | null = null;
  private eRC20TokenServiceGetter: null | typeof getERC20TokenService = null;

  public init(params: UserBalanceDataAdapterParameters) {
    this.chain = params.chain;
    this.statisticsService = params.statisticsService;
    this.tempusPoolService = params.tempusPoolService;
    this.eRC20TokenServiceGetter = params.eRC20TokenServiceGetter;
  }

  async getUserAvailableToDepositForPool(
    tempusPool: TempusPool,
    userWalletAddress: string,
    userWalletSigner: JsonRpcSigner,
    backingTokenPrecision: number,
    yieldBearingTokenPrecision: number,
  ): Promise<AvailableToDeposit> {
    if (!this.statisticsService || !this.tempusPoolService || !this.eRC20TokenServiceGetter || !this.chain) {
      return Promise.reject('UserBalanceDataAdapter - getUserBalanceForPool() - Adapter not initialized!');
    }

    try {
      const backingToken = this.eRC20TokenServiceGetter(
        tempusPool.backingTokenAddress,
        this.chain,
        getChainConfig,
        userWalletSigner,
      );
      const yieldBearingToken = this.eRC20TokenServiceGetter(
        tempusPool.yieldBearingTokenAddress,
        this.chain,
        getChainConfig,
        userWalletSigner,
      );
      const [backingTokensAvailable, yieldTokensAvailable, backingTokenToUSD, interestRate] = await Promise.all([
        backingToken.balanceOf(userWalletAddress),
        yieldBearingToken.balanceOf(userWalletAddress),
        this.statisticsService.getRate(this.chain, tempusPool.backingToken),
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
