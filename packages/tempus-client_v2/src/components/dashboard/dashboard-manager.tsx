import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { WalletContext } from '../../context/wallet';
import { PoolDataContext } from '../../context/poolData';
import { DashboardRow, DashboardRowChild } from '../../interfaces/DashboardRow';
import getDashboardDataAdapter from '../../adapters/getDashboardDataAdapter';
import DashboardDataAdapter from '../../adapters/DashboardDataAdapter';
import UserBalanceDataAdapter from '../../adapters/UserBalanceDataAdapter';
import getUserBalanceDataAdapter from '../../adapters/getUserBalanceDataAdapter';
import TVLProvider from '../../providers/tvlProvider';
import BalanceProvider from '../../providers/balanceProvider';
import FixedAPRProvider from '../../providers/fixedAPRProvider';
import VariableAPRProvider from '../../providers/variableAPRProvider';
import AvailableToDepositUSDProvider from '../../providers/availableToDepositUSDProvider';
import UserBackingTokenBalanceProvider from '../../providers/userBackingTokenBalanceProvider';
import UserYieldBearingTokenBalanceProvider from '../../providers/userYieldBearingTokenBalanceProvider';
import Operations from '../operations/Operations';
import Dashboard from './dashboard';

type DashboardManagerProps = {
  onRowSelected?: (row: DashboardRowChild | null) => void;
};

const DashboardManager: FC<DashboardManagerProps> = ({ onRowSelected }): JSX.Element => {
  const { userWalletAddress, userWalletConnected, userWalletSigner } = useContext(WalletContext);
  const { selectedPool, setPoolData } = useContext(PoolDataContext);

  const [dashboardDataAdapter, setDashboardDataAdapter] = useState<DashboardDataAdapter | null>(null);
  const [userBalanceDataAdapter, setUserBalanceDataAdapter] = useState<UserBalanceDataAdapter | null>(null);
  const [rows, setRows] = useState<DashboardRow[]>([]);

  useEffect(() => {
    const fetchRows = async () => {
      if (userWalletSigner) {
        const dashboardDataAdapter = getDashboardDataAdapter(userWalletSigner);
        const userBalanceDataAdapter = getUserBalanceDataAdapter(userWalletSigner);

        setDashboardDataAdapter(dashboardDataAdapter);
        setUserBalanceDataAdapter(userBalanceDataAdapter);

        setRows(dashboardDataAdapter.getRows());
      } else if (userWalletConnected === false) {
        const dashboardDataAdapter = getDashboardDataAdapter();
        const userBalanceDataAdapter = getUserBalanceDataAdapter();

        setUserBalanceDataAdapter(userBalanceDataAdapter);
        setDashboardDataAdapter(dashboardDataAdapter);

        setRows(dashboardDataAdapter.getRows());
      }
    };
    fetchRows();
  }, [userWalletConnected, userWalletAddress, userWalletSigner]);

  const onRowActionClick = useCallback(
    (row: DashboardRowChild) => {
      onRowSelected && onRowSelected(row);

      setPoolData &&
        setPoolData(previousContext => ({
          poolData: previousContext.poolData,
          selectedPool: row.id,
        }));
    },
    [onRowSelected, setPoolData],
  );

  const shouldShowDashboard = !!selectedPool;

  return (
    <>
      {rows.length !== 0 && (
        <Dashboard
          hidden={shouldShowDashboard}
          rows={rows}
          userWalletAddress={userWalletAddress}
          onRowActionClick={onRowActionClick}
        />
      )}

      {selectedPool && <Operations selectedPool={selectedPool} />}
      {dashboardDataAdapter && <TVLProvider dashboardDataAdapter={dashboardDataAdapter} />}
      {userBalanceDataAdapter && <BalanceProvider userBalanceDataAdapter={userBalanceDataAdapter} />}
      <FixedAPRProvider />
      <VariableAPRProvider />
      {userBalanceDataAdapter && <AvailableToDepositUSDProvider userBalanceDataAdapter={userBalanceDataAdapter} />}
      {userBalanceDataAdapter && <UserBackingTokenBalanceProvider />}
      {userBalanceDataAdapter && <UserYieldBearingTokenBalanceProvider />}
    </>
  );
};

export default DashboardManager;
