import { BigNumber } from '@ethersproject/bignumber';
import { useState as useHookState } from '@hookstate/core';
import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Subscription, catchError, Subject, switchMap } from 'rxjs';
import UserBalanceDataAdapter from '../adapters/UserBalanceDataAdapter';
import { WalletContext } from '../context/walletContext';
import getERC20TokenService from '../services/getERC20TokenService';
import { dynamicPoolDataState } from '../state/PoolDataState';
import getConfig from '../utils/getConfig';

interface PresentValueProviderProps {
  userBalanceDataAdapter: UserBalanceDataAdapter;
}

const BalanceProvider: FC<PresentValueProviderProps> = props => {
  const { userBalanceDataAdapter } = props;

  const dynamicPoolData = useHookState(dynamicPoolDataState);

  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);
  const [updateBalanceSubject] = useState<Subject<boolean>>(new Subject<boolean>());
  const [subscriptions$] = useState<Subscription>(new Subscription());

  const updateUserBalanceForPool = useCallback(
    (tempusPoolAddress: string, balances: BigNumber[]) => {
      const [userBalanceUSD, userBalanceInBackingToken] = balances;

      dynamicPoolData[tempusPoolAddress].userBalanceUSD.set(userBalanceUSD);
      dynamicPoolData[tempusPoolAddress].userBalanceInBackingToken.set(userBalanceInBackingToken);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const triggerUpdateBalance = useCallback(() => {
    updateBalanceSubject.next(true);
  }, [updateBalanceSubject]);

  useMemo(() => {
    getConfig().tempusPools.forEach(poolConfig => {
      if (userWalletSigner) {
        console.log(`Fetching ${poolConfig.address} user USD balance!`);

        const stream$ = updateBalanceSubject.pipe(
          switchMap(() => {
            return userBalanceDataAdapter.getUserUSDBalanceForPool(poolConfig, userWalletAddress, userWalletSigner);
          }),
          catchError((error, caught) => {
            console.log('BalanceProvider - updateUserBalance - Failed to user USD rates!', error);
            return caught;
          }),
        );

        subscriptions$.add(
          stream$.subscribe((balances: BigNumber[]) => {
            updateUserBalanceForPool(poolConfig.address, balances);
          }),
        );
      }
    });
  }, [
    userWalletSigner,
    userBalanceDataAdapter,
    userWalletAddress,
    updateUserBalanceForPool,
    updateBalanceSubject,
    subscriptions$,
  ]);

  /**
   * Fetch user balance when component mounts
   */
  useEffect(() => {
    triggerUpdateBalance();

    return () => subscriptions$.unsubscribe();
  }, [triggerUpdateBalance, subscriptions$]);

  /**
   * Subscribe to user principals, yields and LP Token transfer events for all pools
   */
  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    getConfig().tempusPools.forEach(poolConfig => {
      console.log(`Subscribing to token updates for ${poolConfig.address}`);
      const principalsService = getERC20TokenService(poolConfig.principalsAddress, userWalletSigner);
      const yieldsService = getERC20TokenService(poolConfig.yieldsAddress, userWalletSigner);
      const lpTokenService = getERC20TokenService(poolConfig.ammAddress, userWalletSigner);

      principalsService.onTransfer(userWalletAddress, null, () => triggerUpdateBalance());
      principalsService.onTransfer(null, userWalletAddress, () => triggerUpdateBalance());

      yieldsService.onTransfer(userWalletAddress, null, () => triggerUpdateBalance());
      yieldsService.onTransfer(null, userWalletAddress, () => triggerUpdateBalance());

      lpTokenService.onTransfer(userWalletAddress, null, () => triggerUpdateBalance());
      lpTokenService.onTransfer(null, userWalletAddress, () => triggerUpdateBalance());
    });

    return () => {
      getConfig().tempusPools.forEach(poolConfig => {
        console.log(`Unsubscribing to token updates for ${poolConfig.address}`);
        const principalsService = getERC20TokenService(poolConfig.principalsAddress, userWalletSigner);
        const yieldsService = getERC20TokenService(poolConfig.yieldsAddress, userWalletSigner);
        const lpTokenService = getERC20TokenService(poolConfig.ammAddress, userWalletSigner);

        principalsService.offTransfer(userWalletAddress, null, () => triggerUpdateBalance());
        principalsService.offTransfer(null, userWalletAddress, () => triggerUpdateBalance());

        yieldsService.offTransfer(userWalletAddress, null, () => triggerUpdateBalance());
        yieldsService.offTransfer(null, userWalletAddress, () => triggerUpdateBalance());

        lpTokenService.offTransfer(userWalletAddress, null, () => triggerUpdateBalance());
        lpTokenService.offTransfer(null, userWalletAddress, () => triggerUpdateBalance());
      });
    };
  }, [userWalletSigner, userWalletAddress, triggerUpdateBalance]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default BalanceProvider;
