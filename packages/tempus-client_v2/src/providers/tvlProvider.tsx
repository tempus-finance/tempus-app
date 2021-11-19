import { FC, useCallback, useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { BigNumber } from 'ethers';
import getConfig from '../utils/getConfig';
import DashboardDataAdapter from '../adapters/DashboardDataAdapter';
import { TempusPool } from '../interfaces/TempusPool';
import { useState as useHookState } from '@hookstate/core';
import { dynamicPoolDataState } from '../state/PoolDataState';

interface TVLProviderProps {
  dashboardDataAdapter: DashboardDataAdapter;
}

const TVLProvider: FC<TVLProviderProps> = props => {
  const { dashboardDataAdapter } = props;

  const dynamicPoolData = useHookState(dynamicPoolDataState);

  const [subscriptions$] = useState<Subscription>(new Subscription());

  /**
   * Updates pool TVL data in context.
   */
  const updatePoolTVL = useCallback(
    (tempusPool: TempusPool, tvl: BigNumber | null) => {
      dynamicPoolData[tempusPool.address].tvl.set(tvl);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Update TVL for all pools every POLLING_INTERVAL.
   */
  useEffect(() => {
    getConfig().tempusPools.forEach(poolConfig => {
      try {
        const tempusPoolTVLStream$ = dashboardDataAdapter.getTempusPoolTVL(poolConfig.address, poolConfig.backingToken);
        subscriptions$.add(
          tempusPoolTVLStream$.subscribe(poolTvl => {
            updatePoolTVL(poolConfig, poolTvl);
          }),
        );
      } catch (error) {
        console.error('TVLProvider - subscriptions', error);
      }
    });

    return () => subscriptions$.unsubscribe();
  }, [dashboardDataAdapter, updatePoolTVL, subscriptions$]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default TVLProvider;
