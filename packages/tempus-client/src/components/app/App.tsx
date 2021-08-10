import { FC, useCallback, useState } from 'react';
import Header from '../header/header';
import Landing from '../landing/landing';
import DashboardManager from '../dashboard/dashboard-manager';

import './App.scss';

const App: FC = (): JSX.Element => {
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [activeLink, setActiveLink] = useState<string>('');

  const showDashboardHandler = useCallback(() => {
    setShowDashboard(true);
    setActiveLink('DASHBOARD');
  }, [setActiveLink, setShowDashboard]);

  const showLandingHandler = useCallback(() => {
    setShowDashboard(false);
    setActiveLink('');
  }, [setActiveLink, setShowDashboard]);

  return (
    <div className="tf__app__container">
      <Header active={activeLink} onLogoClick={showLandingHandler} onDashboardClick={showDashboardHandler} />
      {!showDashboard && <Landing />}
      {showDashboard && <DashboardManager />}
    </div>
  );
};

export default App;
