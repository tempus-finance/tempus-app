import { interval, startWith, Subscription } from 'rxjs';
import { useCallback, useContext, useEffect } from 'react';
import {
  CONSTANTS,
  Chain,
  TempusPool,
  getProvider,
  getDefaultProvider,
  getTempusPoolService,
} from 'tempus-core-services';
import { useState as useHookState } from '@hookstate/core';
import { getChainConfig, getConfig } from '../utils/getConfig';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { WalletContext } from '../context/walletContext';

const { POLLING_INTERVAL } = CONSTANTS;
const subscriptions$ = new Subscription();

const NegativeYieldProvider = () => {
  const dynamicPoolData = useHookState(dynamicPoolDataState);

  const { userWalletSigner } = useContext(WalletContext);

  /**
   * Fetch APR for all tempus pools on each block event
   */
  const fetchPoolNegativeYieldFlag = useCallback(
    async (chain: Chain, tempusPool: TempusPool) => {
      if (!document.hasFocus() && dynamicPoolData[tempusPool.address].negativeYield.get() === false) {
        return;
      }
      const provider = await getProvider(chain, userWalletSigner, getDefaultProvider, getChainConfig);
      if (!provider) {
        return;
      }

      try {
        const tempusPoolService = getTempusPoolService(chain, getChainConfig, provider);
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
    [userWalletSigner],
  );

  /**
   * Fetch/Update Negative Yield Flag for all pools every POLLING_INTERVAL.
   */
  useEffect(() => {
    const configData = getConfig();

    for (const chainName in configData) {
      getChainConfig(chainName as Chain).tempusPools.forEach(poolConfig => {
        try {
          const fetchInterval$ = interval(POLLING_INTERVAL).pipe(startWith(0));
          subscriptions$.add(
            fetchInterval$.subscribe(() => {
              fetchPoolNegativeYieldFlag(chainName as Chain, poolConfig);
            }),
          );
        } catch (error) {
          console.error('NegativeYieldProvider - Subscriptions: ', error);
        }
      });
    }

    return () => subscriptions$.unsubscribe();
  }, [fetchPoolNegativeYieldFlag]);

  /**
   * Provider component only updates state value when needed. It does not show anything in the UI.
   */
  return null;
};
export default NegativeYieldProvider;
