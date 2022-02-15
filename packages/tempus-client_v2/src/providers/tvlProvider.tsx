import { useState as useHookState } from '@hookstate/core';
import { FC, useCallback, useEffect, useContext } from 'react';
import { Subscription } from 'rxjs';
import { BigNumber } from 'ethers';
import { getChainConfig, getConfig } from '../utils/getConfig';
import DashboardDataAdapter from '../adapters/DashboardDataAdapter';
import { TempusPool } from '../interfaces/TempusPool';
import { Chain } from '../interfaces/Chain';
import { WalletContext } from '../context/walletContext';
import { dynamicPoolDataState } from '../state/PoolDataState';

interface TVLProviderProps {
  dashboardDataAdapter: DashboardDataAdapter;
}

const TVLProvider: FC<TVLProviderProps> = props => {
  const { dashboardDataAdapter } = props;

  const { userWalletConnected, userWalletChain } = useContext(WalletContext);

  const dynamicPoolData = useHookState(dynamicPoolDataState);

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
    // Wait for wallet connection status check to go through before fetching anything
    if (userWalletConnected === null) {
      return;
    }

    const subscriptions$ = new Subscription();

    const configData = getConfig();
    for (const chainName in configData) {
      // If user is connected to specific chain, we should fetch TVL data only from that chain and skip all other chains
      if (userWalletChain && userWalletChain !== chainName) {
        continue;
      }

      getChainConfig(chainName as Chain).tempusPools.forEach(poolConfig => {
        try {
          // If case we want to force TVL fetch (even if app is not in focus)
          const forceFetch = dynamicPoolData[poolConfig.address].tvl.get() === null;

          const tempusPoolTVLStream$ = dashboardDataAdapter.getTempusPoolTVL(
            chainName as Chain,
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
    }

    return () => subscriptions$.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userWalletChain, dashboardDataAdapter, userWalletConnected, updatePoolTVL]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default TVLProvider;
