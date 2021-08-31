import { BigNumber, Contract, ethers } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { Vault } from '../abi/Vault';
import VaultABI from '../abi/Vault.json';
import { TypedEvent } from '../abi/commons';
import getDefaultProvider from './getDefaultProvider';
import { SECONDS_IN_AN_HOUR } from '../constants';

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

/**
 * Swap Given In means we want to give in specified amount of tokens, for unknown amount of some other token
 * Swap Given Out means we want to give unknown amount of tokens, for specified amount of some other token
 */
export enum SwapKind {
  GIVEN_IN = 0,
  GIVEN_OUT = 1,
}

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

  /**
   * @description Make sure to give approval of 'amount' of 'assetIn' tokens to Vault address
   */
  public async swap(
    poolId: string,
    kind: SwapKind,
    fromAddress: string,
    assetInAddress: string,
    assetOutAddress: string,
    amount: number,
  ) {
    if (!this.contract) {
      console.error('VaultService - swap() - Attempted to use VaultService before initializing it!');
      return Promise.reject();
    }

    const provider = getDefaultProvider();
    const latestBlock = await provider.getBlock('latest');

    const singleSwap = {
      poolId: poolId,
      kind: kind,
      assetIn: assetInAddress,
      assetOut: assetOutAddress,
      amount: ethers.utils.parseEther(amount.toString()),
      userData: ethers.utils.formatBytes32String('0x0'),
    };

    const fundManagement = {
      sender: fromAddress,
      fromInternalBalance: false,
      recipient: fromAddress,
      toInternalBalance: false,
    };

    const minimumReturn = 1;
    const deadline = latestBlock.timestamp + SECONDS_IN_AN_HOUR;

    return this.contract.swap(singleSwap, fundManagement, minimumReturn, deadline);
  }
}

export default VaultService;
