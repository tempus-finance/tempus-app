import { FC, useCallback, useContext, useEffect } from 'react';
import { Context } from '../context';
import { TempusPool } from '../interfaces/TempusPool';
import getERC20TokenService from '../services/getERC20TokenService';

interface UserLiquidityProviderTokenBalanceProviderProps {
  tempusPool: TempusPool | null;
}

const UserLiquidityProviderTokenBalanceProvider: FC<UserLiquidityProviderTokenBalanceProviderProps> = props => {
  const { tempusPool } = props;

  const { setData, data } = useContext(Context);

  /**
   * Update liquidity provider token balance when ERC20 Transfer event triggers
   */
  const updateBalance = useCallback(async () => {
    if (!setData || !data.userWalletSigner || !tempusPool) {
      return;
    }
    const liquidityProviderTokenService = getERC20TokenService(tempusPool.ammAddress, data.userWalletSigner);

    const balance = await liquidityProviderTokenService.balanceOf(data.userWalletAddress);
    setData(prevData => ({
      ...prevData,
      userLPBalance: balance,
    }));
  }, [data.userWalletAddress, data.userWalletSigner, tempusPool, setData]);

  /**
   * Subscribe to user liquidity provider token transfer event
   */
  useEffect(() => {
    if (!data.userWalletSigner || !tempusPool) {
      return;
    }

    const liquidityProviderTokenService = getERC20TokenService(tempusPool.ammAddress, data.userWalletSigner);

    liquidityProviderTokenService.onTransfer(data.userWalletAddress, null, updateBalance);
    liquidityProviderTokenService.onTransfer(null, data.userWalletAddress, updateBalance);

    return () => {
      liquidityProviderTokenService.offTransfer(data.userWalletAddress, null, updateBalance);
      liquidityProviderTokenService.offTransfer(null, data.userWalletAddress, updateBalance);
    };
  }, [data.userWalletAddress, data.userWalletSigner, tempusPool, updateBalance, setData]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default UserLiquidityProviderTokenBalanceProvider;
