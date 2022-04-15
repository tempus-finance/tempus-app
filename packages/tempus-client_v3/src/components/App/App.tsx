import { memo } from 'react';
import PageNavigation, { PageNavigationLink } from '../PageNavigation';

import './App.scss';

const navigationLinks: PageNavigationLink[] = [
  { text: 'Markets', path: '/' },
  { text: 'Portfolio', path: '/portfolio' },
];

const App = () => (
  <div className="tc__app__wrapper">
    <div className="tc__nav-header">Here the nav header</div>
    <div className="tc__app__page-navigation">
      <PageNavigation navigationLinks={navigationLinks} />
    </div>
    <div className="tc__app__body" />
  </div>
);

export default memo(App);
