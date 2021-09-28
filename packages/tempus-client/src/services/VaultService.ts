import { BigNumber, Contract, ethers } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { Vault } from '../abi/Vault';
import VaultABI from '../abi/Vault.json';
import { TypedEvent } from '../abi/commons';
import getDefaultProvider from './getDefaultProvider';
import TempusAMMService from './TempusAMMService';
import { SECONDS_IN_AN_HOUR } from '../constants';
import getConfig from '../utils/get-config';

type VaultServiceParameters = {
  Contract: typeof Contract;
  address: string;
  abi: typeof VaultABI;
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
  tempusAMMService: TempusAMMService;
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

  private tempusAMMService: TempusAMMService | null = null;

  public init(params: VaultServiceParameters) {
    this.contract = new Contract(params.address, params.abi, params.signerOrProvider) as Vault;

    this.tempusAMMService = params.tempusAMMService;
  }

  public async getSwapEvents(): Promise<SwapEvent[]> {
    if (!this.contract || !this.tempusAMMService) {
      console.error('VaultService - getSwapEvents() - Attempted to use VaultService before initializing it!');
      return Promise.reject();
    }

    let poolIDs: string[] = [];
    try {
      const fetchPoolIdPromises: Promise<string>[] = [];
      getConfig().tempusPools.forEach(tempusPool => {
        if (!this.tempusAMMService) {
          throw new Error('VaultService - getSwapEvents() - Attempted to use VaultService before initializing it!');
        }
        fetchPoolIdPromises.push(this.tempusAMMService.poolId(tempusPool.ammAddress));
      });
      poolIDs = await Promise.all(fetchPoolIdPromises);
    } catch (error) {
      console.error('VaultService - getSwapEvents() - Failed to get IDs for tempus pools!', error);
      return Promise.reject(error);
    }

    try {
      const fetchSwapEventPromises: Promise<SwapEvent[]>[] = [];
      poolIDs.forEach(poolID => {
        if (!this.contract) {
          throw new Error('VaultService - getSwapEvents() - Attempted to use VaultService before initializing it!');
        }

        fetchSwapEventPromises.push(this.contract.queryFilter(this.contract.filters.Swap(poolID)));
      });
      return (await Promise.all(fetchSwapEventPromises)).flat();
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
    amount: BigNumber,
  ): Promise<ethers.ContractTransaction> {
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
      amount: amount,
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

  async getPoolTokens(poolId: string): Promise<
    [string[], BigNumber[], BigNumber] & {
      tokens: string[];
      balances: BigNumber[];
      lastChangeBlock: BigNumber;
    }
  > {
    if (!this.contract) {
      console.error('VaultService - getPoolTokens() - Attempted to use VaultService before initializing it!');
      return Promise.reject();
    }

    try {
      return this.contract.getPoolTokens(poolId);
    } catch (error) {
      console.error(`VaultService - getPoolTokens() - Failed to get pool tokens!`, error);
      return Promise.reject(error);
    }
  }
}

export default VaultService;
