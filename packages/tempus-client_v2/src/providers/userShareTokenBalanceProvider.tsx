import { JsonRpcSigner } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { ERC20 } from '../abi/ERC20';
import ERC20ABI from '../abi/ERC20.json';
import { TempusPool } from '../interfaces/TempusPool';
import { Chain } from '../interfaces/Chain';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { getNetworkConfig, getConfigForPoolWithAddress } from '../utils/getConfig';

export interface UserShareTokenBalanceProviderParams {
  userWalletAddress: string;
  userWalletSigner: JsonRpcSigner;
  chain: Chain;
}

class UserShareTokenBalanceProvider {
  private userWalletAddress: string;
  private userWalletSigner: JsonRpcSigner;
  private chain: Chain;

  private tokenContracts: ERC20[] = [];

  constructor(params: UserShareTokenBalanceProviderParams) {
    this.userWalletAddress = params.userWalletAddress;
    this.userWalletSigner = params.userWalletSigner;
    this.chain = params.chain;
  }

  init() {
    // Make sure to clean previous data before crating new subscriptions
    this.destroy();

    getNetworkConfig(this.chain).tempusPools.forEach(poolConfig => {
      if (!this.userWalletSigner) {
        return;
      }

      const tpsContract = new Contract(poolConfig.principalsAddress, ERC20ABI, this.userWalletSigner) as ERC20;
      tpsContract.on(tpsContract.filters.Transfer(this.userWalletAddress, null), this.updatePrincipalsBalance);
      tpsContract.on(tpsContract.filters.Transfer(null, this.userWalletAddress), this.updatePrincipalsBalance);

      const tysContract = new Contract(poolConfig.yieldsAddress, ERC20ABI, this.userWalletSigner) as ERC20;
      tysContract.on(tysContract.filters.Transfer(this.userWalletAddress, null), this.updateYieldsBalance);
      tysContract.on(tysContract.filters.Transfer(null, this.userWalletAddress), this.updateYieldsBalance);

      this.tokenContracts.push(tpsContract, tysContract);
    });

    // Fetch initial balances on app load
    this.updatePrincipalsBalance();
    this.updateYieldsBalance();
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

    this.updatePrincipalsBalanceForPool(poolConfig);
    this.updateYieldsBalanceForPool(poolConfig);
  }

  private async updatePrincipalsBalanceForPool(poolConfig: TempusPool) {
    if (!this.userWalletSigner) {
      return;
    }

    const tpsContract = new Contract(poolConfig.principalsAddress, ERC20ABI, this.userWalletSigner) as ERC20;
    const balance = await tpsContract.balanceOf(this.userWalletAddress);

    const currentBalance = dynamicPoolDataState[poolConfig.address].userPrincipalsBalance.get();
    // Only update state if fetched user principals balance is different from current user principals balance
    if (!currentBalance || !currentBalance.eq(balance)) {
      dynamicPoolDataState[poolConfig.address].userPrincipalsBalance.set(balance);
    }
  }

  private async updateYieldsBalanceForPool(poolConfig: TempusPool) {
    if (!this.userWalletSigner) {
      return;
    }

    const tysContract = new Contract(poolConfig.yieldsAddress, ERC20ABI, this.userWalletSigner) as ERC20;
    const balance = await tysContract.balanceOf(this.userWalletAddress);

    const currentBalance = dynamicPoolDataState[poolConfig.address].userYieldsBalance.get();
    // Only update state if fetched user yields balance is different from current user yields balance
    if (!currentBalance || !currentBalance.eq(balance)) {
      dynamicPoolDataState[poolConfig.address].userYieldsBalance.set(balance);
    }
  }

  private updatePrincipalsBalance = () => {
    getNetworkConfig(this.chain).tempusPools.forEach(poolConfig => {
      this.updatePrincipalsBalanceForPool(poolConfig);
    });
  };

  private updateYieldsBalance = () => {
    getNetworkConfig(this.chain).tempusPools.forEach(poolConfig => {
      this.updateYieldsBalanceForPool(poolConfig);
    });
  };
}
export default UserShareTokenBalanceProvider;
