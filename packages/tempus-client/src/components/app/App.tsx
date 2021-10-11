import { FC, useCallback, useState } from 'react';
import isMobile from 'is-mobile';
import { DashboardRowChild } from '../../interfaces';
import { Context, defaultContextValue } from '../../context';
import UserETHBalanceProvider from '../../providers/userEthBalanceProvider';
import UserShareTokenBalanceProvider from '../../providers/userShareTokenBalanceProvider';
import UserBackingTokenBalanceProvider from '../../providers/userBackingTokenBalanceProvider';
import UserYieldBearingTokenBalanceProvider from '../../providers/userYieldBearingTokenBalanceProvider';
import UserLiquidityProviderTokenBalanceProvider from '../../providers/userLiquidityProviderTokenBalanceProvider';
import Header, { HeaderLinks } from '../header/header';
import DashboardManager from '../dashboard/dashboard-manager';
import Analytics from '../analytics/analytics';
import NotificationContainer from '../notification/NotificationContainer';
import MobileBanner from '../mobileBanner/mobileBanner';

import './App.scss';

const App: FC = (): JSX.Element => {
  const [contextData, setContextData] = useState(defaultContextValue);
  const [selectedRow, setSelectedRow] = useState<DashboardRowChild | null>(null);
  const [activePage, setActivePage] = useState<HeaderLinks>('Dashboard');

  const showDashboardHandler = useCallback(() => {
    setSelectedRow(null);
    setActivePage('Dashboard');
  }, [setActivePage]);

  const showAnalyticsHandler = useCallback(() => {
    setActivePage('Analytics');
  }, [setActivePage]);

  const mobile = isMobile();

  return (
    <>
      {mobile && <MobileBanner />}
      {!mobile && (
        <Context.Provider value={{ data: contextData, setData: setContextData }}>
          <div className="tf__app__container">
            <NotificationContainer />
            <Header onLogoClick={showDashboardHandler} onAnalyticsClick={showAnalyticsHandler} />
            {activePage === 'Dashboard' && (
              <DashboardManager selectedRow={selectedRow} onRowSelected={setSelectedRow} />
            )}
            {activePage === 'Analytics' && <Analytics />}
          </div>
          <UserETHBalanceProvider />
          <UserShareTokenBalanceProvider
            tempusPool={contextData.selectedRow ? contextData.selectedRow.tempusPool : null}
          />
          <UserBackingTokenBalanceProvider
            tempusPool={contextData.selectedRow ? contextData.selectedRow.tempusPool : null}
          />
          <UserYieldBearingTokenBalanceProvider
            tempusPool={contextData.selectedRow ? contextData.selectedRow.tempusPool : null}
          />
          <UserLiquidityProviderTokenBalanceProvider
            tempusPool={contextData.selectedRow ? contextData.selectedRow.tempusPool : null}
          />
        </Context.Provider>
      )}
    </>
  );
};

export default App;
