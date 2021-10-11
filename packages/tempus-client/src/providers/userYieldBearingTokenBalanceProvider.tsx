import { FC, useCallback, useContext, useEffect } from 'react';
import { Context } from '../context';
import { TempusPool } from '../interfaces/TempusPool';
import getERC20TokenService from '../services/getERC20TokenService';

interface UserYieldBearingTokenBalanceProviderProps {
  tempusPool: TempusPool | null;
}

const UserYieldBearingTokenBalanceProvider: FC<UserYieldBearingTokenBalanceProviderProps> = props => {
  const { tempusPool } = props;

  const { setData, data } = useContext(Context);

  /**
   * Update yield bearing token balance when ERC20 Transfer event triggers
   */
  const updateBalance = useCallback(async () => {
    if (!setData || !data.userWalletSigner || !tempusPool) {
      return;
    }
    const yieldBearingTokenService = getERC20TokenService(tempusPool.yieldBearingTokenAddress, data.userWalletSigner);

    const balance = await yieldBearingTokenService.balanceOf(data.userWalletAddress);
    setData(prevData => ({
      ...prevData,
      userYieldBearingTokenBalance: balance,
    }));
  }, [data.userWalletAddress, data.userWalletSigner, tempusPool, setData]);

  /**
   * Subscribe to user yield bearing token ERC20 Transfer event
   */
  useEffect(() => {
    if (!tempusPool || !data.userWalletSigner) {
      return;
    }

    const yieldBearingTokenService = getERC20TokenService(tempusPool.yieldBearingTokenAddress, data.userWalletSigner);

    yieldBearingTokenService.onTransfer(data.userWalletAddress, null, updateBalance);
    yieldBearingTokenService.onTransfer(null, data.userWalletAddress, updateBalance);

    return () => {
      yieldBearingTokenService.offTransfer(data.userWalletAddress, null, updateBalance);
      yieldBearingTokenService.offTransfer(null, data.userWalletAddress, updateBalance);
    };
  }, [data.userWalletAddress, tempusPool, data.userWalletSigner, updateBalance, setData]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default UserYieldBearingTokenBalanceProvider;
