import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import isMobile from 'is-mobile';
import { LanguageContext, defaultLanguageContextValue } from '../../context/languageContext';
import { ETHBalanceContext, defaultETHBalanceContextValue } from '../../context/ethBalanceContext';
import { defaultWalletContextValue, WalletContext } from '../../context/walletContext';
import {
  defaultPendingTransactionsContextValue,
  PendingTransactionsContext,
} from '../../context/pendingTransactionsContext';
import { UserSettingsContext, defaultUserSettingsContextValue } from '../../context/userSettingsContext';
import ETHBalanceProvider from '../../providers/ethBalanceProvider';
import getUserShareTokenBalanceProvider from '../../providers/getUserShareTokenBalanceProvider';
import getUserBalanceProvider from '../../providers/getBalanceProvider';
import NotificationContainer from '../notification/NotificationContainer';
import getStorageService from '../../services/getStorageService';
import NavBar from '../navbar/NavBar';
import Main from '../main/Main';
import MobileBanner from '../mobileBanner/MobileBanner';

import './App.scss';

const App = () => {
  const [userSettings, setUserSettings] = useState(defaultUserSettingsContextValue);
  const [language, setLanguage] = useState(defaultLanguageContextValue);
  const [ethBalance, setETHBalance] = useState(defaultETHBalanceContextValue);
  const [walletData, setWalletData] = useState(defaultWalletContextValue);
  const [pendingTransactions, setPendingTransactions] = useState(defaultPendingTransactionsContextValue);

  // Initialize user share token balance provider every time user wallet address changes
  useEffect(() => {
    if (!walletData.userWalletAddress) {
      return;
    }

    getUserShareTokenBalanceProvider({
      userWalletAddress: walletData.userWalletAddress,
    }).init();
  }, [walletData.userWalletAddress]);

  // Initialize user pool balance provider every time user wallet address changes
  useEffect(() => {
    if (!walletData.userWalletAddress) {
      return;
    }

    getUserBalanceProvider({
      userWalletAddress: walletData.userWalletAddress,
    }).init();
  }, [walletData.userWalletAddress]);

  useEffect(() => {
    if (!getStorageService().get('instrument')) {
      const instrument = prompt('Enter instrument') || '';
      getStorageService().set('instrument', btoa(instrument));
    }
  }, []);

  const mobile = isMobile();

  return (
    <>
      {mobile && <MobileBanner />}
      {!mobile && (
        <UserSettingsContext.Provider value={{ ...userSettings, setUserSettings }}>
          <LanguageContext.Provider value={{ ...language, setLanguage }}>
            <ETHBalanceContext.Provider value={{ ...ethBalance, setETHBalance }}>
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
                <ETHBalanceProvider />
              </WalletContext.Provider>
            </ETHBalanceContext.Provider>
          </LanguageContext.Provider>
        </UserSettingsContext.Provider>
      )}
    </>
  );
};

export default App;
