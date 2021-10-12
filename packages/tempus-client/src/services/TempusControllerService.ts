import { BigNumber, Contract, ContractTransaction, ethers } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { TempusController } from '../abi/TempusController';
import TempusControllerABI from '../abi/TempusController.json';
import { TypedEvent } from '../abi/commons';
import getConfig from '../utils/get-config';
import {
  completeExitAndRedeemGasIncrease,
  depositAndFixGasIncrease,
  depositAndProvideLiquidityGasIncrease,
  depositBackingGasIncrease,
  depositYieldBearingGasIncrease,
} from '../constants';

type TempusControllerServiceParameters = {
  Contract: typeof Contract;
  address: string;
  abi: typeof TempusControllerABI;
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
};

// I need to define event types like this, because TypeChain plugin for Hardhat does not generate them.
// TODO - Use event types from auto generated contract typings file when TypeChain plugin for Hardhat adds them.
// See: https://github.com/ethereum-ts/TypeChain/issues/454
export type DepositedEvent = TypedEvent<
  [string, string, string, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
    pool: string;
    depositor: string;
    recipient: string;
    yieldTokenAmount: BigNumber;
    backingTokenValue: BigNumber;
    shareAmounts: BigNumber;
    interestRate: BigNumber;
    fee: BigNumber;
  }
>;
export type RedeemedEvent = TypedEvent<
  [string, string, string, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, boolean] & {
    pool: string;
    redeemer: string;
    recipient: string;
    principalShareAmount: BigNumber;
    yieldShareAmount: BigNumber;
    yieldTokenAmount: BigNumber;
    backingTokenValue: BigNumber;
    interestRate: BigNumber;
    fee: BigNumber;
    isEarlyRedeem: boolean;
  }
>;

class TempusControllerService {
  private contract: TempusController | null = null;

  init(params: TempusControllerServiceParameters) {
    this.contract = new Contract(params.address, params.abi, params.signerOrProvider) as TempusController;
  }

