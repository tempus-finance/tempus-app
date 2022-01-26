import { FC, useCallback, useContext, useEffect } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import UserBalanceDataAdapter from '../adapters/UserBalanceDataAdapter';
import { WalletContext } from '../context/walletContext';
import { TempusPool } from '../interfaces/TempusPool';
import getERC20TokenService from '../services/getERC20TokenService';
import { getNetworkConfig } from '../utils/getConfig';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { selectedNetworkState } from '../state/NetworkState';

interface PresentValueProviderProps {
  userBalanceDataAdapter: UserBalanceDataAdapter;
}

const AvailableToDepositUSDProvider: FC<PresentValueProviderProps> = props => {
  const { userBalanceDataAdapter } = props;

  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const selectedNetwork = useHookState(selectedNetworkState);

  const selectedNetworkName = selectedNetwork.attach(Downgraded).get();

  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);

  const updateUserAvailableToDepositUSDForPool = useCallback(
    async (tempusPool: TempusPool) => {
      if (!userWalletSigner) {
        return;
      }
      try {
        const userAvailableToDepositForPool = await userBalanceDataAdapter.getUserAvailableToDepositForPool(
          tempusPool,
          userWalletAddress,
          userWalletSigner,
          tempusPool.tokenPrecision.backingToken,
          tempusPool.tokenPrecision.yieldBearingToken,
        );

        const currentBackingTokenValueInFiat = dynamicPoolData[tempusPool.address].backingTokenValueInFiat.get();
        if (
          !currentBackingTokenValueInFiat ||
          (userAvailableToDepositForPool.backingTokenValueInFiat &&
            !currentBackingTokenValueInFiat.eq(userAvailableToDepositForPool.backingTokenValueInFiat))
        ) {
          dynamicPoolData[tempusPool.address].backingTokenValueInFiat.set(
            userAvailableToDepositForPool.backingTokenValueInFiat,
          );
        }

        const currentBackingTokensAvailable = dynamicPoolData[tempusPool.address].backingTokensAvailable.get();
        if (
          !currentBackingTokensAvailable ||
          (userAvailableToDepositForPool.backingTokensAvailable &&
            !currentBackingTokensAvailable.eq(userAvailableToDepositForPool.backingTokensAvailable))
        ) {
          dynamicPoolData[tempusPool.address].backingTokensAvailable.set(
            userAvailableToDepositForPool.backingTokensAvailable,
          );
        }

        const currentYieldBearingTokenValueInBackingToken =
          dynamicPoolData[tempusPool.address].yieldBearingTokenValueInBackingToken.get();
        if (
          !currentYieldBearingTokenValueInBackingToken ||
          (userAvailableToDepositForPool.yieldBearingTokenValueInBackingToken &&
            !currentYieldBearingTokenValueInBackingToken.eq(
              userAvailableToDepositForPool.yieldBearingTokenValueInBackingToken,
            ))
        ) {
          dynamicPoolData[tempusPool.address].yieldBearingTokenValueInBackingToken.set(
            userAvailableToDepositForPool.yieldBearingTokenValueInBackingToken,
          );
        }

        const currentYieldBearingTokenValueInFiat =
          dynamicPoolData[tempusPool.address].yieldBearingTokenValueInFiat.get();
        if (
          !currentYieldBearingTokenValueInFiat ||
          (userAvailableToDepositForPool.yieldBearingTokenValueInFiat &&
            !currentYieldBearingTokenValueInFiat.eq(userAvailableToDepositForPool.yieldBearingTokenValueInFiat))
        ) {
          dynamicPoolData[tempusPool.address].yieldBearingTokenValueInFiat.set(
            userAvailableToDepositForPool.yieldBearingTokenValueInFiat,
          );
        }
      } catch (error) {
        console.error('AvailableToDepositUSDProvider - updateUserAvailableToDepositUSDForPool', error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userBalanceDataAdapter, userWalletAddress, userWalletSigner],
  );

  const updateAvailableToDepositUSD = useCallback(() => {
    getNetworkConfig(selectedNetworkName).tempusPools.forEach(poolConfig => {
      if (userWalletSigner) {
        updateUserAvailableToDepositUSDForPool(poolConfig);
      }
    });
  }, [userWalletSigner, selectedNetworkName, updateUserAvailableToDepositUSDForPool]);

  /**
   * Fetch available to deposit USD when component mounts
   */
  useEffect(() => {
    updateAvailableToDepositUSD();
  }, [updateAvailableToDepositUSD]);

  /**
   * Subscribe to user principals, yields and LP Token transfer events for all pools
   */
  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    try {
      getNetworkConfig(selectedNetworkName).tempusPools.forEach(poolConfig => {
        const backingTokenService = getERC20TokenService(
          poolConfig.backingTokenAddress,
          selectedNetworkName,
          userWalletSigner,
        );
        const yieldBearingTokenService = getERC20TokenService(
          poolConfig.yieldBearingTokenAddress,
          selectedNetworkName,
          userWalletSigner,
        );
        backingTokenService.onTransfer(userWalletAddress, null, updateAvailableToDepositUSD);
        backingTokenService.onTransfer(null, userWalletAddress, updateAvailableToDepositUSD);
        yieldBearingTokenService.onTransfer(userWalletAddress, null, updateAvailableToDepositUSD);
        yieldBearingTokenService.onTransfer(null, userWalletAddress, updateAvailableToDepositUSD);
      });

      return () => {
        getNetworkConfig(selectedNetworkName).tempusPools.forEach(poolConfig => {
          const backingTokenService = getERC20TokenService(
            poolConfig.backingTokenAddress,
            selectedNetworkName,
            userWalletSigner,
          );
          const yieldBearingTokenService = getERC20TokenService(
            poolConfig.yieldBearingTokenAddress,
            selectedNetworkName,
            userWalletSigner,
          );
          backingTokenService.offTransfer(userWalletAddress, null, updateAvailableToDepositUSD);
          backingTokenService.offTransfer(null, userWalletAddress, updateAvailableToDepositUSD);
          yieldBearingTokenService.offTransfer(userWalletAddress, null, updateAvailableToDepositUSD);
          yieldBearingTokenService.offTransfer(null, userWalletAddress, updateAvailableToDepositUSD);
        });
      };
    } catch (error) {
      console.error('AvailableToDepositUSDProvider - subscriber', error);
    }
  }, [userWalletSigner, userWalletAddress, selectedNetworkName, updateAvailableToDepositUSD]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default AvailableToDepositUSDProvider;
