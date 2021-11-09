import { useCallback, useContext, useEffect } from 'react';
import getConfig from '../utils/getConfig';
import getDefaultProvider from '../services/getDefaultProvider';
import getTempusAMMService from '../services/getTempusAMMService';
import { PoolDataContext } from '../context/poolDataContext';
import { WalletContext } from '../context/walletContext';

const FixedAPRProvider = () => {
  const { setPoolData } = useContext(PoolDataContext);
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
    if (!setPoolData) {
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

    setPoolData(previousData => ({
      ...previousData,
      poolData: previousData.poolData.map(previousPoolData => {
        const poolAPRData = fetchedPoolAPRData.find(data => data.address === previousPoolData.address);
        return {
          ...previousPoolData,
          fixedAPR: poolAPRData ? poolAPRData.fixedAPR : null,
        };
      }),
    }));
  }, [getProvider, setPoolData]);

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
