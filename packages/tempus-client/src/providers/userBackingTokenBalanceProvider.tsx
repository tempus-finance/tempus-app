import { useCallback, useContext, useEffect } from 'react';
import { Context } from '../context';
import { TempusPool } from '../interfaces/TempusPool';
import getERC20TokenService from '../services/getERC20TokenService';
import getConfig from '../utils/get-config';

const UserBackingTokenBalanceProvider = () => {
  const {
    setData,
    data: { userWalletAddress, userWalletSigner },
  } = useContext(Context);

  const updateBalanceForPool = useCallback(
    async (tempusPool: TempusPool) => {
      if (userWalletSigner) {
        const backingTokenService = getERC20TokenService(tempusPool.backingTokenAddress, userWalletSigner);
        const backingTokenBalance = await backingTokenService.balanceOf(userWalletAddress);

        setData &&
          setData(previousData => ({
            ...previousData,
            poolData: previousData.poolData.map(previousPoolData => {
              if (previousPoolData.address !== tempusPool.address) {
                return previousPoolData;
              }
              return {
                ...previousPoolData,
                userBackingTokenBalance: backingTokenBalance,
              };
            }),
          }));
      }
    },
    [setData, userWalletAddress, userWalletSigner],
  );

  const updateBalance = useCallback(async () => {
    getConfig().tempusPools.forEach(poolConfig => {
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

    getConfig().tempusPools.forEach(poolConfig => {
      const backingTokenService = getERC20TokenService(poolConfig.backingTokenAddress, userWalletSigner);

      backingTokenService.onTransfer(userWalletAddress, null, updateBalance);
      backingTokenService.onTransfer(null, userWalletAddress, updateBalance);
    });

    return () => {
      getConfig().tempusPools.forEach(poolConfig => {
        const backingTokenService = getERC20TokenService(poolConfig.backingTokenAddress, userWalletSigner);

        backingTokenService.offTransfer(userWalletAddress, null, updateBalance);
        backingTokenService.offTransfer(null, userWalletAddress, updateBalance);
      });
    };
  }, [setData, userWalletSigner, userWalletAddress, updateBalance]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default UserBackingTokenBalanceProvider;
