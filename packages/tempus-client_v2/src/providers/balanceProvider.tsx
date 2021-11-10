import { BigNumber } from '@ethersproject/bignumber';
import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Subscription, catchError, Subject, switchMap } from 'rxjs';
import UserBalanceDataAdapter from '../adapters/UserBalanceDataAdapter';
import { PoolDataContext } from '../context/poolDataContext';
import { WalletContext } from '../context/walletContext';
import getERC20TokenService from '../services/getERC20TokenService';
import getConfig from '../utils/getConfig';

interface PresentValueProviderProps {
  userBalanceDataAdapter: UserBalanceDataAdapter;
}

const BalanceProvider: FC<PresentValueProviderProps> = props => {
  const { userBalanceDataAdapter } = props;

  const { setPoolData } = useContext(PoolDataContext);
  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);
  const [updateBalanceSubject] = useState<Subject<boolean>>(new Subject<boolean>());
  const [subscriptions$] = useState<Subscription>(new Subscription());

  const updateUserBalanceForPool = useCallback(
    (tempusPool: string, balance: BigNumber) => {
      setPoolData &&
        setPoolData(previousData => ({
          ...previousData,
          poolData: previousData.poolData.map(previousPoolData => {
            if (previousPoolData.address !== tempusPool) {
              return previousPoolData;
            }
            return {
              ...previousPoolData,
              userBalanceUSD: balance,
            };
          }),
        }));
    },
    [setPoolData],
  );

  const triggerUpdateBalance = useCallback(
    (value: boolean) => {
      updateBalanceSubject.next(value);
    },
    [updateBalanceSubject],
  );

  useMemo(() => {
    getConfig().tempusPools.forEach(poolConfig => {
      if (userWalletSigner) {
        console.log(`Fetching ${poolConfig.address} user USD balance!`);

        const stream$ = updateBalanceSubject.pipe(
          switchMap(() =>
            userBalanceDataAdapter.getUserUSDBalanceForPool(poolConfig, userWalletAddress, userWalletSigner),
          ),
          catchError((error, caught) => {
            console.log('BalanceProvider - updateUserBalance - Failed to user USD rates!', error);
            return caught;
          }),
        );

        subscriptions$.add(
          stream$.subscribe(balance => {
            updateUserBalanceForPool(poolConfig.address, balance);
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
    const value = true;
    triggerUpdateBalance(value);

    return () => subscriptions$.unsubscribe();
  }, [triggerUpdateBalance, subscriptions$]);

  /**
   * Subscribe to user principals, yields and LP Token transfer events for all pools
   */
  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    const value = true;

    getConfig().tempusPools.forEach(poolConfig => {
      console.log(`Subscribing to token updates for ${poolConfig.address}`);
      const principalsService = getERC20TokenService(poolConfig.principalsAddress, userWalletSigner);
      const yieldsService = getERC20TokenService(poolConfig.yieldsAddress, userWalletSigner);
      const lpTokenService = getERC20TokenService(poolConfig.ammAddress, userWalletSigner);

      principalsService.onTransfer(userWalletAddress, null, () => triggerUpdateBalance(value));
      principalsService.onTransfer(null, userWalletAddress, () => triggerUpdateBalance(value));

      yieldsService.onTransfer(userWalletAddress, null, () => triggerUpdateBalance(value));
      yieldsService.onTransfer(null, userWalletAddress, () => triggerUpdateBalance(value));

      lpTokenService.onTransfer(userWalletAddress, null, () => triggerUpdateBalance(value));
      lpTokenService.onTransfer(null, userWalletAddress, () => triggerUpdateBalance(value));
    });

    return () => {
      getConfig().tempusPools.forEach(poolConfig => {
        console.log(`Unsubscribing to token updates for ${poolConfig.address}`);
        const principalsService = getERC20TokenService(poolConfig.principalsAddress, userWalletSigner);
        const yieldsService = getERC20TokenService(poolConfig.yieldsAddress, userWalletSigner);
        const lpTokenService = getERC20TokenService(poolConfig.ammAddress, userWalletSigner);

        principalsService.offTransfer(userWalletAddress, null, () => triggerUpdateBalance(value));
        principalsService.offTransfer(null, userWalletAddress, () => triggerUpdateBalance(value));

        yieldsService.offTransfer(userWalletAddress, null, () => triggerUpdateBalance(value));
        yieldsService.offTransfer(null, userWalletAddress, () => triggerUpdateBalance(value));

        lpTokenService.offTransfer(userWalletAddress, null, () => triggerUpdateBalance(value));
        lpTokenService.offTransfer(null, userWalletAddress, () => triggerUpdateBalance(value));
      });
    };
  }, [setPoolData, userWalletSigner, userWalletAddress, triggerUpdateBalance]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default BalanceProvider;
