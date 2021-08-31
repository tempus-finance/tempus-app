import { BigNumber, Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { Vault } from '../abi/Vault';
import VaultABI from '../abi/Vault.json';
import { TypedEvent } from '../abi/commons';

type VaultServiceParameters = {
  Contract: typeof Contract;
  address: string;
  abi: typeof VaultABI;
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
};

// I need to define event types like this, because TypeChain plugin for Hardhat does not generate them.
// TODO - Use event types from auto generated contract typings file when TypeChain plugin for Hardhat adds them.
// See: https://github.com/ethereum-ts/TypeChain/issues/454
export type SwapEvent = TypedEvent<
  [string, string, string, BigNumber, BigNumber] & {
    poolId: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: BigNumber;
    amountOut: BigNumber;
  }
>;

class VaultService {
  private contract: Vault | null = null;

  public init(params: VaultServiceParameters) {
    this.contract = new Contract(params.address, params.abi, params.signerOrProvider) as Vault;
  }

  public async getSwapEvents(): Promise<SwapEvent[]> {
    if (!this.contract) {
      console.error('VaultService - getSwapEvents() - Attempted to use VaultService before initializing it!');
      return Promise.reject();
    }

    try {
      return await this.contract.queryFilter(this.contract.filters.Swap());
    } catch (error) {
      console.error(`VaultService - getSwapEvents() - Failed to get swap events!`, error);
      return Promise.reject(error);
    }
  }
}

export default VaultService;
