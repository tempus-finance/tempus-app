import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletContext } from '../../context/walletContext';
import { DashboardRow, DashboardRowChild } from '../../interfaces/DashboardRow';
import getDashboardDataAdapter from '../../adapters/getDashboardDataAdapter';
import Dashboard from './dashboard';

import getStorageService from '../../services/getStorageService';

const DashboardManager: FC = (): JSX.Element => {
  let navigate = useNavigate();

  const { userWalletAddress, userWalletConnected, userWalletSigner } = useContext(WalletContext);

  const [rows, setRows] = useState<DashboardRow[]>([]);

  const missingPiece = useMemo(() => {
    const instrument = getStorageService().get('instrument');
    if (instrument && instrument !== '') {
      try {
        return instrument === (window as any).x;
      } catch (error) {
        console.error('wrong instrument');
      }
    }
    return false;
  }, []);

  useEffect(() => {
    const fetchRows = async () => {
      if (userWalletSigner && missingPiece) {
        const dashboardDataAdapter = getDashboardDataAdapter(userWalletSigner);
        setRows(dashboardDataAdapter.getRows());
      } else if (userWalletConnected === false) {
        const dashboardDataAdapter = getDashboardDataAdapter();
        setRows(dashboardDataAdapter.getRows());
      }
    };
    fetchRows();
  }, [userWalletConnected, userWalletAddress, userWalletSigner, missingPiece]);

  const onRowActionClick = useCallback(
    (row: DashboardRowChild) => {
      navigate(`/pool/${row.id}`);
    },
    [navigate],
  );

  return (
    <>
      {rows.length !== 0 && (
        <Dashboard rows={rows} userWalletAddress={userWalletAddress} onRowActionClick={onRowActionClick} />
      )}
    </>
  );
};

export default DashboardManager;
