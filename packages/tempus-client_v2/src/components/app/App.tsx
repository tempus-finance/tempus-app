import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageContext, defaultLanguageContextValue } from '../../context/languageContext';
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
import getUserYieldBearingTokenBalanceProvider from '../../providers/getUserYieldBearingTokenBalanceProvider';
import NotificationContainer from '../notification/NotificationContainer';
import NavBar from '../navbar/NavBar';
import Main from '../main/Main';

import './App.scss';

const App = () => {
  const [userSettings, setUserSettings] = useState(defaultUserSettingsContextValue);
  const [language, setLanguage] = useState(defaultLanguageContextValue);
  const [tokenBalance, setTokenBalance] = useState(defaultTokenBalanceContextValue);
  const [walletData, setWalletData] = useState(defaultWalletContextValue);
  const [pendingTransactions, setPendingTransactions] = useState(defaultPendingTransactionsContextValue);

  // Initialize user share token balance provider every time user wallet address changes
  useEffect(() => {
    if (!walletData.userWalletAddress || !walletData.userWalletSigner || !walletData.userWalletChain) {
      return;
    }

    getUserShareTokenBalanceProvider({
      userWalletAddress: walletData.userWalletAddress,
      userWalletSigner: walletData.userWalletSigner,
      chain: walletData.userWalletChain,
    }).init();
  }, [walletData.userWalletAddress, walletData.userWalletSigner, walletData.userWalletChain]);

  // Initialize user LP Token balance provider every time user wallet address changes
  useEffect(() => {
    if (!walletData.userWalletAddress || !walletData.userWalletSigner || !walletData.userWalletChain) {
      return;
    }

    getUserLPTokenBalanceProvider({
      userWalletAddress: walletData.userWalletAddress,
      userWalletSigner: walletData.userWalletSigner,
      chain: walletData.userWalletChain,
    }).init();
  }, [walletData.userWalletAddress, walletData.userWalletSigner, walletData.userWalletChain]);

  // Initialize user pool balance provider every time user wallet address changes
  useEffect(() => {
    if (!walletData.userWalletAddress || !walletData.userWalletSigner || !walletData.userWalletChain) {
      return;
    }

    getUserBalanceProvider({
      userWalletSigner: walletData.userWalletSigner,
      userWalletAddress: walletData.userWalletAddress,
      chain: walletData.userWalletChain,
    }).init();
  }, [walletData.userWalletAddress, walletData.userWalletSigner, walletData.userWalletChain]);

  // Initialize pool share balance provider every time user wallet address changes
  useEffect(() => {
    if (!walletData.userWalletSigner || !walletData.userWalletChain) {
      return;
    }

    getPoolShareBalanceProvider({
      userWalletSigner: walletData.userWalletSigner,
      chain: walletData.userWalletChain,
    }).init();
  }, [walletData.userWalletSigner, walletData.userWalletChain]);

  // Initialize pool share balance provider every time user wallet address changes
  useEffect(() => {
    if (!walletData.userWalletSigner || !walletData.userWalletChain) {
      return;
    }

    getUserYieldBearingTokenBalanceProvider({
      userWalletSigner: walletData.userWalletSigner,
      userWalletAddress: walletData.userWalletAddress,
      chain: walletData.userWalletChain,
    }).init();
  }, [walletData.userWalletAddress, walletData.userWalletSigner, walletData.userWalletChain]);

  return (
    <>
      <UserSettingsContext.Provider value={{ ...userSettings, setUserSettings }}>
        <LanguageContext.Provider value={{ ...language, setLanguage }}>
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
        </LanguageContext.Provider>
      </UserSettingsContext.Provider>
    </>
  );
};

export default App;
