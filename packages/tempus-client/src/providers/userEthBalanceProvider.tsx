import { useCallback, useContext, useEffect } from 'react';
import { Context } from '../context';

const UserETHBalanceProvider = () => {
  const { setData, data } = useContext(Context);

  /**
   * Fetch current ETH balance for user.
   */
  const fetchBalance = useCallback(async () => {
    if (!setData || !data.userWalletSigner) {
      return;
    }

    const balance = await data.userWalletSigner.getBalance();
    setData(prevData => ({
      ...prevData,
      userEthBalance: balance,
    }));
  }, [data.userWalletSigner, setData]);

  /**
   * Update user ETH balance on each mined block.
   */
  useEffect(() => {
    if (!data.userWalletSigner) {
      return;
    }

    const provider = data.userWalletSigner.provider;
    provider.on('block', fetchBalance);

    return () => {
      provider.off('block', fetchBalance);
    };
  }, [data.userWalletSigner, fetchBalance]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default UserETHBalanceProvider;
