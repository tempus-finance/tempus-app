import { useCallback, useContext, useEffect } from 'react';
import { ETHBalanceContext } from '../context/ethBalanceContext';
import { WalletContext } from '../context/walletContext';

const ETHBalanceProvider = () => {
  const { eth, setETHBalance } = useContext(ETHBalanceContext);
  const { userWalletSigner } = useContext(WalletContext);

  /**
   * Fetch current ETH balance for user.
   */
  const fetchBalance = useCallback(async () => {
    if (!setETHBalance || !userWalletSigner || (!document.hasFocus() && eth !== null)) {
      return;
    }

    const balance = await userWalletSigner.getBalance();

    if (!eth || !eth.eq(balance)) {
      setETHBalance(prevData => ({
        ...prevData,
        eth: balance,
      }));
    }
  }, [userWalletSigner, eth, setETHBalance]);

  /**
   * Update user ETH balance on each mined block.
   */
  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    const provider = userWalletSigner.provider;
    provider.on('block', fetchBalance);

    return () => {
      provider.off('block', fetchBalance);
    };
  }, [userWalletSigner, fetchBalance]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default ETHBalanceProvider;
