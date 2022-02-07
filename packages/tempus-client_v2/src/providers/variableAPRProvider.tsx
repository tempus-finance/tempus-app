import { useCallback, useContext, useEffect } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import getVariableRateService from '../services/getVariableRateService';
import { getChainConfig, getConfig } from '../utils/getConfig';
import { WalletContext } from '../context/walletContext';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { selectedChainState } from '../state/ChainState';
import getProvider from '../utils/getProvider';
import { Chain } from '../interfaces/Chain';

const VariableAPRProvider = () => {
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const selectedChain = useHookState(selectedChainState);

  const selectedChainName = selectedChain.attach(Downgraded).get();

  const { userWalletSigner } = useContext(WalletContext);

  /**
   * Fetch APR for all tempus pools on each block event
   */
  const fetchAPR = useCallback(
    async (chain: Chain) => {
      const provider = getProvider(chain, userWalletSigner);

      const config = getChainConfig(chain);
      const variableRateService = getVariableRateService(chain, provider);

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
              chain,
              config.averageBlockTime,
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userWalletSigner],
  );

  useEffect(() => {
    const configData = getConfig();

    for (const chainName in configData) {
      fetchAPR(chainName as Chain);
    }
  }, [fetchAPR]);

  /**
   * Update APR for all pools on each block.
   */
  useEffect(() => {
    if (!userWalletSigner || !selectedChainName) {
      return;
    }
    const provider = userWalletSigner.provider;

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
export default VariableAPRProvider;
