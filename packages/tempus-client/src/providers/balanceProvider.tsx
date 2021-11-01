import { BigNumber } from '@ethersproject/bignumber';
import { FC, useCallback, useContext, useEffect } from 'react';
import { Subscription, catchError } from 'rxjs';
import UserBalanceDataAdapter from '../adapters/UserBalanceDataAdapter';
import { Context } from '../context';
import getERC20TokenService from '../services/getERC20TokenService';
import getConfig from '../utils/get-config';

interface PresentValueProviderProps {
  userBalanceDataAdapter: UserBalanceDataAdapter;
}

const BalanceProvider: FC<PresentValueProviderProps> = props => {
  const { userBalanceDataAdapter } = props;

  const {
    setData,
    data: { userWalletAddress, userWalletSigner },
  } = useContext(Context);

  const updateUserBalanceForPool = useCallback(
    (tempusPool: string, balance: BigNumber) => {
      setData &&
        setData(previousData => ({
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
    [setData],
  );

  const updateUserBalance = useCallback(() => {
    const streams: Subscription[] = [];

    getConfig().tempusPools.forEach(poolConfig => {
      if (userWalletSigner) {
        console.log(`Fetching ${poolConfig.address} user USD balance!`);
        const userUSDBalanceStream$ = userBalanceDataAdapter.getUserUSDBalanceForPool(
          poolConfig,
          userWalletAddress,
          userWalletSigner,
        );

        streams.push(
          userUSDBalanceStream$
            .pipe(
              catchError((error, caught) => {
                console.log('BalanceProvider - updateUserBalance - Failed to user USD rates!', error);
                return caught;
              }),
            )
            .subscribe(balance => {
              updateUserBalanceForPool(poolConfig.address, balance);
            }),
        );
      }
    });

    return () => {
      streams.forEach(stream$ => {
        stream$.unsubscribe();
      });
    };
  }, [userWalletSigner, userBalanceDataAdapter, userWalletAddress, updateUserBalanceForPool]);

  /**
   * Fetch user balance when component mounts
   */
  useEffect(() => {
    updateUserBalance();
  }, [updateUserBalance]);

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

      principalsService.onTransfer(userWalletAddress, null, updateUserBalance);
      principalsService.onTransfer(null, userWalletAddress, updateUserBalance);

      yieldsService.onTransfer(userWalletAddress, null, updateUserBalance);
      yieldsService.onTransfer(null, userWalletAddress, updateUserBalance);

      lpTokenService.onTransfer(userWalletAddress, null, updateUserBalance);
      lpTokenService.onTransfer(null, userWalletAddress, updateUserBalance);
    });

    return () => {
      getConfig().tempusPools.forEach(poolConfig => {
        console.log(`Unsubscribing to token updates for ${poolConfig.address}`);
        const principalsService = getERC20TokenService(poolConfig.principalsAddress, userWalletSigner);
        const yieldsService = getERC20TokenService(poolConfig.yieldsAddress, userWalletSigner);
        const lpTokenService = getERC20TokenService(poolConfig.ammAddress, userWalletSigner);

        principalsService.offTransfer(userWalletAddress, null, updateUserBalance);
        principalsService.offTransfer(null, userWalletAddress, updateUserBalance);

        yieldsService.offTransfer(userWalletAddress, null, updateUserBalance);
        yieldsService.offTransfer(null, userWalletAddress, updateUserBalance);

        lpTokenService.offTransfer(userWalletAddress, null, updateUserBalance);
        lpTokenService.offTransfer(null, userWalletAddress, updateUserBalance);
      });
    };
  }, [setData, userWalletSigner, userWalletAddress, updateUserBalance]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default BalanceProvider;
