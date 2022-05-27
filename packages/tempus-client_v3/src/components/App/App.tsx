import { memo, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { initServices } from 'tempus-core-services';
import { useLocale, useSelectedChain, useUserPreferences } from '../../hooks';
import Markets from '../Markets';
import Navbar from '../Navbar/Navbar';
import { getConfigManager } from '../../config/getConfigManager';
import { DepositModalResolver } from '../DepositModal/DepositModalResolver';
import { PoolPositionModalResolver } from '../PoolPositionModal';
import { WithdrawModalResolver } from '../WithdrawModal';
import PageNavigation, { PageNavigationLink } from '../PageNavigation';
import Portfolio from '../Portfolio';
import TotalValueLocked from '../TotalValueLocked';

import './App.scss';

const App = () => {
  const [servicesLoaded, setServicesLoaded] = useState<boolean>(false);
  const { t } = useTranslation();

  // to keep at least one subscriber of the stream insides the hook
  useLocale();
  useUserPreferences();
  useSelectedChain();

  const navigationLinks: PageNavigationLink[] = [
    { text: t('App.navMarkets'), path: '/' },
    { text: t('App.navPortfolio'), path: '/portfolio' },
  ];

  useEffect(() => {
    const retrieveConfig = () => {
      const configManger = getConfigManager();
      configManger.init().then(success => {
        if (success) {
          initServices('ethereum', configManger.getConfig());
          initServices('fantom', configManger.getConfig());
          initServices('ethereum-fork', configManger.getConfig());
          setServicesLoaded(true);
        }
      });
    };

    retrieveConfig();
  }, []);

  return (
    <div className="tc__app__wrapper">
      {servicesLoaded && (
        <>
          <div className="tc__app__nav-header">
            <Navbar />
          </div>
          <div className="tc__app__page-navigation">
            <PageNavigation navigationLinks={navigationLinks} />
            <TotalValueLocked />
          </div>
          <div className="tc__app__body">
            <Routes>
              <Route path="/portfolio" element={<Portfolio />} />
              <Route
                path="/mature-pool/:chain/:ticker/:protocol/:poolAddress"
                element={<PoolPositionModalResolver />}
              />
              <Route path="/withdraw/:chain/:ticker/:protocol/:poolAddress" element={<WithdrawModalResolver />} />
              <Route path="/pool/:chain/:ticker/:protocol" element={<DepositModalResolver />} />
              <Route path="/" element={<Markets />} />
            </Routes>
          </div>
        </>
      )}
    </div>
  );
};

export default memo(App);
