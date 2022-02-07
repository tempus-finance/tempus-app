import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useHookstate, useState as useHookState } from '@hookstate/core';
import { ethers, BigNumber } from 'ethers';
import { FIXED_APR_PRECISION, SECONDS_IN_A_DAY } from '../../constants';
import getTokenPrecision from '../../utils/getTokenPrecision';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import { staticChainDataState } from '../../state/ChainState';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { LanguageContext } from '../../context/languageContext';
import { WalletContext } from '../../context/walletContext';
import getText from '../../localisation/getText';
import NumberUtils from '../../services/NumberUtils';
import { Chain } from '../../interfaces/Chain';
import Typography from '../typography/Typography';
import InfoIcon from '../icons/InfoIcon';
import Spacer from '../spacer/spacer';
import FeesTooltip from './feesTooltip/feesTooltip';
import AprTooltip from './aprTooltip/aprTooltip';
import PercentageLabel from './percentageLabel/PercentageLabel';

import './Pool.scss';

interface PoolProps {
  chain: Chain;
}

const Pool: FC<PoolProps> = ({ chain }) => {
  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookstate(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);
  const staticChainData = useHookState(staticChainDataState);

  const { userWalletSigner } = useContext(WalletContext);
  const { language } = useContext(LanguageContext);

  const [fixedAPRChangePercentage, setFixedAPRChangePercentage] = useState<number | null>(null);
  const [tvlChangePercentage, setTVLChangePercentage] = useState<BigNumber | null>(null);
  const [aprTooltipOpen, setAprTooltipOpen] = useState<boolean>(false);
  const [feesTooltipOpen, setFeesTooltipOpen] = useState<boolean>(false);

  const averageBlockTime = staticChainData[chain].averageBlockTime.attach(Downgraded).get();
  const selectedPoolAddress = selectedPool.attach(Downgraded).get();
  const poolId = staticPoolData[selectedPool.get()].poolId.attach(Downgraded).get();
  const startDate = staticPoolData[selectedPool.get()].startDate.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const backingToken = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
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
      const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);

      try {
        setTVLChangePercentage(
          await poolDataAdapter.getPoolTVLChangeData(
            selectedPoolAddress,
            startDate,
            backingToken,
            tvl,
            averageBlockTime,
          ),
        );
      } catch (error) {
        console.error('fetchTVLChangeData() - Failed to fetch TVL change percentage!');
      }
    };
    fetchTVLChangeData();
  }, [backingToken, selectedPoolAddress, tvl, userWalletSigner, startDate, chain, averageBlockTime]);

  /**
   * Fetch Fixed APR from one week ago.
   * Fixed APR from one week ago is used to calculate Fixed APR change over time (percentage increase/decrease)
   * compared to current Fixed APR.
   */
  useEffect(() => {
    const fetchFixedAPRChangeData = async () => {
      if (!userWalletSigner || !fixedAPR) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);

      try {
        let latestBlock;
        try {
          latestBlock = await userWalletSigner.provider.getBlock('latest');
        } catch (error) {
          console.error('Pool - fetchFixedAPRChangeData() - Failed to get latest block data!');
          return Promise.reject();
        }

        // Get block number from 7 days ago (approximate - we need to find a better way to fetch exact block number)
        const sevenDaysOldBlock = latestBlock.number - Math.round(SECONDS_IN_A_DAY / averageBlockTime) * 7;

        const spotPrice = ethers.utils.parseUnits('1', getTokenPrecision(selectedPoolAddress, 'backingToken'));

        const oldFixedAPR = await poolDataAdapter.getEstimatedFixedApr(
          spotPrice,
          true,
          selectedPoolAddress,
          poolId,
          ammAddress,
          startDate,
          sevenDaysOldBlock,
        );
        if (!oldFixedAPR || fixedAPR === 'fetching') {
          return;
        }

        const oldFixedAPRParsed = Number(ethers.utils.formatUnits(oldFixedAPR, FIXED_APR_PRECISION));

        const fixedAPRDiff = fixedAPR - oldFixedAPRParsed;

        setFixedAPRChangePercentage(fixedAPRDiff);
      } catch (error) {
        console.error('fetchTVLChangeData() - Failed to fetch Fixed APR change percentage!');
      }
    };
    fetchFixedAPRChangeData();
  }, [ammAddress, fixedAPR, poolId, selectedPoolAddress, userWalletSigner, startDate, chain, averageBlockTime]);

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
                  <AprTooltip chain={chain} />
                </>
              )}
            </div>
          </div>
          {fixedAPRChangePercentage && <PercentageLabel percentage={fixedAPRChangePercentage} />}
          <div className="tc__pool-item-value">
            <Typography variant="card-body-text" color="accent">
              {NumberUtils.formatPercentage(fixedAPR, 2)}
            </Typography>
          </div>
        </div>
        <div className="tc__pool__body__item">
          <div className="tc__pool__body__item-title">
            <Typography variant="card-body-text" color="title">
              {getText('totalValueLocked', language)}
            </Typography>
          </div>
          {tvlChangePercentageFormatted && <PercentageLabel percentage={tvlChangePercentageFormatted} />}
          <div className="tc__pool-item-value">
            <Typography variant="card-body-text">${tvlFormatted}</Typography>
          </div>
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
                  <FeesTooltip chain={chain} />
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
