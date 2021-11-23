import { useCallback, useContext, useEffect } from 'react';
import { useState as useHookState } from '@hookstate/core';
import getDefaultProvider from '../services/getDefaultProvider';
import getVariableRateService from '../services/getVariableRateService';
import getConfig from '../utils/getConfig';
import { WalletContext } from '../context/walletContext';
import getTempusPoolService from '../services/getTempusPoolService';
import { dynamicPoolDataState, negativeYieldPoolDataState } from '../state/PoolDataState';

const VariableAPRProvider = () => {
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const negativeYieldPoolData = useHookState(negativeYieldPoolDataState);

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
  const fetchAPR = useCallback(async () => {
    if (!document.hasFocus()) {
      return;
    }
    const provider = getProvider();
    if (!provider) {
      return;
    }

    const config = getConfig();
    const variableRateService = getVariableRateService(provider);
    const tempusPoolService = getTempusPoolService(provider);

    try {
      // Fetch APR for all Tempus Pools
      const fetchedPoolAPRData = await Promise.all(
        config.tempusPools.map(async tempusPool => {
          // Get fees for Tempus Pool
          const fees = await variableRateService.calculateFees(
            tempusPool.ammAddress,
            tempusPool.address,
            tempusPool.principalsAddress,
            tempusPool.yieldsAddress,
          );

          // Get variable APR for Tempus Pool
          const variableAPR = await variableRateService.getAprRate(
            tempusPool.protocol,
            tempusPool.address,
            tempusPool.yieldBearingTokenAddress,
            fees,
          );

          // Check if yield is negative
          const [currentInterestRate, initialInterestRate] = await Promise.all([
            tempusPoolService.currentInterestRate(tempusPool.address),
            tempusPoolService.initialInterestRate(tempusPool.address),
          ]);

          return {
            address: tempusPool.address,
            variableAPR: variableAPR,
            fees,
            tokenPrecision: tempusPool.tokenPrecision,
            negativeYield: currentInterestRate.lt(initialInterestRate),
          };
        }),
      );

      fetchedPoolAPRData.forEach(fetchedAPRData => {
        const currentAPR = dynamicPoolData[fetchedAPRData.address].variableAPR.get();
        // Only update state if fetched APR is different from current APR
        // (if APR fetch failed, ie: "fetchedAPRData.variableAPR === null" -> keep current APR value)
        if (!currentAPR || (fetchedAPRData.variableAPR && currentAPR !== fetchedAPRData.variableAPR)) {
          dynamicPoolData[fetchedAPRData.address].variableAPR.set(fetchedAPRData.variableAPR);
        }
      });

      fetchedPoolAPRData.forEach(data => {
        // Only update state if fetched negative yield flag is different from current negative yield flag
        if (negativeYieldPoolData[data.address].get() !== data.negativeYield) {
          negativeYieldPoolData[data.address].set(data.negativeYield);
        }
      });
    } catch (error) {
      console.log('VariableAPRProvider - fetchAPR', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProvider]);

  /**
   * Update APR for all pools on each block.
   */
  useEffect(() => {
    const provider = getProvider();
    if (!provider) {
      return;
    }

    provider.on('block', fetchAPR);
    return () => {
      provider.off('block', fetchAPR);
    };
  }, [fetchAPR, getProvider]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default VariableAPRProvider;
