import { memo } from 'react';
import PageNavigation, { PageNavigationLink } from '../PageNavigation';

const navigationLinks: PageNavigationLink[] = [
  { text: 'Markets', path: '/' },
  { text: 'Portfolio', path: '/portfolio' },
];

const App = () => (
  <div className="tc__app-container">
    <PageNavigation navigationLinks={navigationLinks} />
  </div>
);

export default memo(App);
