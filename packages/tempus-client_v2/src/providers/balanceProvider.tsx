import { Contract } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import {
  Chain,
  ERC20,
  ERC20ABI,
  TempusPool,
  getERC20TokenService,
  getStatisticsService,
  mul18f,
} from 'tempus-core-services';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { getConfigForPoolWithAddress, getConfig, getChainConfig } from '../utils/getConfig';

export interface UserBalanceProviderParams {
  userWalletAddress: string;
  userWalletSigner: JsonRpcSigner;
  chain: Chain;
}

class UserBalanceProvider {
  private userWalletAddress: string = '';
  private userWalletSigner: JsonRpcSigner;
  private chain: Chain;

  private tokenContracts: ERC20[] = [];

  constructor(params: UserBalanceProviderParams) {
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
  fetchForPool(address: string, blockTag?: number) {
    const poolConfig = getConfigForPoolWithAddress(address);

    this.updateUserBalanceForPool(poolConfig, blockTag);
  }

  private async updateUserBalanceForPool(poolConfig: TempusPool, blockTag?: number) {
    if (!this.userWalletSigner) {
      return;
    }

    const statisticsService = getStatisticsService(this.chain, getConfig, getChainConfig, this.userWalletSigner);

    const principalsService = getERC20TokenService(
      poolConfig.principalsAddress,
      this.chain,
      getChainConfig,
      this.userWalletSigner,
    );
    const yieldsService = getERC20TokenService(
      poolConfig.yieldsAddress,
      this.chain,
      getChainConfig,
      this.userWalletSigner,
    );
    const lpTokenService = getERC20TokenService(
      poolConfig.ammAddress,
      this.chain,
      getChainConfig,
      this.userWalletSigner,
    );

    const [principalsBalance, yieldsBalance, lpTokenBalance, backingTokenRate] = await Promise.all([
      principalsService.balanceOf(this.userWalletAddress, {
        blockTag,
      }),
      yieldsService.balanceOf(this.userWalletAddress, {
        blockTag,
      }),
      lpTokenService.balanceOf(this.userWalletAddress, {
        blockTag,
      }),
      statisticsService.getRate(this.chain, poolConfig.backingToken, {
        blockTag,
      }),
    ]);

    const estimateExitToBackingToken = true;
    const exitEstimate = await statisticsService.estimateExitAndRedeem(
      poolConfig.address,
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
    getChainConfig(this.chain).tempusPools.forEach(poolConfig => {
      this.updateUserBalanceForPool(poolConfig);
    });
  };
}
export default UserBalanceProvider;
