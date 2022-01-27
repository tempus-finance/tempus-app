import { Downgraded, useState as useHookState } from '@hookstate/core';
import { FC, useCallback, useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { BigNumber } from 'ethers';
import { getNetworkConfig } from '../utils/getConfig';
import DashboardDataAdapter from '../adapters/DashboardDataAdapter';
import { TempusPool } from '../interfaces/TempusPool';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { selectedChainState } from '../state/ChainState';

interface TVLProviderProps {
  dashboardDataAdapter: DashboardDataAdapter;
}

const TVLProvider: FC<TVLProviderProps> = props => {
  const { dashboardDataAdapter } = props;

  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const selectedNetwork = useHookState(selectedChainState);

  const selectedNetworkName = selectedNetwork.attach(Downgraded).get();

  const [subscriptions$] = useState<Subscription>(new Subscription());

  /**
   * Updates pool TVL data in context.
   */
  const updatePoolTVL = useCallback(
    (tempusPool: TempusPool, tvl: BigNumber | null) => {
      const currentTVL = dynamicPoolData[tempusPool.address].tvl.get();
      // Only update state if fetched TVL is different from current TVL value
      if ((tvl && !currentTVL) || (tvl && currentTVL && !currentTVL.eq(tvl))) {
        dynamicPoolData[tempusPool.address].tvl.set(tvl);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Update TVL for all pools every POLLING_INTERVAL.
   */
  useEffect(() => {
    getNetworkConfig(selectedNetworkName).tempusPools.forEach(poolConfig => {
      try {
        // If case we want to force TVL fetch (even if app is not in focus)
        const forceFetch = dynamicPoolData[poolConfig.address].tvl.get() === null;

        const tempusPoolTVLStream$ = dashboardDataAdapter.getTempusPoolTVL(
          poolConfig.address,
          poolConfig.backingToken,
          forceFetch,
        );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetworkName, dashboardDataAdapter, updatePoolTVL, subscriptions$]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default TVLProvider;
