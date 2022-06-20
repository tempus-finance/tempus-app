import { memo, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { initServices } from 'tempus-core-services';
import { useServicesLoaded } from '../../hooks';
import Markets from '../Markets';
import Navbar from '../Navbar';
import { getConfigManager } from '../../config/getConfigManager';
import { HookSubscriber } from '../HookSubscriber';
import { DepositModalResolver } from '../DepositModal';
import { PoolPositionModalResolver } from '../PoolPositionModal';
import { WithdrawModalResolver } from '../WithdrawModal';
import PageNavigation, { PageNavigationLink } from '../PageNavigation';
import Portfolio from '../Portfolio';
import TotalValueLocked from '../TotalValueLocked';

import './App.scss';

const App = () => {
  const [servicesLoaded, setServicesLoaded] = useServicesLoaded();
  const { t } = useTranslation();

  const navigationLinks: PageNavigationLink[] = [
    { text: t('App.navMarkets'), path: '/' },
    { text: t('App.navPortfolio'), path: '/portfolio' },
  ];

  // Init services and config
  useEffect(() => {
    const configManger = getConfigManager();

    initServices('ethereum', configManger.getConfig());
    initServices('fantom', configManger.getConfig());
    initServices('ethereum-fork', configManger.getConfig());

    setServicesLoaded(true);
  }, [setServicesLoaded]);

  return (
    <div className="tc__app__wrapper">
      <HookSubscriber />
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
              <Route path="/portfolio" element={<Portfolio />}>
                <Route path="position/:chain/:ticker/:protocol/:poolAddress" element={<PoolPositionModalResolver />} />
              </Route>

              <Route
                path="/mature-pool/:chain/:ticker/:protocol/:poolAddress"
                element={<PoolPositionModalResolver />}
              />
              <Route path="/withdraw/:chain/:ticker/:protocol/:poolAddress" element={<WithdrawModalResolver />} />
              <Route path="/" element={<Markets />}>
                <Route path="pool/:chain/:ticker/:protocol" element={<DepositModalResolver />} />
              </Route>
            </Routes>
          </div>
        </>
      )}
    </div>
  );
};

export default memo(App);
