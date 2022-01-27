import { differenceInDays } from 'date-fns';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../../state/PoolDataState';
import { selectedChainState } from '../../../state/ChainState';
import getPoolDataAdapter from '../../../adapters/getPoolDataAdapter';
import { LanguageContext } from '../../../context/languageContext';
import { WalletContext } from '../../../context/walletContext';
import getText from '../../../localisation/getText';
import NumberUtils from '../../../services/NumberUtils';
import Typography from '../../typography/Typography';

import './aprTooltip.scss';

const AprTooltip = () => {
  const selectedPool = useHookState(selectedPoolState);
  const staticPoolData = useHookState(staticPoolDataState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const selectedNetwork = useHookState(selectedChainState);

  const { userWalletSigner } = useContext(WalletContext);
  const { language } = useContext(LanguageContext);

  const [poolRatio, setPoolRatio] = useState<number[] | null>(null);

  const selectedNetworkName = selectedNetwork.attach(Downgraded).get();
  const fixedAPR = dynamicPoolData[selectedPool.get()].fixedAPR.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const principalsAddress = staticPoolData[selectedPool.get()].principalsAddress.attach(Downgraded).get();
  const yieldsAddress = staticPoolData[selectedPool.get()].yieldsAddress.attach(Downgraded).get();
  const startDate = staticPoolData[selectedPool.get()].startDate.attach(Downgraded).get();
  const maturityDate = staticPoolData[selectedPool.get()].maturityDate.attach(Downgraded).get();

  useEffect(() => {
    const fetchPoolRation = async () => {
      if (!userWalletSigner) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(selectedNetworkName, userWalletSigner);

      const { principalsShare, yieldsShare } = await poolDataAdapter.getPoolRatioOfAssets(
        ammAddress,
        principalsAddress,
        yieldsAddress,
      );

      setPoolRatio([principalsShare, yieldsShare]);
    };

    fetchPoolRation();
  }, [ammAddress, principalsAddress, userWalletSigner, yieldsAddress, selectedNetworkName]);

  const futureAprFormatted = useMemo(() => {
    return NumberUtils.formatPercentage(fixedAPR, 2);
  }, [fixedAPR]);

  const futureYieldFormatted = useMemo(() => {
    if (fixedAPR && fixedAPR !== 'fetching') {
      const daysToMaturity = differenceInDays(maturityDate, startDate);
      const dailyInterest = (fixedAPR || 1) / 365;
      return NumberUtils.formatPercentage(dailyInterest * daysToMaturity, 2);
    }

    return null;
  }, [fixedAPR, maturityDate, startDate]);

  // const lifetimeAprFormatted = useMemo(() => {
  //   if (poolRatio !== null && poolRatio[0] && poolRatio[1]) {
  //     const daysToMaturity = differenceInDays(maturityDate, startDate);
  //     const dailyInterest = poolRatio[0] / poolRatio[1] / 365;
  //     return NumberUtils.formatPercentage(dailyInterest * daysToMaturity, 2);
  //   }

  //   return null;
  // }, [maturityDate, poolRatio, startDate]);

  // const lifetimeYieldFormatted = useMemo(() => {
  //   if (poolRatio !== null) {
  //     return NumberUtils.formatPercentage(poolRatio[0] / poolRatio[1], 2);
  //   }

  //   return null;
  // }, [poolRatio]);

  const principalsPoolRatio = useMemo(() => {
    if (!poolRatio || !poolRatio[0]) {
      return null;
    }
    return NumberUtils.formatPercentage(poolRatio[0]);
  }, [poolRatio]);

  const yieldsPoolRatio = useMemo(() => {
    if (!poolRatio || !poolRatio[1]) {
      return null;
    }
    return NumberUtils.formatPercentage(poolRatio[1]);
  }, [poolRatio]);

  return (
    <div className="tc__aprTooltip">
      <div className="tc__aprTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('futureApr', language)}
        </Typography>
        <Typography variant="card-body-text">{futureAprFormatted}</Typography>
      </div>
      <div className="tc__aprTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('futureYield', language)}
        </Typography>
        <Typography variant="card-body-text">{futureYieldFormatted}</Typography>
      </div>
      <hr />
      {/* <div className="tc__aprTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('lifeTimeApr', language)}
        </Typography>
        <Typography variant="card-body-text">{lifetimeAprFormatted}</Typography>
      </div> */}
      {/* <div className="tc__aprTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('lifeTimeYield', language)}
        </Typography>
        <Typography variant="card-body-text">{lifetimeYieldFormatted}</Typography>
      </div> */}
      <div className="tc__aprTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('poolRatio', language)}
        </Typography>
        <div className="tc__aprPoolRation">
          <Typography variant="fractional">{principalsPoolRatio}</Typography>
          <Typography variant="fractional">{yieldsPoolRatio}</Typography>
        </div>
      </div>
    </div>
  );
};
export default AprTooltip;
