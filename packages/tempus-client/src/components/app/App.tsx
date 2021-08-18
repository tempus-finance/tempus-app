import { FC, useCallback, useState } from 'react';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import IconButton from '@material-ui/core/IconButton';
import Header from '../header/header';
import Landing from '../landing/landing';
import DashboardManager from '../dashboard/dashboard-manager';
import Sidebar from '../sidebar/sidebar';
import { DashboardRow } from '../../interfaces';

import './App.scss';

const App: FC = (): JSX.Element => {
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<DashboardRow | null>(null);
  const [activeLink, setActiveLink] = useState<string>('');
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);

  const onClose = useCallback(() => {
    setOpenSidebar(false);
  }, [setOpenSidebar]);

  const onOpenSidebar = useCallback(() => {
    setOpenSidebar(true);
  }, [setOpenSidebar]);

  const showDashboardHandler = useCallback(() => {
    setShowDashboard(true);
    setActiveLink('DASHBOARD');
    setOpenSidebar(true);
  }, [setActiveLink, setShowDashboard, setOpenSidebar]);

  const showLandingHandler = useCallback(() => {
    setShowDashboard(false);
    setActiveLink('');
  }, [setActiveLink, setShowDashboard]);

  return (
    <>
      <div className="tf__sidebar__handler">
        <IconButton onClick={onOpenSidebar}>
          <ChevronRightIcon />
        </IconButton>
      </div>
      <div className="tf__app__container">
        <Header active={activeLink} onLogoClick={showLandingHandler} onDashboardClick={showDashboardHandler} />
        {!showDashboard && <Landing />}
        {showDashboard && <DashboardManager selectedRow={selectedRow} onRowSelected={setSelectedRow} />}
      </div>
      <Sidebar open={openSidebar} content={selectedRow} onClose={onClose} />
    </>
  );
};

export default App;
