import { BigNumber, Contract, ContractTransaction } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { TempusController } from '../abi/TempusController';
import TempusControllerABI from '../abi/TempusController.json';
import { TypedEvent } from '../abi/commons';

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
      return await this.contract.queryFilter(this.contract.filters.Redeemed(forPool, forUser));
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
  ): Promise<ContractTransaction> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - depositAndFix() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    try {
      return await this.contract.depositAndFix(tempusAMM, tokenAmount, isBackingToken, minTYSRate);
    } catch (error) {
      console.error(`TempusControllerService depositAndFix() - Failed to deposit backing tokens!`, error);
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

    try {
      return await this.contract.completeExitAndRedeem(tempusAMM, isBackingToken);
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
      return await this.contract.depositYieldBearing(tempusPool, amount, recipient);
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
        return await this.contract.depositBacking(tempusPool, amount, recipient, {
          value: amount,
        });
      } else {
        return await this.contract.depositBacking(tempusPool, amount, recipient);
      }
    } catch (error) {
      console.error('TempusControllerService - depositBacking() - Failed to deposit backing token!', error);
      return Promise.reject(error);
    }
  }
}

export default TempusControllerService;
