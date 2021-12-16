import { useCallback, useContext, useEffect } from 'react';
import { useState as useHookState } from '@hookstate/core';
import getDefaultProvider from '../services/getDefaultProvider';
import getVariableRateService from '../services/getVariableRateService';
import getConfig from '../utils/getConfig';
import { WalletContext } from '../context/walletContext';
import { dynamicPoolDataState } from '../state/PoolDataState';

const VariableAPRProvider = () => {
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
  const fetchAPR = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      return;
    }

    const config = getConfig();
    const variableRateService = getVariableRateService(provider);

    try {
      // Fetch APR for all Tempus Pools
      const fetchedPoolAPRData = await Promise.all(
        config.tempusPools.map(async tempusPool => {
          if (!document.hasFocus() && dynamicPoolData[tempusPool.address].variableAPR.get() !== null) {
            return null;
          }

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
            tempusPool.yieldBearingTokenAddress,
            fees,
          );

          return {
            address: tempusPool.address,
            variableAPR: variableAPR,
          };
        }),
      );

      fetchedPoolAPRData.forEach(fetchedAPRData => {
        if (fetchedAPRData === null) {
          return;
        }

        const currentAPR = dynamicPoolData[fetchedAPRData.address].variableAPR.get();
        // Only update state if fetched APR is different from current APR
        // (if APR fetch failed, ie: "fetchedAPRData.variableAPR === null" -> keep current APR value)
        if (!currentAPR || (fetchedAPRData.variableAPR && currentAPR !== fetchedAPRData.variableAPR)) {
          dynamicPoolData[fetchedAPRData.address].variableAPR.set(fetchedAPRData.variableAPR);
        }
      });
    } catch (error) {
      console.log('VariableAPRProvider - fetchAPR', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProvider]);

  useEffect(() => {
    fetchAPR();
  }, [fetchAPR]);

  /**
   * Update APR for all pools on each block.
   */
  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }
    const provider = userWalletSigner.provider;

    provider.on('block', fetchAPR);
    return () => {
      provider.off('block', fetchAPR);
    };
  }, [fetchAPR, userWalletSigner]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default VariableAPRProvider;
