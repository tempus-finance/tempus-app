import { useCallback, useContext, useEffect } from 'react';
import { PoolDataContext } from '../context/poolDataContext';
import { WalletContext } from '../context/walletContext';
import { TempusPool } from '../interfaces/TempusPool';
import getERC20TokenService from '../services/getERC20TokenService';
import getConfig from '../utils/getConfig';

const UserLPTokenBalanceProvider = () => {
  const { setPoolData } = useContext(PoolDataContext);
  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);

  /**
   * Update liquidity provider token balance when ERC20 Transfer event triggers
   */
  const updateBalanceForPool = useCallback(
    async (tempusPool: TempusPool) => {
      if (userWalletSigner) {
        const lpTokenService = getERC20TokenService(tempusPool.ammAddress, userWalletSigner);
        const balance = await lpTokenService.balanceOf(userWalletAddress);

        setPoolData &&
          setPoolData(previousData => ({
            ...previousData,
            poolData: previousData.poolData.map(previousPoolData => {
              if (previousPoolData.address !== tempusPool.address) {
                return previousPoolData;
              }
              return {
                ...previousPoolData,
                userLPTokenBalance: balance,
              };
            }),
          }));
      }
    },
    [userWalletAddress, userWalletSigner, setPoolData],
  );

  const updateBalance = useCallback(async () => {
    getConfig().tempusPools.forEach(poolConfig => {
      updateBalanceForPool(poolConfig);
    });
  }, [updateBalanceForPool]);

  useEffect(() => {
    updateBalance();
  }, [updateBalance]);

  /**
   * Subscribe to user liquidity provider token transfer event
   */
  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    getConfig().tempusPools.forEach(poolConfig => {
      const lpTokenService = getERC20TokenService(poolConfig.ammAddress, userWalletSigner);

      lpTokenService.onTransfer(userWalletAddress, null, updateBalance);
      lpTokenService.onTransfer(null, userWalletAddress, updateBalance);
    });

    return () => {
      getConfig().tempusPools.forEach(poolConfig => {
        const lpTokenService = getERC20TokenService(poolConfig.ammAddress, userWalletSigner);

        lpTokenService.offTransfer(userWalletAddress, null, updateBalance);
        lpTokenService.offTransfer(null, userWalletAddress, updateBalance);
      });
    };
  }, [userWalletAddress, userWalletSigner, updateBalance]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default UserLPTokenBalanceProvider;
