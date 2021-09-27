import { FC, useCallback, useState } from 'react';
import { DashboardRowChild } from '../../interfaces';
import { Context, defaultContextValue } from '../../context';
import Header, { HeaderLinks } from '../header/header';
import DashboardManager from '../dashboard/dashboard-manager';
import Analytics from '../analytics/analytics';

import './App.scss';

const App: FC = (): JSX.Element => {
  const [contextData, setContextData] = useState(defaultContextValue);
  const [selectedRow, setSelectedRow] = useState<DashboardRowChild | null>(null);
  const [activePage, setActivePage] = useState<HeaderLinks>('Dashboard');

  const showDashboardHandler = useCallback(() => {
    setActivePage('Dashboard');
  }, [setActivePage]);

  const showAnalyticsHandler = useCallback(() => {
    setActivePage('Analytics');
  }, [setActivePage]);

  return (
    <Context.Provider value={{ data: contextData, setData: setContextData }}>
      <div className="tf__app__container">
        <Header onLogoClick={showDashboardHandler} onAnalyticsClick={showAnalyticsHandler} />
        {activePage === 'Dashboard' && <DashboardManager selectedRow={selectedRow} onRowSelected={setSelectedRow} />}
        {activePage === 'Analytics' && <Analytics />}
      </div>
    </Context.Provider>
  );
};

export default App;
