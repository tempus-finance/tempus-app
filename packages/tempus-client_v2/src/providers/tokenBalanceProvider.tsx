import { useCallback, useContext, useEffect } from 'react';
import { TokenBalanceContext } from '../context/tokenBalanceContext';
import { WalletContext } from '../context/walletContext';

const forceFetch = true;

const TokenBalanceProvider = () => {
  const { tokenBalance, setTokenBalance } = useContext(TokenBalanceContext);
  const { userWalletSigner, userWalletAddress } = useContext(WalletContext);

  /**
   * Fetch current ETH balance for user.
   */
  const fetchBalance = useCallback(
    async (forced?: boolean) => {
      if (!setTokenBalance || !userWalletSigner || (!document.hasFocus() && tokenBalance !== null && !forced)) {
        return;
      }

      const balance = await userWalletSigner.getBalance();

      if (!tokenBalance || !tokenBalance.eq(balance)) {
        setTokenBalance(prevData => ({
          ...prevData,
          tokenBalance: balance,
        }));
      }
    },
    [userWalletSigner, tokenBalance, setTokenBalance],
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
export default TokenBalanceProvider;
