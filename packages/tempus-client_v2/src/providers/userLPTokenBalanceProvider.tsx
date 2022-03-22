import { BigNumber, Contract } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Chain, ERC20, ERC20ABI, TempusPool } from 'tempus-core-services';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { getConfigForPoolWithAddress, getChainConfig } from '../utils/getConfig';

export interface UserLPTokenBalanceProviderParams {
  userWalletAddress: string;
  userWalletSigner: JsonRpcSigner;
  chain: Chain;
}

class UserLPTokenBalanceProvider {
  private userWalletAddress: string = '';
  private userWalletSigner: JsonRpcSigner;
  private chain: Chain;

  private tokenContracts: ERC20[] = [];

  constructor(params: UserLPTokenBalanceProviderParams) {
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

      const lpTokenContract = new Contract(poolConfig.ammAddress, ERC20ABI, this.userWalletSigner) as ERC20;
      lpTokenContract.on(lpTokenContract.filters.Transfer(this.userWalletAddress, null), this.updateLPTokenBalance);
      lpTokenContract.on(lpTokenContract.filters.Transfer(null, this.userWalletAddress), this.updateLPTokenBalance);

      this.tokenContracts.push(lpTokenContract);
    });

    // Fetch initial balances on app load
    this.updateLPTokenBalance();
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

    this.updateLPTokenBalanceForPool(poolConfig, blockTag);
  }

  private async updateLPTokenBalanceForPool(poolConfig: TempusPool, blockTag?: number) {
    if (!this.userWalletSigner) {
      return;
    }

    const lpTokenContract = new Contract(poolConfig.ammAddress, ERC20ABI, this.userWalletSigner) as ERC20;

    let balance: BigNumber;
    try {
      balance = await lpTokenContract.balanceOf(this.userWalletAddress, {
        blockTag,
      });
    } catch (error) {
      console.error(
        'UserLPTokenBalanceProvider - updateLPTokenBalanceForPool() - Failed to fetch new user LP balance!',
      );
      return Promise.reject();
    }

    const currentBalance = dynamicPoolDataState[poolConfig.address].userLPTokenBalance.get();
    // Only update state if fetched user principals balance is different from current user principals balance
    if (!currentBalance || !currentBalance.eq(balance)) {
      dynamicPoolDataState[poolConfig.address].userLPTokenBalance.set(balance);
    }
  }

  private updateLPTokenBalance = () => {
    getChainConfig(this.chain).tempusPools.forEach(poolConfig => {
      this.updateLPTokenBalanceForPool(poolConfig);
    });
  };
}
export default UserLPTokenBalanceProvider;
