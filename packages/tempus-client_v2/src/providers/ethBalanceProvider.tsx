import { useCallback, useContext, useEffect } from 'react';
import { ETHBalanceContext } from '../context/ethBalanceContext';
import { WalletContext } from '../context/walletContext';

const forceFetch = true;

const ETHBalanceProvider = () => {
  const { eth, setETHBalance } = useContext(ETHBalanceContext);
  const { userWalletSigner, userWalletAddress } = useContext(WalletContext);

  /**
   * Fetch current ETH balance for user.
   */
  const fetchBalance = useCallback(
    async (forced?: boolean) => {
      if (!setETHBalance || !userWalletSigner || (!document.hasFocus() && eth !== null && !forced)) {
        return;
      }

      const balance = await userWalletSigner.getBalance();

      if (!eth || !eth.eq(balance)) {
        setETHBalance(prevData => ({
          ...prevData,
          eth: balance,
        }));
      }
    },
    [userWalletSigner, eth, setETHBalance],
  );

  /**
   * Update user ETH balance on each mined block.
   */
  useEffect(() => {
    if (!userWalletSigner || !userWalletAddress) {
      return;
    }

    const provider = userWalletSigner.provider;
    provider.on('block', fetchBalance);

    return () => {
      provider.off('block', fetchBalance);
    };
  }, [userWalletSigner, userWalletAddress, fetchBalance]);

  useEffect(() => {
    if (userWalletAddress) {
      fetchBalance(forceFetch);
    }
  }, [userWalletAddress, fetchBalance]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default ETHBalanceProvider;
