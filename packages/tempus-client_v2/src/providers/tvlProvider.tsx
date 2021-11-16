import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { BigNumber } from 'ethers';
import getConfig from '../utils/getConfig';
import DashboardDataAdapter from '../adapters/DashboardDataAdapter';
import { TempusPool } from '../interfaces/TempusPool';
import { PoolDataContext } from '../context/poolDataContext';

interface TVLProviderProps {
  dashboardDataAdapter: DashboardDataAdapter;
}

const TVLProvider: FC<TVLProviderProps> = props => {
  const { dashboardDataAdapter } = props;

  const { setPoolData } = useContext(PoolDataContext);
  const [subscriptions$] = useState<Subscription>(new Subscription());

  /**
   * Updates pool TVL data in context.
   */
  const updatePoolTVL = useCallback(
    (tempusPool: TempusPool, tvl: BigNumber | null) => {
      setPoolData &&
        setPoolData(previousData => ({
          ...previousData,
          poolData: previousData.poolData.map(previousPoolData => {
            if (previousPoolData.address !== tempusPool.address) {
              return previousPoolData;
            }
            return {
              ...previousPoolData,
              tvl: tvl,
            };
          }),
        }));
    },
    [setPoolData],
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
