import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';
import VaultABI from '../abi/Vault.json';
import { Chain } from '../interfaces/Chain';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { getChainConfig, getConfigForPoolWithId } from '../utils/getConfig';

export interface PoolShareBalanceProviderParams {
  userWalletSigner: JsonRpcSigner;
  chain: Chain;
}

class PoolShareBalanceProvider {
  private userWalletSigner: JsonRpcSigner;
  private chain: Chain;

  private vaultContract: Contract | null = null;

  /**
   * Subscribes to PoolBalanceChanged event, every time this event is fired on blockchain we trigger pool share balance fetch for all tempus pools.
   */
  constructor(params: PoolShareBalanceProviderParams) {
    this.userWalletSigner = params.userWalletSigner;
    this.chain = params.chain;
  }

  init() {
    // Clean up previous subscriptions
    this.destroy();

    const config = getChainConfig(this.chain);

    this.vaultContract = new Contract(config.vaultContract, VaultABI, this.userWalletSigner);
    config.tempusPools.forEach(poolConfig => {
      if (!this.vaultContract) {
        return;
      }

      this.vaultContract.on(
        this.vaultContract.filters.PoolBalanceChanged(poolConfig.poolId),
        this.onPoolBalanceChanged,
      );

      // Fetch balance on app load
      this.fetchPoolBalance(poolConfig.poolId);
    });
  }

  /**
   * Call this to cleanup PoolBalanceChanged event subscriptions.
   */
  destroy() {
    if (this.vaultContract) {
      this.vaultContract.removeAllListeners();
      this.vaultContract = null;
    }
  }

  /**
   * Call this function to manually trigger pool share balance fetch.
   * It can be called after any user action that can potentially affect pool share balance.
   * Even if this is not called, pool share balance will update on every PoolBalanceChanged event,
   * but sometimes events do not trigger immediately which results in a delayed UI update,
   * so with this manual trigger we can make sure that fetch is performed immediately after
   * user action and UI is promptly updated.
   */
  fetchForPoolWithId(poolId: string, blockTag?: number) {
    this.fetchPoolBalance(poolId, blockTag);
  }

  private onPoolBalanceChanged = async (poolId: string) => {
    this.fetchPoolBalance(poolId);
  };

  private async fetchPoolBalance(poolId: string, blockTag?: number) {
    if (!this.vaultContract) {
      return;
    }

    const poolConfig = getConfigForPoolWithId(poolId);

    let poolTokens: {
      tokens: string[];
      balances: BigNumber[];
      lastChangeBlock: BigNumber;
    };
    try {
      poolTokens = await this.vaultContract.getPoolTokens(poolId, {
        blockTag,
      });
    } catch (error) {
      console.error(
        'PoolShareBalanceProvider - fetchPoolBalance() - Failed to fetch pool balance, skipping state update!',
      );
      return;
    }

    const principalsAddress = poolConfig.principalsAddress;
    const yieldsAddress = poolConfig.yieldsAddress;

    const principalsIndex = poolTokens.tokens.findIndex(tokenAddress => tokenAddress === principalsAddress);
    const yieldsIndex = poolTokens.tokens.findIndex(tokenAddress => tokenAddress === yieldsAddress);

    const principalsBalance = poolTokens.balances[principalsIndex];
    const yieldsBalance = poolTokens.balances[yieldsIndex];

    const poolBalanceState = dynamicPoolDataState[poolConfig.address].poolShareBalance;
    // Only update pool principals balance state if new value is different from previous value or current value is null (ie not yet fetched)
    if (poolBalanceState.principals.value === null || !poolBalanceState.principals.value.eq(principalsBalance)) {
      poolBalanceState.principals.set(principalsBalance);
    }

    // Only update pool yields balance state if new value is different from previous value or current value is null (ie not yet fetched)
    if (poolBalanceState.yields.value === null || !poolBalanceState.yields.value.eq(yieldsBalance)) {
      poolBalanceState.yields.set(yieldsBalance);
    }
  }
}
export default PoolShareBalanceProvider;
