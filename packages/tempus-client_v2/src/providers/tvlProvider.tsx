import { BigNumber } from 'ethers';
import { Subscription } from 'rxjs';
import { FC, useCallback, useContext, useEffect } from 'react';
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
    const streams: Subscription[] = [];

    getConfig().tempusPools.forEach(poolConfig => {
      const tempusPoolTVLStream$ = dashboardDataAdapter.getTempusPoolTVL(poolConfig.address, poolConfig.backingToken);
      streams.push(
        tempusPoolTVLStream$.subscribe(poolTvl => {
          updatePoolTVL(poolConfig, poolTvl);
        }),
      );
    });

    return () => {
      streams.forEach(stream$ => {
        stream$.unsubscribe();
      });
    };
  }, [dashboardDataAdapter, updatePoolTVL]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default TVLProvider;
