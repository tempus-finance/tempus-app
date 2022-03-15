import { Contract } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { ERC20 } from '../abi/ERC20';
import ERC20ABI from '../abi/ERC20.json';
import { TempusPool } from '../interfaces/TempusPool';
import { Chain } from '../interfaces/Chain';
import { BalanceProviderParams } from './interfaces';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { getConfigForPoolWithAddress, getChainConfig } from '../utils/getConfig';
import getUserBalanceDataAdapter from '../adapters/getUserBalanceDataAdapter';
import { ZERO_ETH_ADDRESS } from '../constants';

class AvailableToDepositProvider {
  private userWalletAddress: string = '';
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

      // ETH is a native token that does not support ERC20 contract functions - in case of ETH we manually
      // trigger balance updates after user executes an action that affects balance
      if (poolConfig.backingTokenAddress !== ZERO_ETH_ADDRESS) {
        const btContract = new Contract(poolConfig.backingTokenAddress, ERC20ABI, this.userWalletSigner) as ERC20;

        btContract.on(btContract.filters.Transfer(this.userWalletAddress, null), this.updateAvailableToDepositUSD);
        btContract.on(btContract.filters.Transfer(null, this.userWalletAddress), this.updateAvailableToDepositUSD);

        this.tokenContracts.push(btContract);
      }

      const ybtContract = new Contract(poolConfig.yieldBearingTokenAddress, ERC20ABI, this.userWalletSigner) as ERC20;
      ybtContract.on(ybtContract.filters.Transfer(this.userWalletAddress, null), this.updateAvailableToDepositUSD);
      ybtContract.on(ybtContract.filters.Transfer(null, this.userWalletAddress), this.updateAvailableToDepositUSD);

      this.tokenContracts.push(ybtContract);
    });

    // Fetch initial available to deposit for all pools on app load
    this.updateAvailableToDepositUSD();
  }

  destroy() {
    this.tokenContracts.forEach(tokenContract => {
      tokenContract.removeAllListeners();
    });
    this.tokenContracts = [];
  }

  /**
   * Manually trigger available to deposit balance update for specific pool.
   * // Can be called after user action that affects user available to deposit balance.
   */
  fetchForPool(address: string, blockTag?: number) {
    const poolConfig = getConfigForPoolWithAddress(address);

    this.updateAvailableToDepositForPool(poolConfig, blockTag);
  }

  private async updateAvailableToDepositForPool(poolConfig: TempusPool, blockTag?: number) {
    if (!this.userWalletSigner) {
      return;
    }
    try {
      const userBalanceDataAdapter = getUserBalanceDataAdapter(this.chain, this.userWalletSigner);

      const userAvailableToDepositForPool = await userBalanceDataAdapter.getUserAvailableToDepositForPool(
        poolConfig,
        this.userWalletAddress,
        this.userWalletSigner,
        poolConfig.tokenPrecision.backingToken,
        poolConfig.tokenPrecision.yieldBearingToken,
      );

      const currentBackingTokenValueInFiat = dynamicPoolDataState[poolConfig.address].backingTokenValueInFiat.get();
      if (
        !currentBackingTokenValueInFiat ||
        (userAvailableToDepositForPool.backingTokenValueInFiat &&
          !currentBackingTokenValueInFiat.eq(userAvailableToDepositForPool.backingTokenValueInFiat))
      ) {
        dynamicPoolDataState[poolConfig.address].backingTokenValueInFiat.set(
          userAvailableToDepositForPool.backingTokenValueInFiat,
        );
      }

      const currentBackingTokensAvailable = dynamicPoolDataState[poolConfig.address].backingTokensAvailable.get();
      if (
        !currentBackingTokensAvailable ||
        (userAvailableToDepositForPool.backingTokensAvailable &&
          !currentBackingTokensAvailable.eq(userAvailableToDepositForPool.backingTokensAvailable))
      ) {
        dynamicPoolDataState[poolConfig.address].backingTokensAvailable.set(
          userAvailableToDepositForPool.backingTokensAvailable,
        );
      }

      const currentYieldBearingTokenValueInBackingToken =
        dynamicPoolDataState[poolConfig.address].yieldBearingTokenValueInBackingToken.get();
      if (
        !currentYieldBearingTokenValueInBackingToken ||
        (userAvailableToDepositForPool.yieldBearingTokenValueInBackingToken &&
          !currentYieldBearingTokenValueInBackingToken.eq(
            userAvailableToDepositForPool.yieldBearingTokenValueInBackingToken,
          ))
      ) {
        dynamicPoolDataState[poolConfig.address].yieldBearingTokenValueInBackingToken.set(
          userAvailableToDepositForPool.yieldBearingTokenValueInBackingToken,
        );
      }

      const currentYieldBearingTokenValueInFiat =
        dynamicPoolDataState[poolConfig.address].yieldBearingTokenValueInFiat.get();
      if (
        !currentYieldBearingTokenValueInFiat ||
        (userAvailableToDepositForPool.yieldBearingTokenValueInFiat &&
          !currentYieldBearingTokenValueInFiat.eq(userAvailableToDepositForPool.yieldBearingTokenValueInFiat))
      ) {
        dynamicPoolDataState[poolConfig.address].yieldBearingTokenValueInFiat.set(
          userAvailableToDepositForPool.yieldBearingTokenValueInFiat,
        );
      }
    } catch (error) {
      console.error('AvailableToDepositProvider - updateUserAvailableToDepositUSDForPool', error);
    }
  }

  private updateAvailableToDepositUSD = () => {
    getChainConfig(this.chain).tempusPools.forEach(poolConfig => {
      this.updateAvailableToDepositForPool(poolConfig);
    });
  };
}
export default AvailableToDepositProvider;