  public async getDepositedEvents(forPool?: string, forUser?: string): Promise<DepositedEvent[]> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - getDepositedEvents() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    try {
      return await this.contract.queryFilter(this.contract.filters.Deposited(forPool, forUser));
    } catch (error) {
      console.error(`TempusControllerService getDepositedEvents() - Failed to get deposited events!`, error);
      return Promise.reject(error);
    }
  }

  public async getRedeemedEvents(forPool?: string, forUser?: string): Promise<RedeemedEvent[]> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - getRedeemedEvents() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    try {
      return await this.contract.queryFilter(this.contract.filters.Redeemed(forPool, undefined, forUser));
    } catch (error) {
      console.error(`TempusControllerService getRedeemEvents() - Failed to get redeemed events!`, error);
      return Promise.reject(error);
    }
  }

  public async depositAndFix(
    tempusAMM: string,
    tokenAmount: BigNumber,
    isBackingToken: boolean,
    minTYSRate: BigNumber,
    isEthDeposit?: boolean,
  ): Promise<ContractTransaction> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - depositAndFix() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    try {
      if (isEthDeposit) {
        const estimate = await this.contract.estimateGas.depositAndFix(
          tempusAMM,
          tokenAmount,
          isBackingToken,
          minTYSRate,
          {
            value: tokenAmount,
          },
        );
        return await this.contract.depositAndFix(tempusAMM, tokenAmount, isBackingToken, minTYSRate, {
          value: tokenAmount,
          gasLimit: Math.ceil(estimate.toNumber() * depositAndFixGasIncrease),
        });
      } else {
        const estimate = await this.contract.estimateGas.depositAndFix(
          tempusAMM,
          tokenAmount,
          isBackingToken,
          minTYSRate,
        );
        return await this.contract.depositAndFix(tempusAMM, tokenAmount, isBackingToken, minTYSRate, {
          gasLimit: Math.ceil(estimate.toNumber() * depositAndFixGasIncrease),
        });
      }
    } catch (error) {
      console.error(`TempusControllerService depositAndFix() - Failed to deposit backing tokens!`, error);
      return Promise.reject(error);
    }
  }

  public async depositAndProvideLiquidity(
    tempusAMM: string,
    tokenAmount: BigNumber,
    isBackingToken: boolean,
    isEthDeposit?: boolean,
  ): Promise<ContractTransaction> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - depositAndProvideLiquidity() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    try {
      if (isEthDeposit) {
        const estimate = await this.contract.estimateGas.depositAndProvideLiquidity(
          tempusAMM,
          tokenAmount,
          isBackingToken,
          {
            value: tokenAmount,
          },
        );
        return await this.contract.depositAndProvideLiquidity(tempusAMM, tokenAmount, isBackingToken, {
          value: tokenAmount,
          gasLimit: Math.ceil(estimate.toNumber() * depositAndProvideLiquidityGasIncrease),
        });
      } else {
        const estimate = await this.contract.estimateGas.depositAndProvideLiquidity(
          tempusAMM,
          tokenAmount,
          isBackingToken,
        );
        return await this.contract.depositAndProvideLiquidity(tempusAMM, tokenAmount, isBackingToken, {
          gasLimit: Math.ceil(estimate.toNumber() * depositAndProvideLiquidityGasIncrease),
        });
      }
    } catch (error) {
      console.error(
        `TempusControllerService depositAndProvideLiquidity() - Failed to do deposit and provide liquidity!`,
        error,
      );
      return Promise.reject(error);
    }
  }

  public async completeExitAndRedeem(tempusAMM: string, isBackingToken: boolean): Promise<ContractTransaction> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - completeExitAndRedeem() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    const tempusPoolConfig = getConfig().tempusPools.find(
      tempusPoolConfig => tempusPoolConfig.ammAddress === tempusAMM,
    );
    if (!tempusPoolConfig) {
      console.error('TempusControllerService - completeExitAndRedeem() - Failed to get tempus pool config!');
      return Promise.reject();
    }

    const maxLeftoverSharesParsed = ethers.utils.parseEther(tempusPoolConfig.maxLeftoverShares);
    try {
      const estimate = await this.contract.estimateGas.completeExitAndRedeem(
        tempusAMM,
        maxLeftoverSharesParsed,
        isBackingToken,
      );
      return await this.contract.completeExitAndRedeem(tempusAMM, maxLeftoverSharesParsed, isBackingToken, {
        gasLimit: Math.ceil(estimate.toNumber() * completeExitAndRedeemGasIncrease),
      });
    } catch (error) {
      console.error(`TempusControllerService completeExitAndRedeem() - Failed to redeem tokens!`, error);
      return Promise.reject(error);
    }
  }

  async depositYieldBearing(tempusPool: string, amount: BigNumber, recipient: string): Promise<ContractTransaction> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - depositYieldBearing() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    try {
      const estimate = await this.contract.estimateGas.depositYieldBearing(tempusPool, amount, recipient);
      return await this.contract.depositYieldBearing(tempusPool, amount, recipient, {
        gasLimit: Math.ceil(estimate.toNumber() * depositYieldBearingGasIncrease),
      });
    } catch (error) {
      console.error('TempusControllerService - depositYieldBearing() - Failed to deposit yield bearing token!', error);
      return Promise.reject(error);
    }
  }

  async depositBacking(
    tempusPool: string,
    amount: BigNumber,
    recipient: string,
    isEthDeposit?: boolean,
  ): Promise<ContractTransaction> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - depositBacking() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    try {
      if (isEthDeposit) {
        const estimate = await this.contract.estimateGas.depositBacking(tempusPool, amount, recipient, {
          value: amount,
        });
        return await this.contract.depositBacking(tempusPool, amount, recipient, {
          value: amount,
          gasLimit: Math.ceil(estimate.toNumber() * depositBackingGasIncrease),
        });
      } else {
        const estimate = await this.contract.estimateGas.depositBacking(tempusPool, amount, recipient);
        return await this.contract.depositBacking(tempusPool, amount, recipient, {
          gasLimit: Math.ceil(estimate.toNumber() * depositBackingGasIncrease),
        });
      }
    } catch (error) {
      console.error('TempusControllerService - depositBacking() - Failed to deposit backing token!', error);
      return Promise.reject(error);
    }
  }

  async redeemToBacking(tempusPool: string, userWalletAddress: string, amountOfShares: BigNumber) {
    if (!this.contract) {
      console.error(
        'TempusControllerService - redeemToBacking() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    return this.contract.redeemToBacking(
      tempusPool,
      userWalletAddress,
      amountOfShares,
      amountOfShares,
      userWalletAddress,
    );
  }

  async redeemToYieldBearing(tempusPool: string, userWalletAddress: string, amountOfShares: BigNumber) {
    if (!this.contract) {
      console.error(
        'TempusControllerService - redeemToYieldBearing() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    return this.contract.redeemToYieldBearing(
      tempusPool,
      userWalletAddress,
      amountOfShares,
      amountOfShares,
      userWalletAddress,
    );
  }
}

export default TempusControllerService;
