import { differenceInDays } from 'date-fns';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useState as useHookState } from '@hookstate/core';
import { selectedPoolState } from '../../../state/PoolDataState';
import getPoolDataAdapter from '../../../adapters/getPoolDataAdapter';
import { getDataForPool, PoolDataContext } from '../../../context/poolDataContext';
import { WalletContext } from '../../../context/walletContext';
import NumberUtils from '../../../services/NumberUtils';
import Typography from '../../typography/Typography';

import './aprTooltip.scss';

const AprTooltip = () => {
  const selectedPool = useHookState(selectedPoolState);

  const { userWalletSigner } = useContext(WalletContext);
  const { poolData } = useContext(PoolDataContext);

  const [poolRatio, setPoolRatio] = useState<number[] | null>(null);

  const activePoolData = useMemo(() => {
    return getDataForPool(selectedPool.get(), poolData);
  }, [poolData, selectedPool]);

  useEffect(() => {
    const fetchPoolRation = async () => {
      if (!userWalletSigner) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      const { principalsShare, yieldsShare } = await poolDataAdapter.getPoolRatioOfAssets(
        activePoolData.ammAddress,
        activePoolData.principalsAddress,
        activePoolData.yieldsAddress,
      );

      setPoolRatio([principalsShare, yieldsShare]);
    };

    fetchPoolRation();
  }, [activePoolData, userWalletSigner]);

  const futureAprFormatted = useMemo(() => {
    if (!activePoolData) {
      return null;
    }
    return NumberUtils.formatPercentage(activePoolData.fixedAPR, 2);
  }, [activePoolData]);

  const futureYieldFormatted = useMemo(() => {
    if (activePoolData && activePoolData.fixedAPR) {
      const daysToMaturity = differenceInDays(activePoolData.maturityDate, activePoolData.startDate);
      const dailyInterest = (activePoolData.fixedAPR || 1) / 365;
      return NumberUtils.formatPercentage(dailyInterest * daysToMaturity, 2);
    }

    return null;
  }, [activePoolData]);

  const lifetimeAprFormatted = useMemo(() => {
    if (activePoolData !== null && poolRatio !== null && poolRatio[0] && poolRatio[1]) {
      const daysToMaturity = differenceInDays(activePoolData.maturityDate, activePoolData.startDate);
      const dailyInterest = poolRatio[0] / poolRatio[1] / 365;
      return NumberUtils.formatPercentage(dailyInterest * daysToMaturity, 2);
    }

    return null;
  }, [poolRatio, activePoolData]);

  const lifetimeYieldFormatted = useMemo(() => {
    if (poolRatio !== null) {
      return NumberUtils.formatPercentage(poolRatio[0] / poolRatio[1], 2);
    }

    return null;
  }, [poolRatio]);

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
          Future APR
        </Typography>
        <Typography variant="card-body-text">{futureAprFormatted}</Typography>
      </div>
      <div className="tc__aprTooltip-row">
        <Typography variant="card-body-text" color="title">
          Future Yield
        </Typography>
        <Typography variant="card-body-text">{futureYieldFormatted}</Typography>
      </div>
      <hr />
      <div className="tc__aprTooltip-row">
        <Typography variant="card-body-text" color="title">
          Lifetime APR
        </Typography>
        <Typography variant="card-body-text">{lifetimeAprFormatted}</Typography>
      </div>
      <div className="tc__aprTooltip-row">
        <Typography variant="card-body-text" color="title">
          Lifetime Yield
        </Typography>
        <Typography variant="card-body-text">{lifetimeYieldFormatted}</Typography>
      </div>
      <div className="tc__aprTooltip-row">
        <Typography variant="card-body-text" color="title">
          Pool Ratio (Principals / Yields)
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
