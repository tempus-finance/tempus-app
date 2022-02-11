import { ethers } from 'ethers';
import { useCallback, useContext, useEffect } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import {
  catchError,
  combineLatest,
  filter,
  from,
  interval,
  Observable,
  of,
  startWith,
  Subscription,
  switchMap,
} from 'rxjs';
import { getChainConfig, getConfig } from '../utils/getConfig';
import { WalletContext } from '../context/walletContext';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { selectedChainState } from '../state/ChainState';
import { Chain } from '../interfaces/Chain';
import { TempusPool } from '../interfaces/TempusPool';
import getVariableRateService from '../services/getVariableRateService';
import { POLLING_INTERVAL } from '../constants';

const VariableAPRProvider = () => {
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const selectedChain = useHookState(selectedChainState);

  const selectedChainName = selectedChain.attach(Downgraded).get();

  const { userWalletSigner, userWalletConnected } = useContext(WalletContext);

  /**
   * Fetch Variable APR for tempus pool
   */
  const fetchAPR = useCallback(
    (
      chain: Chain,
      tempusPool: TempusPool,
    ): Observable<{ address: string; variableAPR: number | null; tempusFees: number | null }> => {
      const config = getChainConfig(chain);

      const interval$ = interval(POLLING_INTERVAL).pipe(startWith(0));
      return interval$.pipe(
        filter(() => {
          // If VariableAPR or TempusFees have not been fetched yet, we want to force fetch them
          // (even if wallet is not connected or app is not in focus)
          const forceFetch =
            dynamicPoolData[tempusPool.address].variableAPR.get() === null ||
            dynamicPoolData[tempusPool.address].tempusFees.get() === null;

          if (forceFetch) {
            return true;
          }
          return document.hasFocus() && Boolean(userWalletSigner);
        }),
        switchMap(() => {
          const variableRateService = getVariableRateService(chain, userWalletSigner || undefined);

          // Get fees for Tempus Pool
          const feesPromise = variableRateService.calculateFees(
            tempusPool.ammAddress,
            tempusPool.address,
            tempusPool.principalsAddress,
            tempusPool.yieldsAddress,
            chain,
            config.averageBlockTime,
          );
          return from(feesPromise);
        }),
        switchMap(fees => {
          const variableRateService = getVariableRateService(chain, userWalletSigner || undefined);

          // Get variable APR for Tempus Pool
          const variableAPRPromise = variableRateService.getAprRate(
            tempusPool.protocol,
            tempusPool.yieldBearingTokenAddress,
            fees,
          );
          return combineLatest([from(variableAPRPromise), of(fees)]);
        }),
        switchMap(result => {
          const variableAPR = result[0];
          const fees = result[1];

          return of({
            address: tempusPool.address,
            variableAPR: variableAPR,
            tempusFees: Number(ethers.utils.formatEther(fees)),
          });
        }),
        catchError(error => {
          console.error('VariableAPRProvider - fetchAPR', error);
          return of({
            address: tempusPool.address,
            variableAPR: null,
            tempusFees: null,
          });
        }),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userWalletSigner],
  );

  const updatePoolVariableAPR = useCallback(
    (address: string, variableAPR: number | null, tempusFees: number | null) => {
      if (variableAPR === null) {
        return;
      }

      const currentAPR = dynamicPoolData[address].variableAPR.get();
      // Only update state if fetched APR is different from current APR
      // (if APR fetch failed, ie: "fetchedAPRData.variableAPR === null" -> keep current APR value)
      if (!currentAPR || (variableAPR && currentAPR !== variableAPR)) {
        dynamicPoolData[address].variableAPR.set(variableAPR);
      }

      const currentTempusFees = dynamicPoolData[address].tempusFees.get();
      // Only update state if fetched tempusFees are different from current tempusFees
      if (!currentTempusFees || (tempusFees && currentTempusFees !== tempusFees)) {
        dynamicPoolData[address].tempusFees.set(tempusFees);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Update Variable APR for all pools on every POLLING_INTERVAL.
   */
  useEffect(() => {
    // Wait for wallet connection status check to go through before fetching anything
    if (userWalletConnected === null) {
      return;
    }

    const subscriptions$ = new Subscription();

    const configData = getConfig();
    for (const chainName in configData) {
      // If user is connected to specific chain, we should fetch Variable APR data only from that chain and skip all other chains
      if (selectedChainName && selectedChainName !== chainName) {
        continue;
      }

      getChainConfig(chainName as Chain).tempusPools.forEach(poolConfig => {
        try {
          const tempusPoolVariableAprStream$ = fetchAPR(chainName as Chain, poolConfig);
          subscriptions$.add(
            tempusPoolVariableAprStream$.subscribe(result => {
              updatePoolVariableAPR(result.address, result.variableAPR, result.tempusFees);
            }),
          );
        } catch (error) {
          console.error('VariableAPRProvider - Subscribe to Variable APR fetch', error);
        }
      });
    }

    return () => subscriptions$.unsubscribe();
  }, [userWalletSigner, selectedChainName, userWalletConnected, updatePoolVariableAPR, fetchAPR]);

  /**
   * Provider component only updates state value when needed. It does not show anything in the UI.
   */
  return null;
};
export default VariableAPRProvider;
