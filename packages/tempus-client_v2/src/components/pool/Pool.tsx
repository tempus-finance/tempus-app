import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useHookstate, useState as useHookState } from '@hookstate/core';
import { ethers, BigNumber } from 'ethers';
import { CONSTANTS, Chain, getTokenPrecision, NumberUtils } from 'tempus-core-services';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import { staticChainDataState } from '../../state/ChainState';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { LocaleContext } from '../../context/localeContext';
import { WalletContext } from '../../context/walletContext';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';
import InfoIcon from '../icons/InfoIcon';
import Spacer from '../spacer/spacer';
import InfoTooltip from '../infoTooltip/infoTooltip';
import FeesTooltip from './feesTooltip/feesTooltip';
import AprTooltip from './aprTooltip/aprTooltip';
import PercentageLabel from './percentageLabel/PercentageLabel';
import { getConfig } from '../../utils/getConfig';

import './Pool.scss';

const { FIXED_APR_PRECISION, SECONDS_IN_A_DAY } = CONSTANTS;

interface PoolProps {
  chain: Chain;
}

const Pool: FC<PoolProps> = ({ chain }) => {
  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookstate(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);
  const staticChainData = useHookState(staticChainDataState);

  const { userWalletSigner } = useContext(WalletContext);
  const { locale } = useContext(LocaleContext);

  const [fixedAPRChangePercentage, setFixedAPRChangePercentage] = useState<number | null>(null);
  const [tvlChangePercentage, setTVLChangePercentage] = useState<BigNumber | null>(null);

  const averageBlockTime = staticChainData[chain].averageBlockTime.attach(Downgraded).get();
  const selectedPoolAddress = selectedPool.attach(Downgraded).get();
  const poolId = staticPoolData[selectedPool.get()].poolId.attach(Downgraded).get();
  const startDate = staticPoolData[selectedPool.get()].startDate.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const backingToken = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
  const backingTokenPrecision = staticPoolData[selectedPool.get()].tokenPrecision.backingToken.attach(Downgraded).get();
  const spotPrice = staticPoolData[selectedPool.get()].spotPrice.attach(Downgraded).get();
  const tvl = dynamicPoolData[selectedPool.get()].tvl.attach(Downgraded).get();
  const fixedAPR = dynamicPoolData[selectedPool.get()].fixedAPR.attach(Downgraded).get();

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

        const spotPriceParsed = ethers.utils.parseUnits(
          spotPrice,
          getTokenPrecision(selectedPoolAddress, 'backingToken', getConfig()),
        );

        const oldFixedAPR = await poolDataAdapter.getEstimatedFixedApr(
          spotPriceParsed,
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
  }, [
    ammAddress,
    fixedAPR,
    poolId,
    selectedPoolAddress,
    userWalletSigner,
    startDate,
    chain,
    averageBlockTime,
    spotPrice,
  ]);

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
      <Typography variant="card-title">{getText('pool', locale)}</Typography>
      <div className="tc__pool__body">
        <div className="tc__pool__body__item">
          <div className="tc__pool__body__item-title">
            <Typography variant="card-body-text" color="title">
              {getText('fixedApr', locale)}
            </Typography>
            <Spacer size={5} />
            <InfoTooltip content={<AprTooltip chain={chain} />}>
              <InfoIcon width={14} height={14} fillColor="#7A7A7A" />
            </InfoTooltip>
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
              {getText('totalValueLocked', locale)}
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
              {getText('fees', locale)}
            </Typography>
            <Spacer size={5} />
            <InfoTooltip content={<FeesTooltip chain={chain} />}>
              <InfoIcon width={14} height={14} fillColor="#7A7A7A" />
            </InfoTooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pool;
