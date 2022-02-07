import { ethers } from 'ethers';
import { useCallback, useContext, useEffect } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { getChainConfig, getConfig } from '../utils/getConfig';
import getTokenPrecision from '../utils/getTokenPrecision';
import getProvider from '../utils/getProvider';
import { WalletContext } from '../context/walletContext';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { selectedChainState } from '../state/ChainState';
import getPoolDataAdapter from '../adapters/getPoolDataAdapter';
import { FIXED_APR_PRECISION } from '../constants';
import { Chain } from '../interfaces/Chain';

const FixedAPRProvider = () => {
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const selectedChain = useHookState(selectedChainState);

  const selectedChainName = selectedChain.attach(Downgraded).get();

  const { userWalletSigner } = useContext(WalletContext);

  /**
   * Fetch Fixed APR for all tempus pools on each block event
   */
  const fetchAPR = useCallback(
    async (chain: Chain) => {
      const provider = getProvider(chain, userWalletSigner);

      const config = getChainConfig(chain);
      const poolDataAdapter = getPoolDataAdapter(chain, provider);

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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getProvider],
  );

  useEffect(() => {
    const configData = getConfig();
    for (const networkName in configData) {
      fetchAPR(networkName as Chain);
    }
  }, [fetchAPR]);

  /**
   * Update Fixed APR for all pools on each block.
   */
  useEffect(() => {
    if (!userWalletSigner || !selectedChainName) {
      return;
    }
    const provider = userWalletSigner.provider;

    // TODO - Fetch fixed APR every 15 seconds (use rxjs for this) (fetching on every block is too much (fantom block time avg. is 0.9 seconds))
    provider.on('block', () => fetchAPR(selectedChainName));
    return () => {
      provider.off('block', () => fetchAPR(selectedChainName));
    };
  }, [fetchAPR, userWalletSigner, selectedChainName]);

  /**
   * Provider component only updates context value when needed. It does not show anything in the UI.
   */
  return null;
};
export default FixedAPRProvider;
