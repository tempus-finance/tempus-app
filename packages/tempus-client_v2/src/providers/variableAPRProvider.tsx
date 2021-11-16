import { useCallback, useContext, useEffect } from 'react';
import getDefaultProvider from '../services/getDefaultProvider';
import getVariableRateService from '../services/getVariableRateService';
import getConfig from '../utils/getConfig';
import { PoolDataContext } from '../context/poolDataContext';
import { WalletContext } from '../context/walletContext';
import getTempusPoolService from '../services/getTempusPoolService';

const VariableAPRProvider = () => {
  const { setPoolData } = useContext(PoolDataContext);
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
    if (!setPoolData || !document.hasFocus()) {
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

      setPoolData(previousData => ({
        ...previousData,
        poolData: previousData.poolData.map(previousPoolData => {
          const poolAPRData = fetchedPoolAPRData.find(data => data.address === previousPoolData.address);
          const variableAPR = poolAPRData?.variableAPR ?? previousPoolData.variableAPR;

          return {
            ...previousPoolData,
            variableAPR,
            isNegativeYield: poolAPRData?.negativeYield ?? previousPoolData.isNegativeYield,
          };
        }),
      }));
    } catch (error) {
      console.log('VariableAPRProvider - fetchAPR', error);
    }
  }, [getProvider, setPoolData]);

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
