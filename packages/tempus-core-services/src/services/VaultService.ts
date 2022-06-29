import { BigNumber, Contract, ethers, ContractTransaction, CallOverrides } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { Vault } from '../abi/VaultTypings';
import VaultABI from '../abi/VaultABI.json';
import { TypedEvent, TypedListener } from '../abi/commons';
import { provideLiquidityGasIncrease, removeLiquidityGasIncrease, SECONDS_IN_AN_HOUR } from '../constants';
import { ChainConfig, Chain } from '../interfaces';
import { TempusAMMService } from './TempusAMMService';
import { getDefaultProvider } from './getDefaultProvider';

type VaultServiceParameters = {
  Contract: typeof Contract;
  address: string;
  abi: typeof VaultABI;
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
  tempusAMMService: TempusAMMService;
  chain: Chain;
  getChainConfig: (chain: Chain) => ChainConfig;
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

export class VaultService {
  private chain: Chain | null = null;
  private contract: Vault | null = null;
  private getChainConfig: ((chain: Chain) => ChainConfig) | null = null;
  private tempusAMMService: TempusAMMService | null = null;

  public init({ address, abi, chain, tempusAMMService, getChainConfig, signerOrProvider }: VaultServiceParameters) {
    this.contract = new Contract(address, abi, signerOrProvider) as Vault;

    this.tempusAMMService = tempusAMMService;
    this.getChainConfig = getChainConfig;
    this.chain = chain;
  }

  public async getSwapEvents(filters: {
    forPoolId?: string;
    fromBlock?: number;
    toBlock?: number;
  }): Promise<SwapEvent[]> {
    if (!this.contract || !this.tempusAMMService || !this.chain) {
      console.error('VaultService - getSwapEvents() - Attempted to use VaultService before initializing it!');
      return Promise.reject();
    }

    const fetchSwapEventPromises: Promise<SwapEvent[]>[] = [];
    if (!filters.forPoolId) {
      try {
        this.getChainConfig &&
          this.getChainConfig(this.chain).tempusPools.forEach(tempusPool => {
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
    if (!this.contract || !this.tempusAMMService || !this.chain) {
      console.error(
        'VaultService - getPoolBalanceChangedEvents() - Attempted to use VaultService before initializing it!',
      );
      return Promise.reject();
    }

    const fetchEventsPromises: Promise<PoolBalanceChangedEvent[]>[] = [];
    if (!forPoolId) {
      try {
        this.getChainConfig &&
          this.getChainConfig(this.chain).tempusPools.forEach(pool => {
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
        console.error(`VaultService - getPoolBalanceChangedEvents() - Failed to get PoolBalanceChanged events!`, error);
        return Promise.reject(error);
      }
    } else {
      try {
        fetchEventsPromises.push(
          this.contract.queryFilter(this.contract.filters.PoolBalanceChanged(forPoolId), fromBlock),
        );
      } catch (error) {
        console.error(`VaultService - getPoolBalanceChangedEvents() - Failed to get PoolBalanceChanged events!`, error);
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
    minReturn: BigNumber,
  ): Promise<ethers.ContractTransaction> {
    if (!this.contract || !this.chain || !this.getChainConfig) {
      console.error('VaultService - swap() - Attempted to use VaultService before initializing it!');
      return Promise.reject();
    }

    const provider = getDefaultProvider(this.chain);
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

    const deadline = latestBlock.timestamp + SECONDS_IN_AN_HOUR;

    const estimate = await this.contract.estimateGas.swap(singleSwap, fundManagement, minReturn, deadline);
    return this.contract.swap(singleSwap, fundManagement, minReturn, deadline, {
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

    const joinPoolRequest = {
      assets: assets.map(({ address }) => address),
      maxAmountsIn: initialBalances,
      userData: initUserData,
      fromInternalBalance: false,
    };

    try {
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
    minPrincipalsReceived: BigNumber,
    minYieldsReceived: BigNumber,
  ): Promise<ethers.ContractTransaction> {
    if (!this.contract) {
      console.error('VaultService - removeLiquidity() - Attempted to use VaultService before initializing it!');
      return Promise.reject();
    }

    const assets = [
      { address: principalAddress, minAmount: minPrincipalsReceived },
      { address: yieldsAddress, minAmount: minYieldsReceived },
    ].sort((a, b) => parseInt(a.address) - parseInt(b.address));

    const exitUserData = ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'uint256'],
      [TempusAMMExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT, lpAmount],
    );

    const exitPoolRequest = {
      assets: assets.map(({ address }) => address),
      minAmountsOut: assets.map(({ minAmount }) => minAmount),
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

  async getPoolTokens(
    poolId: string,
    overrides?: CallOverrides,
  ): Promise<
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
      if (overrides) {
        return this.contract.getPoolTokens(poolId, overrides);
      } else {
        return this.contract.getPoolTokens(poolId);
      }
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
