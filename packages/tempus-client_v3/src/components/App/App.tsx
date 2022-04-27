import { memo, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import MarketsSubheader from '../MarketsSubheader';
import Navbar from '../Navbar/Navbar';
import { getConfig } from '../../config/getConfig';
import PageNavigation, { PageNavigationLink } from '../PageNavigation';
import PortfolioSubheader from '../PortfolioSubheader/PortfolioSubheader';

import './App.scss';

const navigationLinks: PageNavigationLink[] = [
  { text: 'Markets', path: '/' },
  { text: 'Portfolio', path: '/portfolio' },
];

const App = () => {
  // The code below is a placeholder
  useEffect(() => {
    const retrieveConfig = async () => {
      const config = await getConfig();
      console.log('config', config);
    };

    retrieveConfig();
  }, []);

  return (
    <div className="tc__app__wrapper">
      <div className="tc__app__nav-header">
        <Navbar />
      </div>
      <div className="tc__app__page-navigation">
        <PageNavigation navigationLinks={navigationLinks} />
      </div>
      <div className="tc__app__body">
        <Routes>
          <Route path="/" element={<MarketsSubheader />} />
          <Route path="/portfolio" element={<PortfolioSubheader />} />
        </Routes>
      </div>
    </div>
  );
};

export default memo(App);
