import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';
import { CONSTANTS, Chain, ERC20, ERC20ABI, TempusPool } from 'tempus-core-services';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { getChainConfig, getConfigForPoolWithAddress } from '../utils/getConfig';
import { BalanceProviderParams } from './interfaces';

const { ZERO_ETH_ADDRESS } = CONSTANTS;

class UserBackingTokenBalanceProvider {
  private userWalletAddress: string;
  private userWalletSigner: JsonRpcSigner;
  private chain: Chain;

  private tokenContracts: ERC20[] = [];

  constructor(params: BalanceProviderParams) {
    this.userWalletAddress = params.userWalletAddress;
    this.userWalletSigner = params.userWalletSigner;
    this.chain = params.chain;
  }

  init(userWalletAddress: string, userWalletSigner: JsonRpcSigner, chain: Chain) {
    // Make sure to clean previous data before crating new subscriptions
    this.destroy();

    this.userWalletAddress = userWalletAddress;
    this.userWalletSigner = userWalletSigner;
    this.chain = chain;

    getChainConfig(this.chain).tempusPools.forEach(poolConfig => {
      if (!this.userWalletSigner) {
        return;
      }

      const btContract = new Contract(poolConfig.backingTokenAddress, ERC20ABI, this.userWalletSigner) as ERC20;
      btContract.on(btContract.filters.Transfer(this.userWalletAddress, null), this.updateBackingTokensBalance);
      btContract.on(btContract.filters.Transfer(null, this.userWalletAddress), this.updateBackingTokensBalance);

      this.tokenContracts.push(btContract);
    });

    // Fetch initial balances on app load
    this.updateBackingTokensBalance();
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

    this.updateBackingTokenBalanceForPool(poolConfig, blockTag);
  }

  private async updateBackingTokenBalanceForPool(poolConfig: TempusPool, blockTag?: number) {
    if (!this.userWalletSigner) {
      return;
    }

    const btContract = new Contract(poolConfig.backingTokenAddress, ERC20ABI, this.userWalletSigner) as ERC20;
    let balance: BigNumber;
    try {
      if (btContract.address === ZERO_ETH_ADDRESS) {
        balance = await btContract.provider.getBalance(this.userWalletAddress, blockTag);
      } else {
        balance = await btContract.balanceOf(this.userWalletAddress, {
          blockTag,
        });
      }
    } catch (error) {
      console.error(
        'UserBackingTokenBalanceProvider - updateBackingTokenBalanceForPool() - Failed to fetch new user bt balance!',
      );
      return Promise.reject();
    }

    const currentBalance = dynamicPoolDataState[poolConfig.address].userBackingTokenBalance.get();
    // Only update state if fetched user principals balance is different from current user principals balance
    if (!currentBalance || !currentBalance.eq(balance)) {
      dynamicPoolDataState[poolConfig.address].userBackingTokenBalance.set(balance);
    }
  }

  private updateBackingTokensBalance = () => {
    getChainConfig(this.chain).tempusPools.forEach(poolConfig => {
      this.updateBackingTokenBalanceForPool(poolConfig);
    });
  };
}
export default UserBackingTokenBalanceProvider;
