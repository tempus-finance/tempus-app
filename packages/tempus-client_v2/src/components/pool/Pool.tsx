import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useHookstate, useState as useHookState } from '@hookstate/core';
import { ethers, BigNumber } from 'ethers';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { LanguageContext } from '../../context/languageContext';
import { getDataForPool, PoolDataContext } from '../../context/poolDataContext';
import { WalletContext } from '../../context/walletContext';
import getText from '../../localisation/getText';
import NumberUtils from '../../services/NumberUtils';
import Typography from '../typography/Typography';
import InfoIcon from '../icons/InfoIcon';
import Spacer from '../spacer/spacer';
import FeesTooltip from './feesTooltip/feesTooltip';
import AprTooltip from './aprTooltip/aprTooltip';
// import PercentageLabel from './percentageLabel/PercentageLabel';

import './Pool.scss';

const Pool = () => {
  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookstate(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { userWalletSigner } = useContext(WalletContext);
  const { language } = useContext(LanguageContext);
  const { poolData } = useContext(PoolDataContext);

  //const [tvlChangePercentage, setTVLChangePercentage] = useState<BigNumber | null>(null);
  const [volume, setVolume] = useState<BigNumber | null>(null);
  const [aprTooltipOpen, setAprTooltipOpen] = useState<boolean>(false);
  const [feesTooltipOpen, setFeesTooltipOpen] = useState<boolean>(false);

  const poolId = staticPoolData[selectedPool.get()].poolId.attach(Downgraded).get();
  const tvl = dynamicPoolData[selectedPool.get()].tvl.attach(Downgraded).get();
  const fixedAPR = dynamicPoolDataState[selectedPool.get()].fixedAPR.get();

  /**
   * Currently selected pool in the dashboard
   */
  const activePoolData = useMemo(() => {
    return getDataForPool(selectedPool.get(), poolData);
  }, [poolData, selectedPool]);

  /**
   * Fetch current TVL and TVL from one week ago (or less if pool lifespan is less then one week).
   * TVL from one week ago is used to calculate TVL change over time (percentage increase/decrease)
   * compared to current TVL.
   */
  /*useEffect(() => {
    const fetchTVLChangeData = async () => {
      if (!userWalletSigner || !activePoolData.tvl) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      try {
        setTVLChangePercentage(
          await poolDataAdapter.getPoolTVLChangeData(
            activePoolData.address,
            activePoolData.backingToken,
            activePoolData.tvl,
          ),
        );
      } catch (error) {
        console.error('fetchTVLChangeData() - Failed to fetch TVL change percentage!');
      }
    };
    fetchTVLChangeData();
  }, [activePoolData, userWalletSigner]);*/

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
            poolId,
            activePoolData.backingToken,
            activePoolData.principalsAddress,
            userWalletSigner,
            activePoolData.precision.backingToken,
          ),
        );
      } catch (error) {
        console.error('fetchVolume() - Failed to fetch 7D volume for pool!');
      }
    };
    fetchVolume();
  }, [activePoolData, userWalletSigner, poolId]);

  const onToggleAprTooltip = useCallback(() => {
    setAprTooltipOpen(prevValue => {
      return !prevValue;
    });
  }, []);

  const onToggleFeesTooltip = useCallback(() => {
    setFeesTooltipOpen(prevValue => {
      return !prevValue;
    });
  }, []);

  const tvlFormatted = useMemo(() => {
    if (!tvl) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatUnits(tvl, activePoolData.precision.backingToken), 2);
  }, [activePoolData.precision.backingToken, tvl]);

  /*const tvlChangePercentageFormatted = useMemo(() => {
    if (!tvlChangePercentage) {
      return null;
    }
    return Number(ethers.utils.formatUnits(tvlChangePercentage, activePoolData.precision.backingToken));
  }, [activePoolData.precision.backingToken, tvlChangePercentage]);*/

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
            <Spacer size={5} />
            <div className="tc__pool-aprTooltip" onClick={onToggleAprTooltip}>
              <InfoIcon width={14} height={14} fillColor="#7A7A7A" />
              {aprTooltipOpen && (
                <>
                  <div className="tc__backdrop" />
                  <AprTooltip />
                </>
              )}
            </div>
          </div>
          <Typography variant="card-body-text" color="accent">
            {NumberUtils.formatPercentage(fixedAPR, 2)}
          </Typography>
        </div>
        <div className="tc__pool__body__item">
          <div className="tc__pool__body__item-title">
            <Typography variant="card-body-text" color="title">
              {getText('tvl', language)}
            </Typography>
          </div>
          {/*TODO - Show this for all rows after 14 days of pool lifetime {tvlChangePercentageFormatted && <PercentageLabel percentage={tvlChangePercentageFormatted} />} */}
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
            <Spacer size={5} />
            <div className="tc__pool-feesTooltip" onClick={onToggleFeesTooltip}>
              <InfoIcon width={14} height={14} fillColor="#7A7A7A" />
              {feesTooltipOpen && (
                <>
                  <div className="tc__backdrop" />
                  <FeesTooltip />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pool;
