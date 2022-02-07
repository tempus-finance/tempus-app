import { Downgraded, useState as useHookState } from '@hookstate/core';
import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletContext } from '../../context/walletContext';
import { DashboardRow, DashboardRowChild } from '../../interfaces/DashboardRow';
import getDashboardDataAdapter from '../../adapters/getDashboardDataAdapter';
import { selectedChainState } from '../../state/ChainState';
import Dashboard from './dashboard';

const DashboardManager: FC = (): JSX.Element => {
  let navigate = useNavigate();

  const selectedChain = useHookState(selectedChainState);

  const selectedChainName = selectedChain.attach(Downgraded).get();

  const { userWalletAddress, userWalletConnected, userWalletSigner } = useContext(WalletContext);

  const [rows, setRows] = useState<DashboardRow[]>([]);

  useEffect(() => {
    const fetchRows = async () => {
      if (userWalletSigner && selectedChainName) {
        const dashboardDataAdapter = getDashboardDataAdapter(selectedChainName);
        setRows(dashboardDataAdapter.getRows(selectedChainName));
      } else if (userWalletConnected === false) {
        const dashboardDataAdapter = getDashboardDataAdapter();
        setRows(dashboardDataAdapter.getRows());
      }
    };
    fetchRows();
  }, [userWalletConnected, userWalletAddress, userWalletSigner, selectedChainName]);

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
