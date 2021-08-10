import { FC, useCallback, useState } from 'react';
import getConfig from '../../utils/get-config';
import Header from '../header/header';
import Landing from '../landing/landing';

import './App.scss';

const App: FC = (): JSX.Element => {
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [activeLink, setActiveLink] = useState<string>('');

  const showDashboardHandler = useCallback(() => {
    setShowDashboard(true);
    setActiveLink('DASHBOARD');

    console.log(getConfig());
  }, [setActiveLink, setShowDashboard]);

  const showLandingHandler = useCallback(() => {
    setShowDashboard(false);
    setActiveLink('');
  }, [setActiveLink, setShowDashboard]);

  return (
    <div className="tf__app__container">
      <Header active={activeLink} onLogoClick={showLandingHandler} onDashboardClick={showDashboardHandler} />
      {!showDashboard && <Landing />}
      {showDashboard && <div>Here goes the Dashboard</div>}
    </div>
  );
};

export default App;
