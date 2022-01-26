import { Contract } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { ERC20 } from '../abi/ERC20';
import ERC20ABI from '../abi/ERC20.json';
import { TempusPool } from '../interfaces/TempusPool';
import { dynamicPoolDataState } from '../state/PoolDataState';
import getStatisticsService from '../services/getStatisticsService';
import getERC20TokenService from '../services/getERC20TokenService';
import { getConfigForPoolWithAddress, getNetworkConfig } from '../utils/getConfig';
import { mul18f } from '../utils/weiMath';
import { Networks } from '../state/NetworkState';

export interface UserBalanceProviderParams {
  userWalletAddress: string;
  userWalletSigner: JsonRpcSigner;
  network: Networks;
}

class UserBalanceProvider {
  private userWalletAddress: string = '';
  private userWalletSigner: JsonRpcSigner;
  private network: Networks;

  private tokenContracts: ERC20[] = [];

  constructor(params: UserBalanceProviderParams) {
    this.userWalletAddress = params.userWalletAddress;
    this.userWalletSigner = params.userWalletSigner;
    this.network = params.network;
  }

  init() {
    // Make sure to clean previous data before crating new subscriptions
    this.destroy();

    getNetworkConfig(this.network).tempusPools.forEach(poolConfig => {
      if (!this.userWalletSigner) {
        return;
      }

      const tpsContract = new Contract(poolConfig.principalsAddress, ERC20ABI, this.userWalletSigner) as ERC20;
      tpsContract.on(tpsContract.filters.Transfer(this.userWalletAddress, null), this.updateUserBalance);
      tpsContract.on(tpsContract.filters.Transfer(null, this.userWalletAddress), this.updateUserBalance);

      const tysContract = new Contract(poolConfig.yieldsAddress, ERC20ABI, this.userWalletSigner) as ERC20;
      tysContract.on(tysContract.filters.Transfer(this.userWalletAddress, null), this.updateUserBalance);
      tysContract.on(tysContract.filters.Transfer(null, this.userWalletAddress), this.updateUserBalance);

      const lpTokenContract = new Contract(poolConfig.ammAddress, ERC20ABI, this.userWalletSigner) as ERC20;
      lpTokenContract.on(lpTokenContract.filters.Transfer(this.userWalletAddress, null), this.updateUserBalance);
      lpTokenContract.on(lpTokenContract.filters.Transfer(null, this.userWalletAddress), this.updateUserBalance);

      this.tokenContracts.push(tpsContract, tysContract, lpTokenContract);
    });

    // Fetch initial balances on app load
    this.updateUserBalance();
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

    this.updateUserBalanceForPool(poolConfig);
  }

  private async updateUserBalanceForPool(poolConfig: TempusPool) {
    if (!this.userWalletSigner) {
      return;
    }

    const statisticsService = getStatisticsService(this.network, this.userWalletSigner);

    const principalsService = getERC20TokenService(poolConfig.principalsAddress, this.network, this.userWalletSigner);
    const yieldsService = getERC20TokenService(poolConfig.yieldsAddress, this.network, this.userWalletSigner);
    const lpTokenService = getERC20TokenService(poolConfig.ammAddress, this.network, this.userWalletSigner);

    const [principalsBalance, yieldsBalance, lpTokenBalance, backingTokenRate] = await Promise.all([
      principalsService.balanceOf(this.userWalletAddress),
      yieldsService.balanceOf(this.userWalletAddress),
      lpTokenService.balanceOf(this.userWalletAddress),
      statisticsService.getRate(poolConfig.backingToken),
    ]);

    const estimateExitToBackingToken = true;
    const exitEstimate = await statisticsService.estimateExitAndRedeem(
      poolConfig.ammAddress,
      lpTokenBalance,
      principalsBalance,
      yieldsBalance,
      estimateExitToBackingToken,
    );

    const userPoolBalanceInBackingTokens = exitEstimate.tokenAmount;
    const userPoolBalanceInUSD = mul18f(
      userPoolBalanceInBackingTokens,
      backingTokenRate,
      poolConfig.tokenPrecision.backingToken,
    );

    const currentUSDBalance = dynamicPoolDataState[poolConfig.address].userBalanceUSD.get();
    if (!currentUSDBalance || !currentUSDBalance.eq(userPoolBalanceInUSD)) {
      dynamicPoolDataState[poolConfig.address].userBalanceUSD.set(userPoolBalanceInUSD);
    }

    const currentUserBalanceInBackingToken = dynamicPoolDataState[poolConfig.address].userBalanceInBackingToken.get();
    if (!currentUserBalanceInBackingToken || !currentUserBalanceInBackingToken.eq(userPoolBalanceInBackingTokens)) {
      dynamicPoolDataState[poolConfig.address].userBalanceInBackingToken.set(userPoolBalanceInBackingTokens);
    }
  }

  private updateUserBalance = () => {
    getNetworkConfig(this.network).tempusPools.forEach(poolConfig => {
      this.updateUserBalanceForPool(poolConfig);
    });
  };
}
export default UserBalanceProvider;
