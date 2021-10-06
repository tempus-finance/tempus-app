import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { CircularProgress } from '@material-ui/core';
import { DashboardRow, DashboardRowChild } from '../../interfaces';
import getDashboardDataAdapter from '../../adapters/getDashboardDataAdapter';
import Detail from '../detail/detail';
import Typography from '../typography/Typography';
import Dashboard from './dashboard';
import { Context } from '../../context';
import Spacer from '../spacer/spacer';

type DashboardManagerProps = {
  selectedRow: DashboardRowChild | null;
  onRowSelected?: (row: DashboardRowChild | null) => void;
};

const DashboardManager: FC<DashboardManagerProps> = ({ selectedRow, onRowSelected }): JSX.Element => {
  const { setData } = useContext(Context);

  const [rows, setRows] = useState<DashboardRow[]>([]);

  const {
    data: { userWalletAddress },
  } = useContext(Context);

  useEffect(() => {
    const fetchRows = async () => {
      setRows(await getDashboardDataAdapter().getRows(userWalletAddress));
    };
    fetchRows();
  }, [userWalletAddress]);

  const onRowActionClick = useCallback(
    (row: any) => {
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

      {selectedRow && <Detail content={selectedRow} onClose={onCloseRowDetail} />}
    </>
  );
};

export default DashboardManager;
