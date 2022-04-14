import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LocaleContext, defaultLocaleContextValue } from '../../context/localeContext';
import { TokenBalanceContext, defaultTokenBalanceContextValue } from '../../context/tokenBalanceContext';
import { defaultWalletContextValue, WalletContext } from '../../context/walletContext';
import {
  defaultPendingTransactionsContextValue,
  PendingTransactionsContext,
} from '../../context/pendingTransactionsContext';
import { UserSettingsContext, defaultUserSettingsContextValue } from '../../context/userSettingsContext';
import TokenBalanceProvider from '../../providers/tokenBalanceProvider';
import getUserShareTokenBalanceProvider from '../../providers/getUserShareTokenBalanceProvider';
import getUserLPTokenBalanceProvider from '../../providers/getUserLPTokenBalanceProvider';
import getUserBalanceProvider from '../../providers/getBalanceProvider';
import getPoolShareBalanceProvider from '../../providers/getPoolShareBalanceProvider';
import getAvailableToDepositProvider from '../../providers/getAvailableToDepositProvider';
import getUserYieldBearingTokenBalanceProvider from '../../providers/getUserYieldBearingTokenBalanceProvider';
import getUserBackingTokenBalanceProvider from '../../providers/getUserBackingTokenBalanceProvider';
import NotificationContainer from '../notification/NotificationContainer';
import NavBar from '../navbar/NavBar';
import Main from '../main/Main';

import './App.scss';

const App = () => {
  const [userSettings, setUserSettings] = useState(defaultUserSettingsContextValue);
  const [locale, setLocale] = useState(defaultLocaleContextValue);
  const [tokenBalance, setTokenBalance] = useState(defaultTokenBalanceContextValue);
  const [walletData, setWalletData] = useState(defaultWalletContextValue);
  const [pendingTransactions, setPendingTransactions] = useState(defaultPendingTransactionsContextValue);

  // Initialize providers
  useEffect(() => {
    if (!walletData.userWalletAddress || !walletData.userWalletSigner || !walletData.userWalletChain) {
      return;
    }

    getUserShareTokenBalanceProvider({
      userWalletAddress: walletData.userWalletAddress,
      userWalletSigner: walletData.userWalletSigner,
      chain: walletData.userWalletChain,
    }).init(walletData.userWalletAddress, walletData.userWalletSigner, walletData.userWalletChain);

    getUserLPTokenBalanceProvider({
      userWalletAddress: walletData.userWalletAddress,
      userWalletSigner: walletData.userWalletSigner,
      chain: walletData.userWalletChain,
    }).init(walletData.userWalletAddress, walletData.userWalletSigner, walletData.userWalletChain);

    getUserBalanceProvider({
      userWalletSigner: walletData.userWalletSigner,
      userWalletAddress: walletData.userWalletAddress,
      chain: walletData.userWalletChain,
    }).init(walletData.userWalletAddress, walletData.userWalletSigner, walletData.userWalletChain);

    getPoolShareBalanceProvider({
      userWalletSigner: walletData.userWalletSigner,
      chain: walletData.userWalletChain,
    }).init(walletData.userWalletSigner, walletData.userWalletChain);

    getUserYieldBearingTokenBalanceProvider({
      userWalletSigner: walletData.userWalletSigner,
      userWalletAddress: walletData.userWalletAddress,
      chain: walletData.userWalletChain,
    }).init(walletData.userWalletAddress, walletData.userWalletSigner, walletData.userWalletChain);

    getUserBackingTokenBalanceProvider({
      userWalletSigner: walletData.userWalletSigner,
      userWalletAddress: walletData.userWalletAddress,
      chain: walletData.userWalletChain,
    }).init(walletData.userWalletAddress, walletData.userWalletSigner, walletData.userWalletChain);

    getAvailableToDepositProvider({
      userWalletSigner: walletData.userWalletSigner,
      userWalletAddress: walletData.userWalletAddress,
      chain: walletData.userWalletChain,
    }).init(walletData.userWalletAddress, walletData.userWalletSigner, walletData.userWalletChain);
  }, [walletData.userWalletAddress, walletData.userWalletSigner, walletData.userWalletChain]);

  return (
    <>
      <UserSettingsContext.Provider value={{ ...userSettings, setUserSettings }}>
        <LocaleContext.Provider value={{ ...locale, setLocale }}>
          <TokenBalanceContext.Provider value={{ ...tokenBalance, setTokenBalance }}>
            <WalletContext.Provider value={{ ...walletData, setWalletData }}>
              <PendingTransactionsContext.Provider value={{ ...pendingTransactions, setPendingTransactions }}>
                <BrowserRouter>
                  <div className="tc__app__container">
                    <NavBar />
                    <Main />
                    <NotificationContainer />
                  </div>
                </BrowserRouter>
              </PendingTransactionsContext.Provider>
              <TokenBalanceProvider />
            </WalletContext.Provider>
          </TokenBalanceContext.Provider>
        </LocaleContext.Provider>
      </UserSettingsContext.Provider>
    </>
  );
};

export default App;
