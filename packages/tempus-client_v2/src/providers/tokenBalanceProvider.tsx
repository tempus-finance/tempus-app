import { useCallback, useContext, useEffect } from 'react';
import { TokenBalanceContext } from '../context/tokenBalanceContext';
import { WalletContext } from '../context/walletContext';

const TokenBalanceProvider = () => {
  const { tokenBalance, setTokenBalance } = useContext(TokenBalanceContext);
  const { userWalletSigner } = useContext(WalletContext);

  /**
   * Fetch current ETH balance for user.
   */
  const fetchBalance = useCallback(async () => {
    if (!setTokenBalance || !userWalletSigner || (!document.hasFocus() && tokenBalance !== null)) {
      return;
    }

    const balance = await userWalletSigner.getBalance();

    if (!tokenBalance || !tokenBalance.eq(balance)) {
      setTokenBalance(prevData => ({
        ...prevData,
        tokenBalance: balance,
      }));
    }
  }, [userWalletSigner, tokenBalance, setTokenBalance]);

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
export default TokenBalanceProvider;
