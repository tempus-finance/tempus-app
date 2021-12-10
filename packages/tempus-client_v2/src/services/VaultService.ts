import { BigNumber, Contract, ethers, ContractTransaction } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { Vault } from '../abi/Vault';
import VaultABI from '../abi/Vault.json';
import { TypedEvent, TypedListener } from '../abi/commons';
import getDefaultProvider from './getDefaultProvider';
import TempusAMMService from './TempusAMMService';
import { provideLiquidityGasIncrease, removeLiquidityGasIncrease, SECONDS_IN_AN_HOUR } from '../constants';
import getConfig from '../utils/getConfig';

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
export type PoolBalanceChangedEvent = TypedEvent<
  [string, string, string[], BigNumber[], BigNumber[]] & {
    poolId: string;
    liquidityProvider: string;
    tokens: string[];
    deltas: BigNumber[];
    protocolFeeAmounts: BigNumber[];
  }
>;

export type PoolBalanceChangedEventListener = TypedListener<
  [string, string, string[], BigNumber[], BigNumber[]],
  {
    poolId: string;
    liquidityProvider: string;
    tokens: string[];
    deltas: BigNumber[];
    protocolFeeAmounts: BigNumber[];
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

export enum TempusAMMJoinKind {
  INIT = 0,
  EXACT_TOKENS_IN_FOR_BPT_OUT = 1,
}

export enum TempusAMMExitKind {
  EXACT_BPT_IN_FOR_TOKENS_OUT = 0,
  BPT_IN_FOR_EXACT_TOKENS_OUT = 1,
}

class VaultService {
  private contract: Vault | null = null;

  private tempusAMMService: TempusAMMService | null = null;

  public init(params: VaultServiceParameters) {
    this.contract = new Contract(params.address, params.abi, params.signerOrProvider) as Vault;

    this.tempusAMMService = params.tempusAMMService;
  }

  public async getSwapEvents(filters: {
    forPoolId?: string;
    fromBlock?: number;
    toBlock?: number;
  }): Promise<SwapEvent[]> {
    if (!this.contract || !this.tempusAMMService) {
      console.error('VaultService - getSwapEvents() - Attempted to use VaultService before initializing it!');
      return Promise.reject();
    }

    const fetchSwapEventPromises: Promise<SwapEvent[]>[] = [];
    if (!filters.forPoolId) {
      try {
        getConfig().tempusPools.forEach(tempusPool => {
          if (!this.contract) {
            throw new Error('VaultService - getSwapEvents() - Attempted to use VaultService before initializing it!');
          }

          fetchSwapEventPromises.push(
            this.contract.queryFilter(
              this.contract.filters.Swap(tempusPool.poolId),
              filters.fromBlock,
              filters.toBlock,
            ),
          );
        });
      } catch (error) {
        console.error(`VaultService - getSwapEvents() - Failed to get swap events!`, error);
        return Promise.reject(error);
      }
    } else {
      try {
        fetchSwapEventPromises.push(
          this.contract.queryFilter(this.contract.filters.Swap(filters.forPoolId), filters.fromBlock, filters.toBlock),
        );
      } catch (error) {
        console.error(`VaultService - getSwapEvents() - Failed to get swap events!`, error);
        return Promise.reject(error);
      }
    }

    return (await Promise.all(fetchSwapEventPromises)).flat();
  }

  public async getPoolBalanceChangedEvents(forPoolId?: string, fromBlock?: number): Promise<PoolBalanceChangedEvent[]> {
    if (!this.contract || !this.tempusAMMService) {
      console.error(
        'VaultService - getPoolBalanceChangedEvents() - Attempted to use VaultService before initializing it!',
      );
      return Promise.reject();
    }

    const fetchEventsPromises: Promise<PoolBalanceChangedEvent[]>[] = [];
    if (!forPoolId) {
      try {
        getConfig().tempusPools.forEach(pool => {
          if (!this.contract) {
            throw new Error(
              'VaultService - getPoolBalanceChangedEvents() - Attempted to use VaultService before initializing it!',
            );
          }

          fetchEventsPromises.push(
            this.contract.queryFilter(this.contract.filters.PoolBalanceChanged(pool.poolId), fromBlock),
          );
        });
      } catch (error) {
        console.error(`VaultService - getPoolBalanceChangedEvents() - Failed to get swap events!`, error);
        return Promise.reject(error);
      }
    } else {
      try {
        fetchEventsPromises.push(
          this.contract.queryFilter(this.contract.filters.PoolBalanceChanged(forPoolId), fromBlock),
        );
      } catch (error) {
        console.error(`VaultService - getPoolBalanceChangedEvents() - Failed to get swap events!`, error);
        return Promise.reject(error);
      }
    }

    return (await Promise.all(fetchEventsPromises)).flat();
  }

  /**
   * @description Make sure to give approval of 'amount' of 'assetIn' tokens to Vault address
   */
  public async swap(
    poolId: string,
    kind: SwapKind,
    fromAddress: string,
    assetIn: string,
    assetOut: string,
    amount: BigNumber,
  ): Promise<ethers.ContractTransaction> {
    if (!this.contract) {
      console.error('VaultService - swap() - Attempted to use VaultService before initializing it!');
      return Promise.reject();
    }

    const provider = getDefaultProvider();
    const latestBlock = await provider.getBlock('latest');

    const singleSwap = {
      poolId,
      kind,
      assetIn,
      assetOut,
      amount,
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

    const estimate = await this.contract.estimateGas.swap(singleSwap, fundManagement, minimumReturn, deadline);
    return this.contract.swap(singleSwap, fundManagement, minimumReturn, deadline, {
      gasLimit: Math.ceil(estimate.toNumber() * 1.1),
    });
  }

  async provideLiquidity(
    poolId: string,
    userWalletAddress: string,
    principalsAddress: string,
    yieldsAddress: string,
    principalsIn: BigNumber,
    yieldsIn: BigNumber,
  ): Promise<ContractTransaction> {
    if (!this.contract) {
      console.error('VaultService - provideLiquidity() - Attempted to use VaultService before initializing it!');
      return Promise.reject();
    }
    let kind = TempusAMMJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT;

    try {
      const poolTokens = await this.contract.getPoolTokens(poolId);
      // If current liquidity is zero we need to init pool first
      if (poolTokens.balances[0].isZero() && poolTokens.balances[1].isZero()) {
        if (principalsIn.isZero() || yieldsIn.isZero()) {
          return Promise.reject('Both tokens in must be non-zero amount when initializing the pool!');
        }

        kind = TempusAMMJoinKind.INIT;
      }
    } catch (error) {
      console.error('VaultService - provideLiquidity() - Failed to check tempus pool AMM balance!', error);
      return Promise.reject();
    }

    const assets = [
      { address: principalsAddress, amount: principalsIn },
      { address: yieldsAddress, amount: yieldsIn },
    ].sort((a, b) => parseInt(a.address) - parseInt(b.address));

    const initialBalances = assets.map(({ amount }) => amount);

    const initUserData = ethers.utils.defaultAbiCoder.encode(['uint256', 'uint256[]'], [kind, initialBalances]);

    const assetAddresses = assets.map(({ address }) => address);

    const joinPoolRequest = {
      assets: assetAddresses,
      maxAmountsIn: initialBalances,
      userData: initUserData,
      fromInternalBalance: false,
    };

    try {
      debugger;

      const estimate = await this.contract.estimateGas.joinPool(
        poolId,
        userWalletAddress,
        userWalletAddress,
        joinPoolRequest,
      );
      return await this.contract.joinPool(poolId, userWalletAddress, userWalletAddress, joinPoolRequest, {
        gasLimit: Math.ceil(estimate.toNumber() * provideLiquidityGasIncrease),
      });
    } catch (error) {
      console.error('VaultService - provideLiquidity() - Failed to provide liquidity to tempus pool AMM!', error);
      return Promise.reject();
    }
  }

  async removeLiquidity(
    poolId: string,
    userWalletAddress: string,
    principalAddress: string,
    yieldsAddress: string,
    lpAmount: BigNumber,
  ): Promise<ethers.ContractTransaction> {
    if (!this.contract) {
      console.error('VaultService - removeLiquidity() - Attempted to use VaultService before initializing it!');
      return Promise.reject();
    }

    const assets = [{ address: principalAddress }, { address: yieldsAddress }].sort(
      (a, b) => parseInt(a.address) - parseInt(b.address),
    );

    const exitUserData = ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'uint256'],
      [TempusAMMExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT, lpAmount],
    );

    const exitPoolRequest = {
      assets: assets.map(({ address }) => address),
      minAmountsOut: [10000, 10000],
      userData: exitUserData,
      toInternalBalance: false,
    };

    try {
      const estimate = await this.contract.estimateGas.exitPool(
        poolId,
        userWalletAddress,
        userWalletAddress,
        exitPoolRequest,
      );
      return await this.contract.exitPool(poolId, userWalletAddress, userWalletAddress, exitPoolRequest, {
        gasLimit: Math.ceil(estimate.toNumber() * removeLiquidityGasIncrease),
      });
    } catch (error) {
      console.error('VaultService - removeLiquidity() - Failed to remove liquidity from tempus pool AMM!', error);
      return Promise.reject();
    }
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

  onPoolBalanceChanged(poolId: string, listener: PoolBalanceChangedEventListener) {
    if (this.contract) {
      this.contract.on(this.contract.filters.PoolBalanceChanged(poolId), listener);
    }
  }

  offPoolBalanceChanged(poolId: string, listener: PoolBalanceChangedEventListener) {
    if (this.contract) {
      this.contract.off(this.contract.filters.PoolBalanceChanged(poolId), listener);
    }
  }
}

export default VaultService;
