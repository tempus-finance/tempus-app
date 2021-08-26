import { BigNumber, Contract } from 'ethers';
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
  [string, string, string, BigNumber, BigNumber, BigNumber, BigNumber] & {
    pool: string;
    depositor: string;
    recipient: string;
    yieldTokenAmount: BigNumber;
    backingTokenValue: BigNumber;
    shareAmounts: BigNumber;
    interestRate: BigNumber;
  }
>;
export type RedeemedEvent = TypedEvent<
  [string, string, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
    pool: string;
    redeemer: string;
    principalShareAmount: BigNumber;
    yieldShareAmount: BigNumber;
    yieldBearingAmount: BigNumber;
    backingTokenValue: BigNumber;
    interestRate: BigNumber;
  }
>;

class TempusControllerService {
  private contract: TempusController | null = null;

  init(params: TempusControllerServiceParameters) {
    this.contract = new Contract(params.address, params.abi, params.signerOrProvider) as TempusController;
  }

  public async getDepositedEvents(): Promise<DepositedEvent[]> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - getDepositedEvents() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    try {
      return await this.contract.queryFilter(this.contract.filters.Deposited());
    } catch (error) {
      console.error(`TempusControllerService getDepositedEvents() - Failed to get deposited events!`, error);
      return Promise.reject(error);
    }
  }

  public async getRedeemedEvents(): Promise<RedeemedEvent[]> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - getRedeemedEvents() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    try {
      return await this.contract.queryFilter(this.contract.filters.Redeemed());
    } catch (error) {
      console.error(`TempusControllerService getRedeemEvents() - Failed to get redeemed events!`, error);
      return Promise.reject(error);
    }
  }
}

export default TempusControllerService;
