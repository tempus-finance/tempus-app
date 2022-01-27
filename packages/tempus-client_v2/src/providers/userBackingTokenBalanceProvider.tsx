import { Downgraded, useState as useHookState } from '@hookstate/core';
import { useCallback, useContext, useEffect } from 'react';
import { WalletContext } from '../context/walletContext';
import { TempusPool } from '../interfaces/TempusPool';
import getERC20TokenService from '../services/getERC20TokenService';
import { selectedChainState } from '../state/ChainState';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { getChainConfig } from '../utils/getConfig';

const UserBackingTokenBalanceProvider = () => {
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const selectedNetwork = useHookState(selectedChainState);

  const selectedNetworkName = selectedNetwork.attach(Downgraded).get();

  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);

  const updateBalanceForPool = useCallback(
    async (tempusPool: TempusPool) => {
      if (userWalletSigner) {
        const backingTokenService = getERC20TokenService(
          tempusPool.backingTokenAddress,
          selectedNetworkName,
          userWalletSigner,
        );
        const backingTokenBalance = await backingTokenService.balanceOf(userWalletAddress);

        const currentBalance = dynamicPoolData[tempusPool.address].userBackingTokenBalance.get();
        // Only update state if fetched user backing token balance is different from current user backing token balance
        if (!currentBalance || !currentBalance.eq(backingTokenBalance)) {
          dynamicPoolData[tempusPool.address].userBackingTokenBalance.set(backingTokenBalance);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userWalletAddress, userWalletSigner, selectedNetworkName],
  );

  const updateBalance = useCallback(async () => {
    getChainConfig(selectedNetworkName).tempusPools.forEach(poolConfig => {
      updateBalanceForPool(poolConfig);
    });
  }, [selectedNetworkName, updateBalanceForPool]);

  useEffect(() => {
    updateBalance();
  }, [updateBalance]);

  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    getChainConfig(selectedNetworkName).tempusPools.forEach(poolConfig => {
      const backingTokenService = getERC20TokenService(
        poolConfig.backingTokenAddress,
        selectedNetworkName,
        userWalletSigner,
      );

      backingTokenService.onTransfer(userWalletAddress, null, updateBalance);
      backingTokenService.onTransfer(null, userWalletAddress, updateBalance);
    });

    return () => {
      getChainConfig(selectedNetworkName).tempusPools.forEach(poolConfig => {
        const backingTokenService = getERC20TokenService(
          poolConfig.backingTokenAddress,
          selectedNetworkName,
          userWalletSigner,
        );

        backingTokenService.offTransfer(userWalletAddress, null, updateBalance);
        backingTokenService.offTransfer(null, userWalletAddress, updateBalance);
      });
    };
  }, [userWalletSigner, userWalletAddress, selectedNetworkName, updateBalance]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default UserBackingTokenBalanceProvider;
