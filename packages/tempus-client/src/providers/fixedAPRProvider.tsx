import { useCallback, useContext, useEffect } from 'react';
import { Context } from '../context';
import getConfig from '../utils/get-config';
import getDefaultProvider from '../services/getDefaultProvider';
import getTempusAMMService from '../services/getTempusAMMService';

const FixedAPRProvider = () => {
  const { setData, data } = useContext(Context);

  /**
   * If user connected wallet, use wallet as a provider, otherwise use Alchemy as a provider.
   */
  const getProvider = useCallback(() => {
    if (data.userWalletConnected && data.userWalletSigner) {
      return data.userWalletSigner.provider;
    } else if (data.userWalletConnected === false) {
      return getDefaultProvider();
    }
  }, [data.userWalletConnected, data.userWalletSigner]);

  /**
   * Fetch Fixed APR for all tempus pools on each block event
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
    const tempusAMMSService = getTempusAMMService(provider);

    // Fetch APR for all Tempus Pools
    const fetchedPoolAPRData = await Promise.all(
      config.tempusPools.map(async tempusPool => {
        // Get fees for Tempus Pool
        const fixedAPR = await tempusAMMSService.getFixedAPR(tempusPool.ammAddress, tempusPool.principalsAddress);

        return {
          address: tempusPool.address,
          fixedAPR: fixedAPR,
        };
      }),
    );

    setData(previousData => ({
      ...previousData,
      poolData: previousData.poolData.map(previousPoolData => {
        const poolAPRData = fetchedPoolAPRData.find(data => data.address === previousPoolData.address);
        return {
          ...previousPoolData,
          fixedAPR: poolAPRData ? poolAPRData.fixedAPR : null,
        };
      }),
    }));
  }, [getProvider, setData]);

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
