import { JsonRpcSigner } from '@ethersproject/providers';
import { ContractTransaction } from 'ethers';
import { INFINITE_DEADLINE, SLIPPAGE_PRECISION } from '../constants';
import { StatsV2Contract } from '../contracts/StatsV2Contract';
import { TempusAMMV1Contract } from '../contracts/TempusAMMV1Contract';
import { TempusControllerV1Contract } from '../contracts/TempusControllerV1Contract';
import { Decimal, DEFAULT_DECIMAL_PRECISION } from '../datastructures';
import { Chain, Ticker } from '../interfaces';
import { getWithdrawnAmountFromTx } from '../utils';
import { BaseService, ConfigGetter } from './BaseService';

export class WithdrawService extends BaseService {
  private chain: Chain;

  constructor(chain: Chain, getConfig: ConfigGetter) {
    super(getConfig);

    this.chain = chain;
  }

  async withdraw(
    poolAddress: string,
    amountToGet: Decimal,
    tokenToGet: Ticker,
    tokenAddress: string,
    tokenBalance: Decimal,
    capitalsBalance: Decimal,
    yieldsBalance: Decimal,
    lpBalance: Decimal,
    slippage: Decimal,
    signer: JsonRpcSigner,
  ): Promise<{
    contractTransaction: ContractTransaction;
    withdrawnAmount: Decimal;
  }> {
    const tokenPrecision = this.getTokenPrecision(tokenAddress);

    const statsContractAddress = this.getStatsAddressForPool(poolAddress);
    const tempusControllerContractAddress = this.getTempusControllerAddressForPool(poolAddress);

    const poolConfig = this.getPoolConfig(poolAddress);

    const {
      tokenPrecision: {
        backingToken: backingTokenPrecision,
        yieldBearingToken: yieldBearingTokenPrecision,
        principals: principalsPrecision,
        yields: yieldsPrecision,
        lpTokens: lpPrecision,
      },
    } = poolConfig;

    const ratio = amountToGet.div(tokenBalance);

    const lpAmount = lpBalance.mul(ratio);
    const capitalsAmount = capitalsBalance.mul(ratio);
    const yieldsAmount = yieldsBalance.mul(ratio);

    const tempusControllerContract = new TempusControllerV1Contract(
      this.chain,
      tempusControllerContractAddress,
      signer,
    );
    const statsContract = new StatsV2Contract(this.chain, statsContractAddress);

    const maxLeftoverShares = capitalsAmount.add(yieldsAmount).add(lpAmount).div(new Decimal(1000));

    const toBackingToken = tokenToGet === poolConfig.backingToken;

    let estimate: {
      tokenAmount: Decimal;
      principalsStaked: Decimal;
      yieldsStaked: Decimal;
      principalsRate: Decimal;
      yieldsRate: Decimal;
    };
    try {
      estimate = await statsContract.estimateExitAndRedeem(
        poolConfig.ammAddress,
        capitalsAmount,
        yieldsAmount,
        lpAmount,
        backingTokenPrecision,
        yieldBearingTokenPrecision,
        principalsPrecision,
        yieldsPrecision,
        lpPrecision,
        maxLeftoverShares,
        toBackingToken,
      );
    } catch (error) {
      console.error('WithdrawService - withdraw() - Failed to get withdraw estimate!', error);
      return Promise.reject(error);
    }

    const minCapitalsStaked = estimate.principalsStaked.sub(estimate.principalsStaked.mul(slippage));
    const minYieldsStaked = estimate.yieldsStaked.sub(estimate.yieldsStaked.mul(slippage));

    const totalCapitals = capitalsAmount.add(estimate.principalsStaked);
    const totalYields = yieldsAmount.add(estimate.yieldsStaked);

    const tempusAMM = new TempusAMMV1Contract(this.chain, poolConfig.ammAddress);

    let yieldsRate: Decimal;
    try {
      // Calculate yieldsRate if pool is not mature yet
      if (poolConfig.maturityDate > Date.now()) {
        if (totalYields.gt(totalCapitals)) {
          const tokenSwapAmount = totalYields.sub(totalCapitals);

          const estimatedPrincipals = await tempusAMM.getExpectedReturnGivenIn(
            tokenSwapAmount,
            true,
            principalsPrecision,
            yieldsPrecision,
          );

          yieldsRate = estimatedPrincipals.div(tokenSwapAmount);
        } else if (totalCapitals.gt(totalYields)) {
          const tokenSwapAmount = totalCapitals.sub(totalYields);

          const estimatedYields = await tempusAMM.getExpectedReturnGivenIn(
            tokenSwapAmount,
            false,
            principalsPrecision,
            yieldsPrecision,
          );

          yieldsRate = tokenSwapAmount.div(estimatedYields);
        } else {
          // In case we have equal amounts, use 1 as swapAmount just in case estimate was wrong,
          // and swap is going to happen anyways
          const tokenSwapAmount = new Decimal(1);

          const estimatedPrincipals = await tempusAMM.getExpectedReturnGivenIn(
            tokenSwapAmount,
            true,
            principalsPrecision,
            yieldsPrecision,
          );

          yieldsRate = estimatedPrincipals.div(tokenSwapAmount);
        }
      } else {
        // In case pool is mature, withdraw will not execute any swaps under the hood,
        // so we can set yieldsRate to any value other then zero

        yieldsRate = new Decimal(1);
      }
    } catch (error) {
      console.error('WithdrawService - withdraw() - Failed to get calculate yields rate!', error);
      return Promise.reject(error);
    }

    const maxSlippage = slippage.div(100);

    const deadline = new Decimal(INFINITE_DEADLINE, DEFAULT_DECIMAL_PRECISION);

    let contractTransaction: ContractTransaction;
    try {
      contractTransaction = await tempusControllerContract.exitAmmGiveLpAndRedeem(
        poolConfig.ammAddress,
        lpAmount,
        capitalsAmount,
        yieldsAmount,
        lpPrecision,
        principalsPrecision,
        yieldsPrecision,
        SLIPPAGE_PRECISION,
        minCapitalsStaked,
        minYieldsStaked,
        maxLeftoverShares,
        yieldsRate,
        maxSlippage,
        toBackingToken,
        deadline,
      );
    } catch (error) {
      console.error('WithdrawService - withdraw() - Failed to execute withdrawal!', error);
      return Promise.reject(error);
    }

    let walletAddress;
    try {
      walletAddress = await signer.getAddress();
    } catch (error) {
      console.error('WithdrawService - withdraw() - Failed to get wallet address from signer!');
      return Promise.reject(error);
    }

    let withdrawnAmount: Decimal;
    try {
      withdrawnAmount = await getWithdrawnAmountFromTx(
        contractTransaction,
        tokenAddress,
        tokenPrecision,
        walletAddress,
      );
    } catch (error) {
      console.error('WithdrawService - withdraw() - Failed to get withdrawn amount from withdraw transaction receipt!');
      return Promise.reject(error);
    }

    return {
      contractTransaction,
      withdrawnAmount,
    };
  }
}
