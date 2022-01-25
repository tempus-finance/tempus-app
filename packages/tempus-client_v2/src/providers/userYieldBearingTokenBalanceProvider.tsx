import { useCallback, useContext, useEffect } from 'react';
import { useState as useHookState } from '@hookstate/core';
import { WalletContext } from '../context/walletContext';
import { TempusPool } from '../interfaces/TempusPool';
import getERC20TokenService from '../services/getERC20TokenService';
import getConfig from '../utils/getConfig';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { selectedChainState } from '../state/ChainState';

const UserYieldBearingTokenBalanceProvider = () => {
  const dynamicPoolData = useHookState(dynamicPoolDataState);

  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);

  const updateBalanceForPool = useCallback(
    async (tempusPool: TempusPool) => {
      if (userWalletSigner) {
        const yieldBearingTokenAddress = getERC20TokenService(tempusPool.yieldBearingTokenAddress, userWalletSigner);
        const yieldBearingTokenBalance = await yieldBearingTokenAddress.balanceOf(userWalletAddress);

        const currentBalance = dynamicPoolData[tempusPool.address].userYieldBearingTokenBalance.get();

        // Only update state if user yield bearing token balance is different from current user yield bearing token balance
        if (!currentBalance || !currentBalance.eq(yieldBearingTokenBalance)) {
          dynamicPoolData[tempusPool.address].userYieldBearingTokenBalance.set(yieldBearingTokenBalance);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userWalletAddress, userWalletSigner],
  );

  const updateBalance = useCallback(async () => {
    getConfig()[selectedChainState.get()].tempusPools.forEach(poolConfig => {
      updateBalanceForPool(poolConfig);
    });
  }, [updateBalanceForPool]);

  useEffect(() => {
    updateBalance();
  }, [updateBalance]);

  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    getConfig()[selectedChainState.get()].tempusPools.forEach(poolConfig => {
      const yieldBearingTokenService = getERC20TokenService(poolConfig.yieldBearingTokenAddress, userWalletSigner);

      yieldBearingTokenService.onTransfer(userWalletAddress, null, updateBalance);
      yieldBearingTokenService.onTransfer(null, userWalletAddress, updateBalance);
    });

    return () => {
      getConfig()[selectedChainState.get()].tempusPools.forEach(poolConfig => {
        const yieldBearingTokenService = getERC20TokenService(poolConfig.yieldBearingTokenAddress, userWalletSigner);

        yieldBearingTokenService.offTransfer(userWalletAddress, null, updateBalance);
        yieldBearingTokenService.offTransfer(null, userWalletAddress, updateBalance);
      });
    };
  }, [userWalletSigner, userWalletAddress, updateBalance]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default UserYieldBearingTokenBalanceProvider;
