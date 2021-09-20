import { FC, useCallback, useState } from 'react';
import Header, { HeaderLinks } from '../header/header';
import Landing from '../landing/landing';
import DashboardManager from '../dashboard/dashboard-manager';
import { DashboardRowChild } from '../../interfaces';
import { Context, defaultContextValue } from '../../context';

import './App.scss';

const App: FC = (): JSX.Element => {
  const [contextData, setContextData] = useState(defaultContextValue);
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<DashboardRowChild | null>(null);
  const [activeLink, setActiveLink] = useState<HeaderLinks>('');
  const showDashboardHandler = useCallback(() => {
    setShowDashboard(true);
    setActiveLink('Dashboard');
  }, [setActiveLink, setShowDashboard]);

  const showLandingHandler = useCallback(() => {
    setShowDashboard(false);
    setActiveLink('');
  }, [setActiveLink, setShowDashboard]);

  return (
    <Context.Provider value={{ data: contextData, setData: setContextData }}>
      <div className="tf__app__container">
        <Header active={activeLink} onLogoClick={showLandingHandler} onDashboardClick={showDashboardHandler} />
        {!showDashboard && <Landing />}
        {showDashboard && <DashboardManager selectedRow={selectedRow} onRowSelected={setSelectedRow} />}
      </div>
    </Context.Provider>
  );
};

export default App;
