import { memo } from 'react';
import Navbar from '../Navbar/Navbar';
import PageNavigation, { PageNavigationLink } from '../PageNavigation';

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
    <div className="tc__app__body" />
  </div>
);

export default memo(App);
