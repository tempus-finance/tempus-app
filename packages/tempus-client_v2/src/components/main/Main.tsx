import { useContext, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { WalletContext } from '../../context/walletContext';
import DashboardDataAdapter from '../../adapters/DashboardDataAdapter';
import getDashboardDataAdapter from '../../adapters/getDashboardDataAdapter';
import UserBalanceDataAdapter from '../../adapters/UserBalanceDataAdapter';
import getUserBalanceDataAdapter from '../../adapters/getUserBalanceDataAdapter';
import NegativeYieldProvider from '../../providers/negativeYieldProvider';
import TVLProvider from '../../providers/tvlProvider';
import FixedAPRProvider from '../../providers/fixedAPRProvider';
import VariableAPRProvider from '../../providers/variableAPRProvider';
import RootRoute from '../routes/RootRoute';
import PoolRoute from '../routes/PoolRoute';

import './Main.scss';

const Main = () => {
  const { userWalletConnected, userWalletSigner, userWalletChain } = useContext(WalletContext);

  const [dashboardDataAdapter, setDashboardDataAdapter] = useState<DashboardDataAdapter | null>(null);
  const [userBalanceDataAdapter, setUserBalanceDataAdapter] = useState<UserBalanceDataAdapter | null>(null);

  useEffect(() => {
    const fetchRows = async () => {
      if (userWalletSigner && userWalletChain) {
        const dashboardDataAdapter = getDashboardDataAdapter(userWalletChain);
        const userBalanceDataAdapter = getUserBalanceDataAdapter(userWalletChain, userWalletSigner);

        setDashboardDataAdapter(dashboardDataAdapter);
        setUserBalanceDataAdapter(userBalanceDataAdapter);
      } else if (userWalletConnected === false && userWalletChain) {
        const dashboardDataAdapter = getDashboardDataAdapter(userWalletChain);
        const userBalanceDataAdapter = getUserBalanceDataAdapter(userWalletChain);

        setDashboardDataAdapter(dashboardDataAdapter);
        setUserBalanceDataAdapter(userBalanceDataAdapter);
      } else {
        const dashboardDataAdapter = getDashboardDataAdapter();

        setDashboardDataAdapter(dashboardDataAdapter);
      }
    };
    fetchRows();
  }, [userWalletConnected, userWalletSigner, userBalanceDataAdapter, userWalletChain]);

  return (
    <div className="tc__main">
      {/* TODO - Refactor all provider components into provider services (see poolShareBalanceProvider and getPoolShareBalanceProvider) */}
      <FixedAPRProvider />
      <VariableAPRProvider />
      <NegativeYieldProvider />
      {dashboardDataAdapter && <TVLProvider dashboardDataAdapter={dashboardDataAdapter} />}

      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/pool/:poolAddress" element={userWalletChain && <PoolRoute chain={userWalletChain} />} />
      </Routes>
    </div>
  );
};

export default Main;
