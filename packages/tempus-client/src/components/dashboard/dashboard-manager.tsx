import { FC, useCallback, useMemo, useState } from 'react';
import { DashboardRow } from '../../interfaces';
import getDashboardDataAdapter from '../../adapters/getDashboardDataAdapter';
import { useAppSelector } from '../../state/hooks';
import { selectUserWalletAddress } from '../../state/slices/user-wallet-slice';
import Dashboard from './dashboard';

type DashboardManagerProps = {
  selectedRow: DashboardRow | null;
  onRowSelected?: (row: DashboardRow | null) => void;
};

const DashboardManager: FC<DashboardManagerProps> = ({ selectedRow, onRowSelected }): JSX.Element => {
  const [rows, setRows] = useState<DashboardRow[]>([]);

  const userWalletAddress = useAppSelector(selectUserWalletAddress);

  useMemo(() => {
    const fetchRows = async () => {
      const rows = await getDashboardDataAdapter(userWalletAddress).getRows();

      setRows(rows);
    };
    fetchRows();
  }, [setRows, userWalletAddress]);

  const onRowActionClick = useCallback(
    (row: any) => {
      onRowSelected && onRowSelected(row);
    },
    [onRowSelected],
  );

  const onCloseRowDetail = useCallback(() => {
    onRowSelected && onRowSelected(null);
  }, [onRowSelected]);

  const shouldShowDashboard = !!selectedRow;

  return (
    <>
      <Dashboard hidden={shouldShowDashboard} rows={rows} onRowActionClick={onRowActionClick} />
      <div className="tf__detail__section__container" hidden={!shouldShowDashboard}>
        <div>Here the details</div> <div onClick={onCloseRowDetail}>Close</div>
      </div>
    </>
  );
};

export default DashboardManager;
