import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';
import { Chain, ERC20, ERC20ABI, TempusPool } from 'tempus-core-services';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { getChainConfig, getConfigForPoolWithAddress } from '../utils/getConfig';
import { BalanceProviderParams } from './interfaces';

class UserYieldBearingTokenBalanceProvider {
  private userWalletAddress: string;
  private userWalletSigner: JsonRpcSigner;
  private chain: Chain;

  private tokenContracts: ERC20[] = [];

  constructor(params: BalanceProviderParams) {
    this.userWalletAddress = params.userWalletAddress;
    this.userWalletSigner = params.userWalletSigner;
    this.chain = params.chain;
  }

  init() {
    // Make sure to clean previous data before crating new subscriptions
    this.destroy();

    getChainConfig(this.chain).tempusPools.forEach(poolConfig => {
      if (!this.userWalletSigner) {
        return;
      }

      const ybtContract = new Contract(poolConfig.yieldBearingTokenAddress, ERC20ABI, this.userWalletSigner) as ERC20;
      ybtContract.on(ybtContract.filters.Transfer(this.userWalletAddress, null), this.updateYieldBearingTokensBalance);
      ybtContract.on(ybtContract.filters.Transfer(null, this.userWalletAddress), this.updateYieldBearingTokensBalance);

      this.tokenContracts.push(ybtContract);
    });

    // Fetch initial balances on app load
    this.updateYieldBearingTokensBalance();
  }

  destroy() {
    this.tokenContracts.forEach(tokenContract => {
      tokenContract.removeAllListeners();
    });
    this.tokenContracts = [];
  }

  /**
   * Manually trigger user balance update. Can be called after user action that affects user balance.
   */
  fetchForPool(address: string, blockTag?: number) {
    const poolConfig = getConfigForPoolWithAddress(address);

    this.updateYieldBearingTokenBalanceForPool(poolConfig, blockTag);
  }

  private async updateYieldBearingTokenBalanceForPool(poolConfig: TempusPool, blockTag?: number) {
    if (!this.userWalletSigner) {
      return;
    }

    const ybtContract = new Contract(poolConfig.yieldBearingTokenAddress, ERC20ABI, this.userWalletSigner) as ERC20;
    let balance: BigNumber;
    try {
      balance = await ybtContract.balanceOf(this.userWalletAddress, {
        blockTag,
      });
    } catch (error) {
      console.error(
        'UserYieldBearingTokenBalanceProvider - updateYieldBearingTokenBalanceForPool() - Failed to fetch new user ybt balance!',
      );
      return Promise.reject();
    }

    const currentBalance = dynamicPoolDataState[poolConfig.address].userYieldBearingTokenBalance.get();
    // Only update state if fetched user principals balance is different from current user principals balance
    if (!currentBalance || !currentBalance.eq(balance)) {
      dynamicPoolDataState[poolConfig.address].userYieldBearingTokenBalance.set(balance);
    }
  }

  private updateYieldBearingTokensBalance = () => {
    getChainConfig(this.chain).tempusPools.forEach(poolConfig => {
      this.updateYieldBearingTokenBalanceForPool(poolConfig);
    });
  };
}
export default UserYieldBearingTokenBalanceProvider;
