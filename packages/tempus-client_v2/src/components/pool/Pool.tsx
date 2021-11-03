import { useContext, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { LanguageContext } from '../../context/languageContext';
import { getDataForPool, PoolDataContext } from '../../context/poolDataContext';
import { WalletContext } from '../../context/walletContext';
import getText from '../../localisation/getText';
import NumberUtils from '../../services/NumberUtils';
import Typography from '../typography/Typography';
import PercentageLabel from './percentageLabel/PercentageLabel';

import './Pool.scss';

const Pool = () => {
  const { userWalletSigner } = useContext(WalletContext);
  const { language } = useContext(LanguageContext);
  const { poolData, selectedPool } = useContext(PoolDataContext);

  const [tvlChangePercentage, setTVLChangePercentage] = useState<BigNumber | null>(null);
  const [volume, setVolume] = useState<BigNumber | null>(null);

  /**
   * Currently selected pool in the dashboard
   */
  const activePoolData = useMemo(() => {
    return getDataForPool(selectedPool, poolData);
  }, [poolData, selectedPool]);

  /**
   * Fetch current TVL and TVL from one week ago (or less if pool lifespan is less then one week).
   * TVL from one week ago is used to calculate TVL change over time (percentage increase/decrease)
   * compared to current TVL.
   */
  useEffect(() => {
    const fetchTVLChangeData = async () => {
      if (!userWalletSigner || !activePoolData.tvl) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      try {
        setTVLChangePercentage(
          await poolDataAdapter.getPoolTVLChangeData(
            activePoolData.address,
            activePoolData.backingTokenTicker,
            activePoolData.tvl,
          ),
        );
      } catch (error) {
        console.error('fetchTVLChangeData() - Failed to fetch TVL change percentage!');
      }
    };
    fetchTVLChangeData();
  }, [activePoolData, userWalletSigner]);

  /**
   * Fetch Volume for pool in last 7 days
   */
  useEffect(() => {
    const fetchVolume = async () => {
      if (!userWalletSigner) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      try {
        setVolume(
          await poolDataAdapter.getPoolVolumeData(
            activePoolData.address,
            activePoolData.id,
            activePoolData.backingTokenTicker,
            activePoolData.principalsAddress,
            activePoolData.precision.backingToken,
          ),
        );
      } catch (error) {
        console.error('fetchVolume() - Failed to fetch 7D volume for pool!');
      }
    };
    fetchVolume();
  }, [activePoolData, userWalletSigner]);

  const tvlFormatted = useMemo(() => {
    if (!activePoolData.tvl) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(
      ethers.utils.formatUnits(activePoolData.tvl, activePoolData.precision.backingToken),
      2,
    );
  }, [activePoolData.precision.backingToken, activePoolData.tvl]);

  const tvlChangePercentageFormatted = useMemo(() => {
    if (!tvlChangePercentage) {
      return null;
    }
    return Number(ethers.utils.formatUnits(tvlChangePercentage, activePoolData.precision.backingToken));
  }, [activePoolData.precision.backingToken, tvlChangePercentage]);

  const volumeFormatted = useMemo(() => {
    if (!volume) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatUnits(volume, activePoolData.precision.backingToken), 2);
  }, [activePoolData.precision.backingToken, volume]);

  return (
    <div className="tc__pool">
      <Typography variant="card-title">{getText('pool', language)}</Typography>
      <div className="tc__pool__body">
        <div className="tc__pool__body__item">
          <div className="tc__pool__body__item-title">
            <Typography variant="card-body-text" color="title">
              {getText('marketImpliedYield', language)}
            </Typography>
          </div>
          <Typography variant="card-body-text" color="accent">
            {NumberUtils.formatPercentage(activePoolData.fixedAPR, 2)}
          </Typography>
        </div>
        <div className="tc__pool__body__item">
          <div className="tc__pool__body__item-title">
            <Typography variant="card-body-text" color="title">
              {getText('tvl', language)}
            </Typography>
          </div>
          {tvlChangePercentageFormatted && <PercentageLabel percentage={tvlChangePercentageFormatted} />}
          <Typography variant="card-body-text">${tvlFormatted}</Typography>
        </div>
        <div className="tc__pool__body__item">
          <div className="tc__pool__body__item-title">
            <Typography variant="card-body-text" color="title">
              {getText('volume', language)} (7d)
            </Typography>
          </div>
          <Typography variant="card-body-text">${volumeFormatted}</Typography>
        </div>
        <div className="tc__pool__body__item">
          <div className="tc__pool__body__item-title">
            <Typography variant="card-body-text" color="title">
              {getText('fees', language)}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pool;
