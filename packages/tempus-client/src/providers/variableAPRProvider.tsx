import { useCallback, useContext, useEffect } from 'react';
import getDefaultProvider from '../services/getDefaultProvider';
import { Context } from '../context';
import getVariableRateService from '../adapters/getVariableRateService';
import getConfig from '../utils/get-config';

const VariableAPRProvider = () => {
  const { setData, data } = useContext(Context);

  const getProvider = useCallback(() => {
    if (data.userWalletConnected && data.userWalletSigner) {
      return data.userWalletSigner.provider;
    } else if (data.userWalletConnected === false) {
      return getDefaultProvider();
    }
  }, [data.userWalletConnected, data.userWalletSigner]);

  /**
   * Fetch APR for all tempus pools on each block event
   */
  const fetchAPR = useCallback(async () => {
    if (!setData) {
      return;
    }
    const provider = getProvider();
    if (!provider) {
      return;
    }

    const config = getConfig();
    const variableRateService = getVariableRateService(provider);

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

        return {
          address: tempusPool.address,
          variableAPR: variableAPR,
        };
      }),
    );

    setData(previousData => ({
      ...previousData,
      poolData: previousData.poolData.map(previousPoolData => {
        const poolAPRData = fetchedPoolAPRData.find(data => data.address === previousPoolData.address);
        return {
          address: previousPoolData.address,
          variableAPR: poolAPRData?.variableAPR || 0,
        };
      }),
    }));
  }, [getProvider, setData]);

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
