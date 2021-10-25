import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { DashboardRow, DashboardRowChild } from '../../interfaces';
import { Context } from '../../context';
import getDashboardDataAdapter from '../../adapters/getDashboardDataAdapter';
import DashboardDataAdapter from '../../adapters/DashboardDataAdapter';
import TVLProvider from '../../providers/tvlProvider';
import Detail from '../detail/detail';
import Dashboard from './dashboard';
import BalanceProvider from '../../providers/balanceProvider';
import UserBalanceDataAdapter from '../../adapters/UserBalanceDataAdapter';
import getUserBalanceDataAdapter from '../../adapters/getUserBalanceDataAdapter';
import AvailableToDepositUSDProvider from '../../providers/availableToDepositUSDProvider';
import UserBackingTokenBalanceProvider from '../../providers/userBackingTokenBalanceProvider';
import UserYieldBearingTokenBalanceProvider from '../../providers/userYieldBearingTokenBalanceProvider';

type DashboardManagerProps = {
  selectedRow: DashboardRowChild | null;
  onRowSelected?: (row: DashboardRowChild | null) => void;
};

const DashboardManager: FC<DashboardManagerProps> = ({ selectedRow, onRowSelected }): JSX.Element => {
  const [dashboardDataAdapter, setDashboardDataAdapter] = useState<DashboardDataAdapter | null>(null);
  const [userBalanceDataAdapter, setUserBalanceDataAdapter] = useState<UserBalanceDataAdapter | null>(null);
  const [rows, setRows] = useState<DashboardRow[]>([]);

  const {
    data: { userWalletAddress, userWalletConnected, userWalletSigner },
    setData,
  } = useContext(Context);

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

      setData &&
        setData(previousData => ({
          ...previousData,
          selectedRow: row,
        }));
    },
    [onRowSelected, setData],
  );

  const onCloseRowDetail = useCallback(() => {
    onRowSelected && onRowSelected(null);
  }, [onRowSelected]);

  const shouldShowDashboard = !!userWalletAddress && !!selectedRow;

  return (
    <>
      <Dashboard
        hidden={shouldShowDashboard}
        rows={rows}
        userWalletAddress={userWalletAddress}
        onRowActionClick={onRowActionClick}
      />
      {selectedRow && <Detail content={selectedRow} onClose={onCloseRowDetail} />}
      {dashboardDataAdapter && <TVLProvider dashboardDataAdapter={dashboardDataAdapter} />}
      {userBalanceDataAdapter && <BalanceProvider userBalanceDataAdapter={userBalanceDataAdapter} />}
      {userBalanceDataAdapter && <AvailableToDepositUSDProvider userBalanceDataAdapter={userBalanceDataAdapter} />}
      {userBalanceDataAdapter && <UserBackingTokenBalanceProvider />}
      {userBalanceDataAdapter && <UserYieldBearingTokenBalanceProvider />}
    </>
  );
};

export default DashboardManager;
