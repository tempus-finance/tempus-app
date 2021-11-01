import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { CircularProgress } from '@material-ui/core';
import { WalletContext } from '../../context/wallet';
import { DashboardRow, DashboardRowChild } from '../../interfaces/DashboardRow';
import getDashboardDataAdapter from '../../adapters/getDashboardDataAdapter';
import DashboardDataAdapter from '../../adapters/DashboardDataAdapter';
import UserBalanceDataAdapter from '../../adapters/UserBalanceDataAdapter';
import getUserBalanceDataAdapter from '../../adapters/getUserBalanceDataAdapter';
import TVLProvider from '../../providers/tvlProvider';
import BalanceProvider from '../../providers/balanceProvider';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import Dashboard from './dashboard';

type DashboardManagerProps = {
  onRowSelected?: (row: DashboardRowChild | null) => void;
};

const DashboardManager: FC<DashboardManagerProps> = ({ onRowSelected }): JSX.Element => {
  const { userWalletAddress, userWalletConnected, userWalletSigner } = useContext(WalletContext);

  const [dashboardDataAdapter, setDashboardDataAdapter] = useState<DashboardDataAdapter | null>(null);
  const [userBalanceDataAdapter, setUserBalanceDataAdapter] = useState<UserBalanceDataAdapter | null>(null);
  const [rows, setRows] = useState<DashboardRow[]>([]);

  useEffect(() => {
    const fetchRows = async () => {
      if (userWalletConnected === true && userWalletAddress && userWalletSigner) {
        const dashboardDataAdapter = getDashboardDataAdapter(userWalletSigner);
        const userBalanceDataAdapter = getUserBalanceDataAdapter(userWalletSigner);

        setDashboardDataAdapter(dashboardDataAdapter);
        setUserBalanceDataAdapter(userBalanceDataAdapter);

        setRows(await dashboardDataAdapter.getRows(userWalletAddress));
      } else if (userWalletConnected === false) {
        const dashboardDataAdapter = getDashboardDataAdapter();
        const userBalanceDataAdapter = getUserBalanceDataAdapter();

        setUserBalanceDataAdapter(userBalanceDataAdapter);
        setDashboardDataAdapter(dashboardDataAdapter);

        setRows(await dashboardDataAdapter.getRows(''));
      }
    };
    fetchRows();
  }, [userWalletConnected, userWalletAddress, userWalletSigner]);

  const onRowActionClick = useCallback(
    (row: DashboardRowChild) => {
      onRowSelected && onRowSelected(row);

      // TODO - Set selected row data in context
    },
    [onRowSelected],
  );

  const shouldShowDashboard = !!userWalletAddress && !!selectedRow;

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
      {rows.length === 0 && (
        <div className="tf__flex-column-center-vh">
          <Spacer size={75} />
          <Typography variant="h4">Fetching data</Typography>
          <Spacer size={50} />
          <CircularProgress size={50} />
        </div>
      )}

      {/*selectedRow && <Detail /> */}
      {dashboardDataAdapter && <TVLProvider dashboardDataAdapter={dashboardDataAdapter} />}
      {userBalanceDataAdapter && <BalanceProvider userBalanceDataAdapter={userBalanceDataAdapter} />}
    </>
  );
};

export default DashboardManager;
