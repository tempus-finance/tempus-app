import { memo } from 'react';
import { Route, Routes } from 'react-router-dom';
import MarketsSubheader from '../MarketsSubheader';
import Navbar from '../Navbar/Navbar';
import PageNavigation, { PageNavigationLink } from '../PageNavigation';
import PortfolioSubheader from '../PortfolioSubheader/PortfolioSubheader';

import './App.scss';

const navigationLinks: PageNavigationLink[] = [
  { text: 'Markets', path: '/' },
  { text: 'Portfolio', path: '/portfolio' },
];

const App = () => (
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

export default memo(App);
