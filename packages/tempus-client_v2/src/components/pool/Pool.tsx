import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useHookstate, useState as useHookState } from '@hookstate/core';
import { ethers, BigNumber } from 'ethers';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { LanguageContext } from '../../context/languageContext';
import { WalletContext } from '../../context/walletContext';
import getText from '../../localisation/getText';
import NumberUtils from '../../services/NumberUtils';
import Typography from '../typography/Typography';
import InfoIcon from '../icons/InfoIcon';
import Spacer from '../spacer/spacer';
import FeesTooltip from './feesTooltip/feesTooltip';
import AprTooltip from './aprTooltip/aprTooltip';
import PercentageLabel from './percentageLabel/PercentageLabel';

import './Pool.scss';
import { BLOCK_DURATION_SECONDS, SECONDS_IN_A_DAY } from '../../constants';
import { div18f } from '../../utils/weiMath';

const Pool = () => {
  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookstate(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { userWalletSigner } = useContext(WalletContext);
  const { language } = useContext(LanguageContext);

  const [tvlChangePercentage, setTVLChangePercentage] = useState<BigNumber | null>(null);
  const [volumeChangePercentage, setVolumeChangePercentage] = useState<BigNumber | null>(null);
  const [volume, setVolume] = useState<BigNumber | null>(null);
  const [aprTooltipOpen, setAprTooltipOpen] = useState<boolean>(false);
  const [feesTooltipOpen, setFeesTooltipOpen] = useState<boolean>(false);

  const selectedPoolAddress = selectedPool.attach(Downgraded).get();
  const poolId = staticPoolData[selectedPool.get()].poolId.attach(Downgraded).get();
  const startDate = staticPoolData[selectedPool.get()].startDate.attach(Downgraded).get();
  const backingToken = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
  const principalsAddress = staticPoolData[selectedPool.get()].principalsAddress.attach(Downgraded).get();
  const backingTokenPrecision = staticPoolData[selectedPool.get()].tokenPrecision.backingToken.attach(Downgraded).get();
  const tvl = dynamicPoolData[selectedPool.get()].tvl.attach(Downgraded).get();
  const fixedAPR = dynamicPoolData[selectedPool.get()].fixedAPR.get();

  /**
   * Fetch TVL from one week ago.
   * TVL from one week ago is used to calculate TVL change over time (percentage increase/decrease)
   * compared to current TVL.
   */
  useEffect(() => {
    const fetchTVLChangeData = async () => {
      if (!userWalletSigner || !tvl) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      try {
        setTVLChangePercentage(
          await poolDataAdapter.getPoolTVLChangeData(selectedPoolAddress, startDate, backingToken, tvl),
        );
      } catch (error) {
        console.error('fetchTVLChangeData() - Failed to fetch TVL change percentage!');
      }
    };
    fetchTVLChangeData();
  }, [backingToken, selectedPoolAddress, tvl, userWalletSigner, startDate]);

  /**
   * Fetch Volume for pool in last 7 days
   */
  useEffect(() => {
    const fetchVolume = async () => {
      if (!userWalletSigner) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      let latestBlock;
      try {
        latestBlock = await userWalletSigner.provider.getBlock('latest');
      } catch (error) {
        console.error('Pool - fetchVolume() - Failed to get latest block data!');
        return Promise.reject();
      }

      // Get block number from 7 days ago (approximate - we need to find a better way to fetch exact block number)
      // TODO - Maximum number of events returned is 10k if block range is larger then 2k. We need to fetch events in batches to make sure
      // this is going to work when usage of the app goes up and we have more then 10k events per week.
      // TODO - Use the graph service for this. Much faster and precise.
      const sevenDaysOldBlock = latestBlock.number - Math.round(SECONDS_IN_A_DAY / BLOCK_DURATION_SECONDS) * 7;
      const fourteenDaysOldBlock = latestBlock.number - Math.round(SECONDS_IN_A_DAY / BLOCK_DURATION_SECONDS) * 14;

      try {
        const currentVolume = await poolDataAdapter.getPoolVolumeData(
          selectedPoolAddress,
          poolId,
          backingToken,
          principalsAddress,
          sevenDaysOldBlock,
          latestBlock.number,
          backingTokenPrecision,
        );

        const pastVolume = await poolDataAdapter.getPoolVolumeData(
          selectedPoolAddress,
          poolId,
          backingToken,
          principalsAddress,
          fourteenDaysOldBlock,
          sevenDaysOldBlock,
          backingTokenPrecision,
        );

        const volumeDiff = currentVolume.sub(pastVolume);
        const volumeRatio = div18f(volumeDiff, pastVolume, backingTokenPrecision);

        setVolume(currentVolume);
        setVolumeChangePercentage(volumeRatio);
      } catch (error) {
        console.error('fetchVolume() - Failed to fetch 7D volume for pool!');
      }
    };
    fetchVolume();
  }, [selectedPoolAddress, userWalletSigner, poolId, backingToken, principalsAddress, backingTokenPrecision]);

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
    return NumberUtils.formatWithMultiplier(ethers.utils.formatUnits(tvl, backingTokenPrecision), 2);
  }, [backingTokenPrecision, tvl]);

  const tvlChangePercentageFormatted = useMemo(() => {
    if (!tvlChangePercentage) {
      return null;
    }
    return Number(ethers.utils.formatUnits(tvlChangePercentage, backingTokenPrecision));
  }, [backingTokenPrecision, tvlChangePercentage]);

  const volumeFormatted = useMemo(() => {
    if (!volume) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatUnits(volume, backingTokenPrecision), 2);
  }, [backingTokenPrecision, volume]);

  const volumeChangePercentageFormatted = useMemo(() => {
    if (!volumeChangePercentage) {
      return null;
    }
    return Number(ethers.utils.formatUnits(volumeChangePercentage, backingTokenPrecision));
  }, [backingTokenPrecision, volumeChangePercentage]);

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
          {tvlChangePercentageFormatted && <PercentageLabel percentage={tvlChangePercentageFormatted} />}
          <Typography variant="card-body-text">${tvlFormatted}</Typography>
        </div>
        <div className="tc__pool__body__item">
          <div className="tc__pool__body__item-title">
            <Typography variant="card-body-text" color="title">
              {getText('volume', language)} (7d)
            </Typography>
          </div>
          {volumeChangePercentageFormatted && <PercentageLabel percentage={volumeChangePercentageFormatted} />}
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
