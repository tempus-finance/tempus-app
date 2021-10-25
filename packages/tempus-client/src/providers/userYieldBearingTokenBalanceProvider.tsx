import { useCallback, useContext, useEffect } from 'react';
import { Context } from '../context';
import { TempusPool } from '../interfaces/TempusPool';
import getERC20TokenService from '../services/getERC20TokenService';
import getConfig from '../utils/get-config';

const UserYieldBearingTokenBalanceProvider = () => {
  const {
    setData,
    data: { userWalletAddress, userWalletSigner },
  } = useContext(Context);

  const updateBalanceForPool = useCallback(
    async (tempusPool: TempusPool) => {
      if (userWalletSigner) {
        const yieldBearingTokenAddress = getERC20TokenService(tempusPool.yieldBearingTokenAddress, userWalletSigner);
        const yieldBearingTokenBalance = await yieldBearingTokenAddress.balanceOf(userWalletAddress);

        setData &&
          setData(previousData => ({
            ...previousData,
            poolData: previousData.poolData.map(previousPoolData => {
              if (previousPoolData.address !== tempusPool.address) {
                return previousPoolData;
              }
              return {
                ...previousPoolData,
                userYieldBearingTokenBalance: yieldBearingTokenBalance,
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
      const yieldBearingTokenService = getERC20TokenService(poolConfig.yieldBearingTokenAddress, userWalletSigner);

      yieldBearingTokenService.onTransfer(userWalletAddress, null, updateBalance);
      yieldBearingTokenService.onTransfer(null, userWalletAddress, updateBalance);
    });

    return () => {
      getConfig().tempusPools.forEach(poolConfig => {
        const yieldBearingTokenService = getERC20TokenService(poolConfig.yieldBearingTokenAddress, userWalletSigner);

        yieldBearingTokenService.offTransfer(userWalletAddress, null, updateBalance);
        yieldBearingTokenService.offTransfer(null, userWalletAddress, updateBalance);
      });
    };
  }, [setData, userWalletSigner, userWalletAddress, updateBalance]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default UserYieldBearingTokenBalanceProvider;
