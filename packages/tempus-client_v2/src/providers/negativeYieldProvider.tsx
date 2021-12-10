import { interval, startWith, Subscription } from 'rxjs';
import { useCallback, useContext, useEffect } from 'react';
import { useState as useHookState } from '@hookstate/core';
import { POLLING_INTERVAL } from '../constants';
import getConfig from '../utils/getConfig';
import { TempusPool } from '../interfaces/TempusPool';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { WalletContext } from '../context/walletContext';
import getDefaultProvider from '../services/getDefaultProvider';
import getTempusPoolService from '../services/getTempusPoolService';

const subscriptions$ = new Subscription();

const NegativeYieldProvider = () => {
  const dynamicPoolData = useHookState(dynamicPoolDataState);

  const { userWalletConnected, userWalletSigner } = useContext(WalletContext);

  const getProvider = useCallback(() => {
    if (userWalletConnected && userWalletSigner) {
      return userWalletSigner.provider;
    } else if (userWalletConnected === false) {
      return getDefaultProvider();
    }
  }, [userWalletConnected, userWalletSigner]);

  /**
   * Fetch APR for all tempus pools on each block event
   */
  const fetchPoolNegativeYieldFlag = useCallback(
    async (tempusPool: TempusPool) => {
      if (!document.hasFocus() && dynamicPoolData[tempusPool.address].negativeYield.get() === false) {
        return;
      }
      const provider = getProvider();
      if (!provider) {
        return;
      }

      try {
        const tempusPoolService = getTempusPoolService(provider);
        const [currentInterestRate, initialInterestRate] = await Promise.all([
          tempusPoolService.currentInterestRate(tempusPool.address),
          tempusPoolService.initialInterestRate(tempusPool.address),
        ]);
        const negativeYield = currentInterestRate.lt(initialInterestRate);

        if (dynamicPoolData[tempusPool.address].negativeYield.get() !== negativeYield) {
          dynamicPoolData[tempusPool.address].negativeYield.set(negativeYield);
        }
      } catch (error) {
        console.error('NegativeYieldProvider - fetchPoolNegativeYieldFlag: ', error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getProvider],
  );

  /**
   * Fetch/Update Negative Yield Flag for all pools every POLLING_INTERVAL.
   */
  useEffect(() => {
    getConfig().tempusPools.forEach(poolConfig => {
      try {
        const fetchInterval$ = interval(POLLING_INTERVAL).pipe(startWith(0));
        subscriptions$.add(
          fetchInterval$.subscribe(() => {
            fetchPoolNegativeYieldFlag(poolConfig);
          }),
        );
      } catch (error) {
        console.error('NegativeYieldProvider - Subscriptions: ', error);
      }
    });

    return () => subscriptions$.unsubscribe();
  }, [fetchPoolNegativeYieldFlag]);

  /**
   * Provider component only updates state value when needed. It does not show anything in the UI.
   */
  return null;
};
export default NegativeYieldProvider;
