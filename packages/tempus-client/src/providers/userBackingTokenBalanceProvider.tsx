import { FC, useCallback, useContext, useEffect } from 'react';
import { ZERO_ETH_ADDRESS } from '../constants';
import { Context } from '../context';
import { TempusPool } from '../interfaces/TempusPool';
import getERC20TokenService from '../services/getERC20TokenService';

interface UserBackingTokenBalanceProviderProps {
  tempusPool: TempusPool | null;
}

const UserBackingTokenBalanceProvider: FC<UserBackingTokenBalanceProviderProps> = props => {
  const { tempusPool } = props;

  const { setData, data } = useContext(Context);

  /**
   * In case backing token is an ERC20 token, fetch user balance from contract
   */
  const updateBalance = useCallback(async () => {
    if (!setData || !data.userWalletSigner || !tempusPool) {
      return;
    }
    const backingTokenService = getERC20TokenService(tempusPool.backingTokenAddress, data.userWalletSigner);

    const balance = await backingTokenService.balanceOf(data.userWalletAddress);
    setData(prevData => ({
      ...prevData,
      userBackingTokenBalance: balance,
    }));
  }, [data.userWalletAddress, data.userWalletSigner, tempusPool, setData]);

  /**
   * In case backing token is ETH, fetch user balance from provider.
   */
  const updateETHBalance = useCallback(async () => {
    if (!setData || !data.userWalletSigner) {
      return;
    }

    const balance = await data.userWalletSigner.getBalance();
    setData(prevData => ({
      ...prevData,
      userBackingTokenBalance: balance,
    }));
  }, [data.userWalletSigner, setData]);

  /**
   * Subscribe to user backing token transfer event
   */
  useEffect(() => {
    if (!data.userWalletSigner || !tempusPool) {
      return;
    }

    if (tempusPool.backingTokenAddress === ZERO_ETH_ADDRESS) {
      data.userWalletSigner.provider.on('block', updateETHBalance);

      return () => {
        if (!data.userWalletSigner) {
          return;
        }
        data.userWalletSigner.provider.off('block', updateETHBalance);
      };
    } else {
      const backingTokenService = getERC20TokenService(tempusPool.backingTokenAddress, data.userWalletSigner);

      backingTokenService.onTransfer(data.userWalletAddress, null, updateBalance);
      backingTokenService.onTransfer(null, data.userWalletAddress, updateBalance);

      return () => {
        backingTokenService.offTransfer(data.userWalletAddress, null, updateBalance);
        backingTokenService.offTransfer(null, data.userWalletAddress, updateBalance);
      };
    }
  }, [data.userWalletAddress, data.userWalletSigner, tempusPool, updateBalance, updateETHBalance, setData]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default UserBackingTokenBalanceProvider;
