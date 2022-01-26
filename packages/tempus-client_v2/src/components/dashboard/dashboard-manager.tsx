import { Downgraded, useState as useHookState } from '@hookstate/core';
import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletContext } from '../../context/walletContext';
import { DashboardRow, DashboardRowChild } from '../../interfaces/DashboardRow';
import getDashboardDataAdapter from '../../adapters/getDashboardDataAdapter';
import Dashboard from './dashboard';
import { selectedNetworkState } from '../../state/NetworkState';

const DashboardManager: FC = (): JSX.Element => {
  let navigate = useNavigate();

  const selectedNetwork = useHookState(selectedNetworkState);

  const selectedNetworkName = selectedNetwork.attach(Downgraded).get();

  const { userWalletAddress, userWalletConnected, userWalletSigner } = useContext(WalletContext);

  const [rows, setRows] = useState<DashboardRow[]>([]);

  useEffect(() => {
    const fetchRows = async () => {
      if (userWalletSigner) {
        const dashboardDataAdapter = getDashboardDataAdapter(selectedNetworkName, userWalletSigner);
        setRows(dashboardDataAdapter.getRows(selectedNetworkName));
      } else if (userWalletConnected === false) {
        const dashboardDataAdapter = getDashboardDataAdapter(selectedNetworkName);
        setRows(dashboardDataAdapter.getRows(selectedNetworkName));
      }
    };
    fetchRows();
  }, [userWalletConnected, userWalletAddress, userWalletSigner, selectedNetworkName]);

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
