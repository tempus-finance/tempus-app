import { Downgraded, useState as useHookState } from '@hookstate/core';
import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isEqual } from 'lodash';
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
  const staticPoolData = useHookState(staticPoolDataState).get();
  const dynamicPoolData = useHookState(dynamicPoolDataState).get();

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

    let rowsData: DashboardRow[] = [];

    // If user wallet is connected and specific chain is selected
    if (userWalletSigner && selectedChainName) {
      const dashboardDataAdapter = getDashboardDataAdapter(selectedChainName);
      excludeNonPositiveRariPools(staticPoolData, dynamicPoolData, rowsExcludedByDefault);
      rowsData = dashboardDataAdapter.getRows(selectedChainName, rowsExcludedByDefault);

      // If user wallet is not connected
    } else if (userWalletConnected === false) {
      const unselectedChain = undefined;
      const dashboardDataAdapter = getDashboardDataAdapter();
      rowsData = dashboardDataAdapter.getRows(unselectedChain, rowsExcludedByDefault);
    }

    // Only update rows state if currently shown rows in dashboard are different from newly fetches rows
    if (!isEqual(rows, rowsData)) {
      setRows(rowsData);
    }
  }, [
    userWalletConnected,
    userWalletAddress,
    userWalletSigner,
    selectedChainName,
    staticPoolData,
    dynamicPoolData,
    rows,
  ]);

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
        if ((principals && !principals.isZero()) || (yields && !yields.isZero())) {
          rowsExcludedByDefault.rari[poolAddress] = true;
        } else {
          delete rowsExcludedByDefault.rari[poolAddress];
        }
      }
    }
  });
};

export default DashboardManager;
