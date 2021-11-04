import { useCallback, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import getDefaultProvider from '../services/getDefaultProvider';
import getVariableRateService from '../services/getVariableRateService';
import getConfig from '../utils/getConfig';
import getTokenPrecision from '../utils/getTokenPrecision';
import { ZERO } from '../constants';
import { PoolDataContext } from '../context/poolDataContext';
import { WalletContext } from '../context/walletContext';

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
    if (!setPoolData) {
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
          fees,
          tokenPrecision: tempusPool.tokenPrecision,
        };
      }),
    );

    setPoolData(previousData => ({
      ...previousData,
      poolData: previousData.poolData.map(previousPoolData => {
        const poolAPRData = fetchedPoolAPRData.find(data => data.address === previousPoolData.address);
        const variableAPR = poolAPRData?.variableAPR || 0;

        let isNegativeYield: boolean = true;
        if (poolAPRData) {
          const precision = getTokenPrecision(poolAPRData.address, 'backingToken');
          // In case APR has more decimals then 'precision', parseUnits will fail.
          // This slices any extra decimals (above precision)
          let aprString = variableAPR.toString();
          if (aprString.indexOf('.') > -1) {
            aprString = aprString.slice(0, aprString.indexOf('.') + 1 + precision);
          }
          const temp = variableAPR && variableAPR > 0 ? ethers.utils.parseUnits(aprString, precision) : ZERO;
          isNegativeYield = poolAPRData ? poolAPRData.fees.add(temp).gt(ZERO) : true;
        }

        return {
          ...previousPoolData,
          variableAPR,
          isNegativeYield,
        };
      }),
    }));
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
