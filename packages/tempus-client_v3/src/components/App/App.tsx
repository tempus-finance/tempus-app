import { memo, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { initServices } from 'tempus-core-services';
import { useLocale, useUserPreferences } from '../../hooks';
import Markets from '../Markets';
import Navbar from '../Navbar/Navbar';
import { getConfigManager } from '../../config/getConfigManager';
import PageNavigation, { PageNavigationLink } from '../PageNavigation';
import PortfolioSubheader from '../PortfolioSubheader/PortfolioSubheader';
import TotalValueLocked from '../TotalValueLocked';

import './App.scss';

const navigationLinks: PageNavigationLink[] = [
  { text: 'Markets', path: '/' },
  { text: 'Portfolio', path: '/portfolio' },
];

const App = () => {
  const [servicesLoaded, setServicesLoaded] = useState<boolean>(false);
  // to keep at least one subscriber of the stream insides the hook
  useLocale();
  useUserPreferences();

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
              <Route path="/" element={<Markets />} />
              <Route path="/portfolio" element={<PortfolioSubheader />} />
            </Routes>
          </div>
        </>
      )}
    </div>
  );
};

export default memo(App);
