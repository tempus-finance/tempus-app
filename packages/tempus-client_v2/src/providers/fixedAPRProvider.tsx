import { ethers } from 'ethers';
import { useCallback, useContext, useEffect } from 'react';
import { CONSTANTS, getTokenPrecision } from 'tempus-core-services';
import { useState as useHookState } from '@hookstate/core';
import { catchError, filter, from, interval, Observable, of, startWith, Subscription, switchMap } from 'rxjs';
import { getChainConfig, getConfig } from '../utils/getConfig';
import { WalletContext } from '../context/walletContext';
import { dynamicPoolDataState } from '../state/PoolDataState';
import getPoolDataAdapter from '../adapters/getPoolDataAdapter';
import { Chain } from '../interfaces/Chain';
import { TempusPool } from '../interfaces/TempusPool';

const { FIXED_APR_PRECISION, POLLING_INTERVAL } = CONSTANTS;

const FixedAPRProvider = () => {
  const dynamicPoolData = useHookState(dynamicPoolDataState);

  const { userWalletSigner, userWalletConnected, userWalletChain } = useContext(WalletContext);

  /**
   * Fetch Fixed APR for tempus pool
   */
  const fetchAPR = useCallback(
    (chain: Chain, tempusPool: TempusPool): Observable<{ address: string; fixedAPR: number | null }> => {
      const spotPriceParsed = ethers.utils.parseUnits(
        tempusPool.spotPrice,
        getTokenPrecision(tempusPool.address, 'backingToken', getConfig()),
      );

      const interval$ = interval(POLLING_INTERVAL).pipe(startWith(0));
      return interval$.pipe(
        filter(() => {
          // If FixedAPR has not been fetched yet, we want to force fetch it (even if wallet is not connected or app is not in focus)
          const forceFetch = dynamicPoolData[tempusPool.address].fixedAPR.get() === 'fetching';

          if (forceFetch) {
            return true;
          }
          return document.hasFocus() && Boolean(userWalletSigner);
        }),
        switchMap(() => {
          const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner || undefined);

          const estimateDepositAndFixFromBackingToken = true;
          const fixedAPRPromise = poolDataAdapter.getEstimatedFixedApr(
            spotPriceParsed,
            estimateDepositAndFixFromBackingToken,
            tempusPool.address,
            tempusPool.poolId,
            tempusPool.ammAddress,
          );

          return from(fixedAPRPromise);
        }),
        switchMap(fixedAPR => {
          return of({
            address: tempusPool.address,
            fixedAPR: fixedAPR ? Number(ethers.utils.formatUnits(fixedAPR, FIXED_APR_PRECISION)) : null,
          });
        }),
        catchError(error => {
          console.error('FixedAPRProvider - fetchAPR', error);
          return of({
            address: tempusPool.address,
            fixedAPR: null,
          });
        }),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userWalletSigner],
  );

  const updatePoolFixedAPR = useCallback(
    (address: string, fixedAPR: number | null) => {
      if (fixedAPR === null) {
        return;
      }

      const currentFixedAPR = dynamicPoolData[address].fixedAPR.get();
      // Only update state if fetched APR is different from current APR
      // (if APR fetch failed, ie: "fixedAPR === null" -> keep current APR value)
      if (!currentFixedAPR || currentFixedAPR === 'fetching' || (fixedAPR && currentFixedAPR !== fixedAPR)) {
        dynamicPoolData[address].fixedAPR.set(fixedAPR);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Update Fixed APR for all pools on every POLLING_INTERVAL.
   */
  useEffect(() => {
    // Wait for wallet connection status check to go through before fetching anything
    if (userWalletConnected === null) {
      return;
    }

    const subscriptions$ = new Subscription();

    const configData = getConfig();
    for (const chainName in configData) {
      // If user is connected to specific chain, we should fetch Fixed APR data only from that chain and skip all other chains
      if (userWalletChain && userWalletChain !== chainName) {
        continue;
      }

      getChainConfig(chainName as Chain).tempusPools.forEach(poolConfig => {
        try {
          const tempusPoolFixedAprStream$ = fetchAPR(chainName as Chain, poolConfig);
          subscriptions$.add(
            tempusPoolFixedAprStream$.subscribe(result => {
              updatePoolFixedAPR(result.address, result.fixedAPR);
            }),
          );
        } catch (error) {
          console.error('FixedAPRProvider - Subscribe to Fixed APR fetch', error);
        }
      });
    }

    return () => subscriptions$.unsubscribe();
  }, [userWalletChain, userWalletConnected, updatePoolFixedAPR, fetchAPR]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default FixedAPRProvider;
