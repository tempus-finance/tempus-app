import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';
import { ERC20 } from '../abi/ERC20';
import ERC20ABI from '../abi/ERC20.json';
import { TempusPool } from '../interfaces/TempusPool';
import { Chain } from '../interfaces/Chain';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { getChainConfig, getConfigForPoolWithAddress } from '../utils/getConfig';
import { BalanceProviderParams } from './interfaces';

class UserShareTokenBalanceProvider {
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
  fetchForPool(address: string, blockTag?: number) {
    const poolConfig = getConfigForPoolWithAddress(address);

    this.updatePrincipalsBalanceForPool(poolConfig, blockTag);
    this.updateYieldsBalanceForPool(poolConfig, blockTag);
  }

  private async updatePrincipalsBalanceForPool(poolConfig: TempusPool, blockTag?: number) {
    if (!this.userWalletSigner) {
      return;
    }

    const tpsContract = new Contract(poolConfig.principalsAddress, ERC20ABI, this.userWalletSigner) as ERC20;
    let balance: BigNumber;
    try {
      balance = await tpsContract.balanceOf(this.userWalletAddress, {
        blockTag,
      });
    } catch (error) {
      console.error(
        'UserShareTokenBalanceProvider - updatePrincipalsBalanceForPool() - Failed to fetch new user capital balance!',
      );
      return Promise.reject();
    }

    const currentBalance = dynamicPoolDataState[poolConfig.address].userPrincipalsBalance.get();
    // Only update state if fetched user principals balance is different from current user principals balance
    if (!currentBalance || !currentBalance.eq(balance)) {
      dynamicPoolDataState[poolConfig.address].userPrincipalsBalance.set(balance);
    }
  }

  private async updateYieldsBalanceForPool(poolConfig: TempusPool, blockTag?: number) {
    if (!this.userWalletSigner) {
      return;
    }

    const tysContract = new Contract(poolConfig.yieldsAddress, ERC20ABI, this.userWalletSigner) as ERC20;
    let balance: BigNumber;
    try {
      balance = await tysContract.balanceOf(this.userWalletAddress, {
        blockTag,
      });
    } catch (error) {
      console.error(
        'UserShareTokenBalanceProvider - updateYieldsBalanceForPool() - Failed to fetch new user yield balance!',
      );
      return Promise.reject();
    }

    const currentBalance = dynamicPoolDataState[poolConfig.address].userYieldsBalance.get();
    // Only update state if fetched user yields balance is different from current user yields balance
    if (!currentBalance || !currentBalance.eq(balance)) {
      dynamicPoolDataState[poolConfig.address].userYieldsBalance.set(balance);
    }
  }

  private updatePrincipalsBalance = () => {
    getChainConfig(this.chain).tempusPools.forEach(poolConfig => {
      this.updatePrincipalsBalanceForPool(poolConfig);
    });
  };

  private updateYieldsBalance = () => {
    getChainConfig(this.chain).tempusPools.forEach(poolConfig => {
      this.updateYieldsBalanceForPool(poolConfig);
    });
  };
}
export default UserShareTokenBalanceProvider;
