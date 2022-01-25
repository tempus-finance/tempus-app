import { Contract } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import ERC20ABI from '../abi/ERC20.json';
import { ERC20 } from '../abi/ERC20';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { TempusPool } from '../interfaces/TempusPool';
import getConfig, { getConfigForPoolWithAddress } from '../utils/getConfig';
import { selectedChainState } from '../state/ChainState';

export interface UserLPTokenBalanceProviderParams {
  userWalletAddress: string;
  userWalletSigner: JsonRpcSigner;
}

class UserLPTokenBalanceProvider {
  private userWalletAddress: string = '';
  private userWalletSigner: JsonRpcSigner | null = null;

  private tokenContracts: ERC20[] = [];

  constructor(params: UserLPTokenBalanceProviderParams) {
    this.userWalletAddress = params.userWalletAddress;
    this.userWalletSigner = params.userWalletSigner;
  }

  init() {
    // Make sure to clean previous data before crating new subscriptions
    this.destroy();

    getConfig()[selectedChainState.get()].tempusPools.forEach(poolConfig => {
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
  fetchForPool(address: string) {
    const poolConfig = getConfigForPoolWithAddress(address);

    this.updateLPTokenBalanceForPool(poolConfig);
  }

  private async updateLPTokenBalanceForPool(poolConfig: TempusPool) {
    if (!this.userWalletSigner) {
      return;
    }

    const lpTokenContract = new Contract(poolConfig.ammAddress, ERC20ABI, this.userWalletSigner) as ERC20;
    const balance = await lpTokenContract.balanceOf(this.userWalletAddress);

    const currentBalance = dynamicPoolDataState[poolConfig.address].userLPTokenBalance.get();
    // Only update state if fetched user principals balance is different from current user principals balance
    if (!currentBalance || !currentBalance.eq(balance)) {
      dynamicPoolDataState[poolConfig.address].userLPTokenBalance.set(balance);
    }
  }

  private updateLPTokenBalance = () => {
    getConfig()[selectedChainState.get()].tempusPools.forEach(poolConfig => {
      this.updateLPTokenBalanceForPool(poolConfig);
    });
  };
}
export default UserLPTokenBalanceProvider;
