import { Downgraded, useState as useHookState } from '@hookstate/core';
import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletContext } from '../../context/walletContext';
import { DashboardRow, DashboardRowChild } from '../../interfaces/DashboardRow';
import getDashboardDataAdapter from '../../adapters/getDashboardDataAdapter';
import { RowsExcludedByDefault } from '../../adapters/DashboardDataAdapter';
import { selectedChainState } from '../../state/ChainState';
import {
  staticPoolDataState,
  dynamicPoolDataState,
  StaticPoolDataMap,
  DynamicPoolStateData,
} from '../../state/PoolDataState';
import Dashboard from './dashboard';

const DashboardManager: FC = (): JSX.Element => {
  let navigate = useNavigate();

  const selectedChain = useHookState(selectedChainState);
  const staticPoolData = useHookState(staticPoolDataState).attach(Downgraded).get();
  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();

  const selectedChainName = selectedChain.attach(Downgraded).get();

  const { userWalletAddress, userWalletConnected, userWalletSigner } = useContext(WalletContext);

  const [rows, setRows] = useState<DashboardRow[]>([]);

  useEffect(() => {
    // if the wallet is not connected
    // else if user balance is non positive
    // hide Rari pools
    const rowsExcludedByDefault: RowsExcludedByDefault = {
      rari: {},
    };

    const fetchRows = async () => {
      let rows: DashboardRow[] | null = null;
      if (userWalletSigner && selectedChainName) {
        const dashboardDataAdapter = getDashboardDataAdapter(selectedChainName);
        excludeNonPositiveRariPools(staticPoolData, dynamicPoolData, rowsExcludedByDefault);
        rows = dashboardDataAdapter.getRows(selectedChainName, rowsExcludedByDefault);
      } else if (userWalletConnected === false) {
        const unselectedChain = undefined;
        const dashboardDataAdapter = getDashboardDataAdapter();
        rows = dashboardDataAdapter.getRows(unselectedChain, rowsExcludedByDefault);
      }
      rows && setRows(rows);
    };

    fetchRows();
  }, [userWalletConnected, userWalletAddress, userWalletSigner, selectedChainName, staticPoolData, dynamicPoolData]);

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

const excludeNonPositiveRariPools = (
  staticPoolData: StaticPoolDataMap,
  dynamicPoolData: DynamicPoolStateData,
  rowsExcludedByDefault: RowsExcludedByDefault,
): void => {
  Object.keys(staticPoolData).forEach(poolAddress => {
    const { protocol } = staticPoolData[poolAddress];
    if (protocol === 'rari') {
      if (rowsExcludedByDefault.rari) {
        const { principals, yields } = dynamicPoolData[poolAddress].poolShareBalance;
        if (!!principals || !!yields) {
          rowsExcludedByDefault.rari[poolAddress] = true;
        } else {
          delete rowsExcludedByDefault.rari[poolAddress];
        }
      }
    }
  });
};
