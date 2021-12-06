import { useContext, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { WalletContext } from '../../context/walletContext';
import DashboardDataAdapter from '../../adapters/DashboardDataAdapter';
import getDashboardDataAdapter from '../../adapters/getDashboardDataAdapter';
import UserBalanceDataAdapter from '../../adapters/UserBalanceDataAdapter';
import getUserBalanceDataAdapter from '../../adapters/getUserBalanceDataAdapter';
import AvailableToDepositUSDProvider from '../../providers/availableToDepositUSDProvider';
import NegativeYieldProvider from '../../providers/negativeYieldProvider';
import TVLProvider from '../../providers/tvlProvider';
import UserBackingTokenBalanceProvider from '../../providers/userBackingTokenBalanceProvider';
import UserYieldBearingTokenBalanceProvider from '../../providers/userYieldBearingTokenBalanceProvider';
import FixedAPRProvider from '../../providers/fixedAPRProvider';
import BalanceProvider from '../../providers/balanceProvider';
import VariableAPRProvider from '../../providers/variableAPRProvider';
import RootRoute from '../routes/RootRoute';
import PoolRoute from '../routes/PoolRoute';

import './Main.scss';

const Main = () => {
  const { userWalletConnected, userWalletSigner } = useContext(WalletContext);

  const [dashboardDataAdapter, setDashboardDataAdapter] = useState<DashboardDataAdapter | null>(null);
  const [userBalanceDataAdapter, setUserBalanceDataAdapter] = useState<UserBalanceDataAdapter | null>(null);

  useEffect(() => {
    const fetchRows = async () => {
      if (userWalletSigner) {
        const dashboardDataAdapter = getDashboardDataAdapter(userWalletSigner);
        const userBalanceDataAdapter = getUserBalanceDataAdapter(userWalletSigner);

        setDashboardDataAdapter(dashboardDataAdapter);
        setUserBalanceDataAdapter(userBalanceDataAdapter);
      } else if (userWalletConnected === false) {
        const dashboardDataAdapter = getDashboardDataAdapter();
        const userBalanceDataAdapter = getUserBalanceDataAdapter();

        setDashboardDataAdapter(dashboardDataAdapter);
        setUserBalanceDataAdapter(userBalanceDataAdapter);
      }
    };
    fetchRows();
  }, [userWalletConnected, userWalletSigner, userBalanceDataAdapter]);

  return (
    <div className="tc__main">
      {/* TODO - Refactor all provider components into provider services (see poolShareBalanceProvider and getPoolShareBalanceProvider) */}
      <FixedAPRProvider />
      <VariableAPRProvider />
      <NegativeYieldProvider />
      {dashboardDataAdapter && <TVLProvider dashboardDataAdapter={dashboardDataAdapter} />}
      {userBalanceDataAdapter && <BalanceProvider userBalanceDataAdapter={userBalanceDataAdapter} />}
      {userBalanceDataAdapter && <AvailableToDepositUSDProvider userBalanceDataAdapter={userBalanceDataAdapter} />}
      {userBalanceDataAdapter && <UserBackingTokenBalanceProvider />}
      {userBalanceDataAdapter && <UserYieldBearingTokenBalanceProvider />}

      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/pool/:poolAddress" element={<PoolRoute />} />
      </Routes>
    </div>
  );
};

export default Main;
