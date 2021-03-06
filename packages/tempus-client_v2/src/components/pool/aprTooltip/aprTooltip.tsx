import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { NumberUtils } from 'tempus-core-services';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { Chain } from 'tempus-core-services';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../../state/PoolDataState';
import getPoolDataAdapter from '../../../adapters/getPoolDataAdapter';
import { LocaleContext } from '../../../context/localeContext';
import { WalletContext } from '../../../context/walletContext';
import getText from '../../../localisation/getText';
import Typography from '../../typography/Typography';

import './aprTooltip.scss';

interface AprTooltipProps {
  chain: Chain;
}

const AprTooltip: FC<AprTooltipProps> = ({ chain }) => {
  const selectedPool = useHookState(selectedPoolState);
  const staticPoolData = useHookState(staticPoolDataState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);

  const { userWalletSigner } = useContext(WalletContext);
  const { locale } = useContext(LocaleContext);

  const [poolRatio, setPoolRatio] = useState<number[] | null>(null);

  const fixedAPR = dynamicPoolData[selectedPool.get()].fixedAPR.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const principalsAddress = staticPoolData[selectedPool.get()].principalsAddress.attach(Downgraded).get();
  const yieldsAddress = staticPoolData[selectedPool.get()].yieldsAddress.attach(Downgraded).get();

  useEffect(() => {
    const fetchPoolRation = async () => {
      if (!userWalletSigner) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);

      const { principalsShare, yieldsShare } = await poolDataAdapter.getPoolRatioOfAssets(
        ammAddress,
        principalsAddress,
        yieldsAddress,
      );

      setPoolRatio([principalsShare, yieldsShare]);
    };

    fetchPoolRation();
  }, [ammAddress, principalsAddress, userWalletSigner, yieldsAddress, chain]);

  const futureAprFormatted = useMemo(() => {
    return NumberUtils.formatPercentage(fixedAPR, 2);
  }, [fixedAPR]);

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
          {getText('fixedApr', locale)}
        </Typography>
        <Typography variant="card-body-text">{futureAprFormatted}</Typography>
      </div>
      <hr />
      {/* <div className="tc__aprTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('lifeTimeApr', locale)}
        </Typography>
        <Typography variant="card-body-text">{lifetimeAprFormatted}</Typography>
      </div> */}
      {/* <div className="tc__aprTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('lifeTimeYield', locale)}
        </Typography>
        <Typography variant="card-body-text">{lifetimeYieldFormatted}</Typography>
      </div> */}
      <div className="tc__aprTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('poolRatio', locale)}
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
