import { useState as useHookState } from '@hookstate/core';
import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isEqual } from 'lodash';
import { WalletContext } from '../../context/walletContext';
import { unsupportedNetworkState } from '../../state/ChainState';
import { DashboardRow, DashboardRowChild } from '../../interfaces/DashboardRow';
import getDashboardDataAdapter from '../../adapters/getDashboardDataAdapter';
import { RowsExcludedByDefault } from '../../adapters/DashboardDataAdapter';
import {
  staticPoolDataState,
  dynamicPoolDataState,
  StaticPoolDataMap,
  DynamicPoolStateData,
} from '../../state/PoolDataState';
import Dashboard from './dashboard';

const DashboardManager: FC = (): JSX.Element => {
  let navigate = useNavigate();

  const staticPoolData = useHookState(staticPoolDataState).get();
  const dynamicPoolData = useHookState(dynamicPoolDataState).get();
  const isUnsupportedNetwork = useHookState(unsupportedNetworkState).get();

  const { userWalletAddress, userWalletConnected, userWalletChain, userWalletSigner } = useContext(WalletContext);

  const [rows, setRows] = useState<DashboardRow[]>([]);

  useEffect(() => {
    // if the wallet is not connected
    // else if user balance is non positive
    // hide Rari pools
    const rowsExcludedByDefault: RowsExcludedByDefault = {
      rari: {},
    };

    let rowsData: DashboardRow[] = [];

    if (!isUnsupportedNetwork) {
      // If user wallet is connected and specific chain is selected
      if (userWalletSigner && userWalletChain) {
        const dashboardDataAdapter = getDashboardDataAdapter(userWalletChain);
        excludeNonPositiveRariPools(staticPoolData, dynamicPoolData, rowsExcludedByDefault);
        rowsData = dashboardDataAdapter.getRows(userWalletChain, rowsExcludedByDefault);

        // If user wallet is not connected
      } else if (userWalletConnected === false) {
        const unselectedChain = undefined;
        const dashboardDataAdapter = getDashboardDataAdapter();
        rowsData = dashboardDataAdapter.getRows(unselectedChain, rowsExcludedByDefault);
      }
    }

    // Only update rows state if currently shown rows in dashboard are different from newly fetches rows
    if (!isEqual(rows, rowsData)) {
      setRows(rowsData);
    }
  }, [
    userWalletConnected,
    userWalletAddress,
    userWalletSigner,
    userWalletChain,
    staticPoolData,
    dynamicPoolData,
    rows,
    isUnsupportedNetwork,
  ]);

  const onRowActionClick = useCallback(
    (row: DashboardRowChild) => {
      navigate(`/pool/${row.id}`);
    },
    [navigate],
  );

  return <Dashboard rows={rows} userWalletAddress={userWalletAddress} onRowActionClick={onRowActionClick} />;
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
