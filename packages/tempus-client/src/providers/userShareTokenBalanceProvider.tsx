import { FC, useCallback, useContext, useEffect } from 'react';
import { Context } from '../context';
import { TempusPool } from '../interfaces/TempusPool';
import getERC20TokenService from '../services/getERC20TokenService';

interface UserShareTokenBalanceProviderProps {
  tempusPool: TempusPool | null;
}

const UserShareTokenBalanceProvider: FC<UserShareTokenBalanceProviderProps> = props => {
  const { tempusPool } = props;

  const { setData, data } = useContext(Context);

  /**
   * Fetch current principals balance for user.
   */
  const updatePrincipalsBalance = useCallback(async () => {
    if (!setData || !data.userWalletSigner || !tempusPool) {
      return;
    }
    const principalsService = getERC20TokenService(tempusPool.principalsAddress, data.userWalletSigner);

    const balance = await principalsService.balanceOf(data.userWalletAddress);
    setData(prevData => ({
      ...prevData,
      userPrincipalsBalance: balance,
    }));
  }, [data.userWalletAddress, data.userWalletSigner, tempusPool, setData]);

  /**
   * Fetch current yields balance for user.
   */
  const updateYieldsBalance = useCallback(async () => {
    if (!setData || !data.userWalletSigner || !tempusPool) {
      return;
    }
    const yieldsService = getERC20TokenService(tempusPool.yieldsAddress, data.userWalletSigner);

    const balance = await yieldsService.balanceOf(data.userWalletAddress);
    setData(prevData => ({
      ...prevData,
      userYieldsBalance: balance,
    }));
  }, [data.userWalletAddress, data.userWalletSigner, tempusPool, setData]);

  /**
   * Subscribe to user principals token transfer event
   */
  useEffect(() => {
    if (!data.userWalletSigner || !tempusPool) {
      return;
    }

    const principalsService = getERC20TokenService(tempusPool.principalsAddress, data.userWalletSigner);

    principalsService.onTransfer(data.userWalletAddress, null, updatePrincipalsBalance);
    principalsService.onTransfer(null, data.userWalletAddress, updatePrincipalsBalance);

    return () => {
      principalsService.offTransfer(data.userWalletAddress, null, updatePrincipalsBalance);
      principalsService.offTransfer(null, data.userWalletAddress, updatePrincipalsBalance);
    };
  }, [data.userWalletAddress, data.userWalletSigner, tempusPool, updatePrincipalsBalance, setData]);

  /**
   * Subscribe to user yields token transfer event
   */
  useEffect(() => {
    if (!data.userWalletSigner || !tempusPool) {
      return;
    }

    const yieldsService = getERC20TokenService(tempusPool.yieldsAddress, data.userWalletSigner);

    yieldsService.onTransfer(data.userWalletAddress, null, updateYieldsBalance);
    yieldsService.onTransfer(null, data.userWalletAddress, updateYieldsBalance);

    return () => {
      yieldsService.offTransfer(data.userWalletAddress, null, updateYieldsBalance);
      yieldsService.offTransfer(null, data.userWalletAddress, updateYieldsBalance);
    };
  }, [data.userWalletAddress, data.userWalletSigner, tempusPool, updateYieldsBalance, setData]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default UserShareTokenBalanceProvider;
