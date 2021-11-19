import { useCallback, useContext, useEffect } from 'react';
import { useState as useHookState } from '@hookstate/core';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { WalletContext } from '../context/walletContext';
import { TempusPool } from '../interfaces/TempusPool';
import getERC20TokenService from '../services/getERC20TokenService';
import getConfig from '../utils/getConfig';

const UserShareTokenBalanceProvider = () => {
  const dynamicPoolData = useHookState(dynamicPoolDataState);

  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);

  /**
   * Fetch current principals balance for user.
   */
  const updatePrincipalsBalanceForPool = useCallback(
    async (poolConfig: TempusPool) => {
      if (userWalletSigner) {
        const principalsService = getERC20TokenService(poolConfig.principalsAddress, userWalletSigner);
        const balance = await principalsService.balanceOf(userWalletAddress);

        dynamicPoolData[poolConfig.address].userPrincipalsBalance.set(balance);
      }
    },
    // TODO - We can now probably remove this provider components and update state directly from service classes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userWalletSigner, userWalletAddress],
  );

  /**
   * Fetch current yields balance for user.
   */
  const updateYieldsBalanceForPool = useCallback(
    async (poolConfig: TempusPool) => {
      if (userWalletSigner) {
        const yieldsService = getERC20TokenService(poolConfig.yieldsAddress, userWalletSigner);
        const balance = await yieldsService.balanceOf(userWalletAddress);

        dynamicPoolData[poolConfig.address].userYieldsBalance.set(balance);
      }
    },
    // TODO - We can now probably remove this provider components and update state directly from service classes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userWalletSigner, userWalletAddress],
  );

  const updatePrincipalsBalance = useCallback(async () => {
    getConfig().tempusPools.forEach(poolConfig => {
      updatePrincipalsBalanceForPool(poolConfig);
    });
  }, [updatePrincipalsBalanceForPool]);

  const updateYieldsBalance = useCallback(async () => {
    getConfig().tempusPools.forEach(poolConfig => {
      updateYieldsBalanceForPool(poolConfig);
    });
  }, [updateYieldsBalanceForPool]);

  /**
   * Subscribe to user principals token transfer event
   */
  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    getConfig().tempusPools.forEach(poolConfig => {
      const principalsService = getERC20TokenService(poolConfig.principalsAddress, userWalletSigner);

      principalsService.onTransfer(userWalletAddress, null, updatePrincipalsBalance);
      principalsService.onTransfer(null, userWalletAddress, updatePrincipalsBalance);
    });

    return () => {
      getConfig().tempusPools.forEach(poolConfig => {
        const principalsService = getERC20TokenService(poolConfig.principalsAddress, userWalletSigner);

        principalsService.offTransfer(userWalletAddress, null, updatePrincipalsBalance);
        principalsService.offTransfer(null, userWalletAddress, updatePrincipalsBalance);
      });
    };
  }, [userWalletAddress, userWalletSigner, updatePrincipalsBalance]);

  useEffect(() => {
    updatePrincipalsBalance();
    updateYieldsBalance();
  }, [updatePrincipalsBalance, updateYieldsBalance]);

  /**
   * Subscribe to user yields token transfer event
   */
  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    getConfig().tempusPools.forEach(poolConfig => {
      const yieldsService = getERC20TokenService(poolConfig.yieldsAddress, userWalletSigner);

      yieldsService.onTransfer(userWalletAddress, null, updateYieldsBalance);
      yieldsService.onTransfer(null, userWalletAddress, updateYieldsBalance);
    });

    return () => {
      getConfig().tempusPools.forEach(poolConfig => {
        const yieldsService = getERC20TokenService(poolConfig.yieldsAddress, userWalletSigner);

        yieldsService.offTransfer(userWalletAddress, null, updateYieldsBalance);
        yieldsService.offTransfer(null, userWalletAddress, updateYieldsBalance);
      });
    };
  }, [userWalletAddress, userWalletSigner, updateYieldsBalance]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default UserShareTokenBalanceProvider;
