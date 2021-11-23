import { useCallback, useContext, useEffect } from 'react';
import { useState as useHookState } from '@hookstate/core';
import getConfig from '../utils/getConfig';
import getDefaultProvider from '../services/getDefaultProvider';
import getTempusAMMService from '../services/getTempusAMMService';
import { WalletContext } from '../context/walletContext';
import { dynamicPoolDataState } from '../state/PoolDataState';

const FixedAPRProvider = () => {
  const dynamicPoolData = useHookState(dynamicPoolDataState);

  const { userWalletConnected, userWalletSigner } = useContext(WalletContext);

  /**
   * If user connected wallet, use wallet as a provider, otherwise use Alchemy as a provider.
   */
  const getProvider = useCallback(() => {
    if (userWalletConnected && userWalletSigner) {
      return userWalletSigner.provider;
    } else if (userWalletConnected === false) {
      return getDefaultProvider();
    }
  }, [userWalletConnected, userWalletSigner]);

  /**
   * Fetch Fixed APR for all tempus pools on each block event
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
    const tempusAMMSService = getTempusAMMService(provider);

    // Fetch APR for all Tempus Pools
    const fetchedPoolAPRData = await Promise.all(
      config.tempusPools.map(async tempusPool => {
        try {
          // Get fees for Tempus Pool
          const fixedAPR = await tempusAMMSService.getFixedAPR(tempusPool.ammAddress, tempusPool.principalsAddress);
          return {
            address: tempusPool.address,
            fixedAPR,
          };
        } catch (error) {
          console.error('fetchedPoolAPRData error', error);
          return {
            address: tempusPool.address,
            fixedAPR: null,
          };
        }
      }),
    );

    fetchedPoolAPRData.forEach(fetchedAPRData => {
      const currentFixedAPR = dynamicPoolData[fetchedAPRData.address].fixedAPR.get();
      // Only update state if fetched APR is different from current APR
      // (if APR fetch failed, ie: "fetchedAPRData.fixedAPR === null" -> keep current APR value)
      if (!currentFixedAPR || (fetchedAPRData.fixedAPR && currentFixedAPR !== fetchedAPRData.fixedAPR)) {
        dynamicPoolData[fetchedAPRData.address].fixedAPR.set(fetchedAPRData.fixedAPR);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProvider]);

  /**
   * Update Fixed APR for all pools on each block.
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
export default FixedAPRProvider;
