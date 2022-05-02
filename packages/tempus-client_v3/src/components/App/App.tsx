import { memo, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { initServices } from 'tempus-core-services';
import MarketsSubheader from '../MarketsSubheader';
import Navbar from '../Navbar/Navbar';
import { getConfig } from '../../config/getConfig';
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

  useEffect(() => {
    const retrieveConfig = async () => {
      const config = await getConfig();
      initServices('ethereum', config);
      initServices('fantom', config);
      initServices('ethereum-fork', config);

      setServicesLoaded(true);
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
              <Route path="/" element={<MarketsSubheader />} />
              <Route path="/portfolio" element={<PortfolioSubheader />} />
            </Routes>
          </div>
        </>
      )}
    </div>
  );
};

export default memo(App);
