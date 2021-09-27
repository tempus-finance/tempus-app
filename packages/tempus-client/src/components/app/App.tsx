import { FC, useCallback, useState } from 'react';
import Header, { HeaderLinks } from '../header/header';
import Statistics from '../statistics/statistics';
import DashboardManager from '../dashboard/dashboard-manager';
import { DashboardRowChild } from '../../interfaces';
import { Context, defaultContextValue } from '../../context';

import './App.scss';

const App: FC = (): JSX.Element => {
  const [contextData, setContextData] = useState(defaultContextValue);
  const [selectedRow, setSelectedRow] = useState<DashboardRowChild | null>(null);
  const [activePage, setActivePage] = useState<HeaderLinks>('Dashboard');

  const showDashboardHandler = useCallback(() => {
    setActivePage('Dashboard');
  }, [setActivePage]);

  return (
    <Context.Provider value={{ data: contextData, setData: setContextData }}>
      <div className="tf__app__container">
        <Header active={activePage} onLogoClick={showDashboardHandler} />
        {activePage === 'Dashboard' && <DashboardManager selectedRow={selectedRow} onRowSelected={setSelectedRow} />}
        {activePage === 'Statistics' && <Statistics />}
      </div>
    </Context.Provider>
  );
};

export default App;
