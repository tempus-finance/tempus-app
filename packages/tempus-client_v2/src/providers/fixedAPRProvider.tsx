import { ethers } from 'ethers';
import { useCallback, useContext, useEffect } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { getChainConfig } from '../utils/getConfig';
import getTokenPrecision from '../utils/getTokenPrecision';
import getDefaultProvider from '../services/getDefaultProvider';
import { WalletContext } from '../context/walletContext';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { selectedChainState } from '../state/ChainState';
import getPoolDataAdapter from '../adapters/getPoolDataAdapter';
import { FIXED_APR_PRECISION } from '../constants';

const FixedAPRProvider = () => {
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const selectedNetwork = useHookState(selectedChainState);

  const selectedNetworkName = selectedNetwork.attach(Downgraded).get();

  const { userWalletConnected, userWalletSigner } = useContext(WalletContext);

  /**
   * If user connected wallet, use wallet as a provider, otherwise use Alchemy as a provider.
   */
  const getProvider = useCallback(() => {
    if (userWalletConnected && userWalletSigner) {
      return userWalletSigner.provider;
    } else if (userWalletConnected === false) {
      return getDefaultProvider(selectedNetworkName);
    }
  }, [userWalletConnected, userWalletSigner, selectedNetworkName]);

  /**
   * Fetch Fixed APR for all tempus pools on each block event
   */
  const fetchAPR = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      return;
    }

    const config = getChainConfig(selectedNetworkName);
    const poolDataAdapter = getPoolDataAdapter(selectedNetworkName, provider);

    // Fetch APR for all Tempus Pools
    const fetchedPoolAPRData = await Promise.all(
      config.tempusPools.map(async tempusPool => {
        if (!document.hasFocus() && dynamicPoolData[tempusPool.address].fixedAPR.get() !== 'fetching') {
          return null;
        }

        try {
          const spotPrice = ethers.utils.parseUnits('1', getTokenPrecision(tempusPool.address, 'backingToken'));

          const estimateDepositAndFixFromBackingToken = true;
          const fixedAPR = await poolDataAdapter.getEstimatedFixedApr(
            spotPrice,
            estimateDepositAndFixFromBackingToken,
            tempusPool.address,
            tempusPool.poolId,
            tempusPool.ammAddress,
          );
          return {
            address: tempusPool.address,
            fixedAPR: fixedAPR ? Number(ethers.utils.formatUnits(fixedAPR, FIXED_APR_PRECISION)) : null,
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
      if (fetchedAPRData === null) {
        return;
      }

      const currentFixedAPR = dynamicPoolData[fetchedAPRData.address].fixedAPR.get();
      // Only update state if fetched APR is different from current APR
      // (if APR fetch failed, ie: "fetchedAPRData.fixedAPR === null" -> keep current APR value)
      if (
        !currentFixedAPR ||
        currentFixedAPR === 'fetching' ||
        (fetchedAPRData.fixedAPR && currentFixedAPR !== fetchedAPRData.fixedAPR)
      ) {
        dynamicPoolData[fetchedAPRData.address].fixedAPR.set(fetchedAPRData.fixedAPR);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetworkName, getProvider]);

  useEffect(() => {
    fetchAPR();
  }, [fetchAPR]);

  /**
   * Update Fixed APR for all pools on each block.
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
export default FixedAPRProvider;
