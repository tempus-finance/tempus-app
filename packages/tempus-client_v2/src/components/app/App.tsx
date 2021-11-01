import { useState } from 'react';
import { LanguageContext, defaultLanguageContextValue } from '../../context/language';
import { ETHBalanceContext, defaultETHBalanceContextValue } from '../../context/ethBalance';
import { defaultWalletContextValue, WalletContext } from '../../context/wallet';
import { defaultPendingTransactionsContextValue, PendingTransactionsContext } from '../../context/pendingTransactions';
import ETHBalanceProvider from '../../providers/ethBalanceProvider';
import NotificationContainer from '../notification/NotificationContainer';
import NavBar from '../navbar/NavBar';
import Main from '../main/Main';

import './App.scss';

const App = () => {
  const [language, setLanguage] = useState(defaultLanguageContextValue);
  const [ethBalance, setETHBalance] = useState(defaultETHBalanceContextValue);
  const [walletData, setWalletData] = useState(defaultWalletContextValue);
  const [pendingTransactions, setPendingTransactions] = useState(defaultPendingTransactionsContextValue);

  return (
    <LanguageContext.Provider value={{ ...language, setLanguage }}>
      <ETHBalanceContext.Provider value={{ ...ethBalance, setETHBalance }}>
        <WalletContext.Provider value={{ ...walletData, setWalletData }}>
          <PendingTransactionsContext.Provider value={{ ...pendingTransactions, setPendingTransactions }}>
            <div className="tc__app__container">
              <NavBar />
              <Main />
              <NotificationContainer />
            </div>
          </PendingTransactionsContext.Provider>
          <ETHBalanceProvider />
        </WalletContext.Provider>
      </ETHBalanceContext.Provider>
    </LanguageContext.Provider>
  );
};

export default App;
