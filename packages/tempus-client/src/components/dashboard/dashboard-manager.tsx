import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { DashboardRow, DashboardRowChild } from '../../interfaces';
import getDashboardDataAdapter from '../../adapters/getDashboardDataAdapter';
import Detail from '../detail/detail';
import Dashboard from './dashboard';
import { Context } from '../../context';

type DashboardManagerProps = {
  selectedRow: DashboardRowChild | null;
  onRowSelected?: (row: DashboardRowChild | null) => void;
};

const DashboardManager: FC<DashboardManagerProps> = ({ selectedRow, onRowSelected }): JSX.Element => {
  const [rows, setRows] = useState<DashboardRow[]>([]);

  const {
    data: { userWalletAddress },
  } = useContext(Context);

  useEffect(() => {
    const fetchRows = async () => {
      setRows(await getDashboardDataAdapter(userWalletAddress).getRows());
    };
    fetchRows();
  }, [userWalletAddress]);

  const onRowActionClick = useCallback(
    (row: any) => {
      onRowSelected && onRowSelected(row);
    },
    [onRowSelected],
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
    </>
  );
};

export default DashboardManager;
