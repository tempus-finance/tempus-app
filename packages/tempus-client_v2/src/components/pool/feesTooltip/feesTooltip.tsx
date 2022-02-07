import { useContext, useEffect, useMemo, useState } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { ethers } from 'ethers';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { selectedPoolState, staticPoolDataState } from '../../../state/PoolDataState';
import getPoolDataAdapter from '../../../adapters/getPoolDataAdapter';
import { LanguageContext } from '../../../context/languageContext';
import { WalletContext } from '../../../context/walletContext';
import getText from '../../../localisation/getText';
import NumberUtils from '../../../services/NumberUtils';
import Spacer from '../../spacer/spacer';
import Typography from '../../typography/Typography';

import './feesTooltip.scss';

const FeesTooltip = () => {
  const selectedPool = useHookState(selectedPoolState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { userWalletSigner } = useContext(WalletContext);
  const { language } = useContext(LanguageContext);

  const [poolFees, setPoolFees] = useState<BigNumber[] | null>(null);

  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const selectedPoolAddress = selectedPool.attach(Downgraded).get();

  useEffect(() => {
    const fetchPoolFees = async () => {
      if (!userWalletSigner) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      setPoolFees(await poolDataAdapter.getPoolFees(selectedPoolAddress, ammAddress));
    };
    fetchPoolFees();
  }, [selectedPoolAddress, ammAddress, userWalletSigner]);

  const depositFeesFormatted = useMemo(() => {
    if (!poolFees || !poolFees[0]) {
      return null;
    }
    return NumberUtils.formatPercentage(Number(ethers.utils.formatEther(poolFees[0])));
  }, [poolFees]);

  const redemptionFeesFormatted = useMemo(() => {
    if (!poolFees || !poolFees[2]) {
      return null;
    }
    return NumberUtils.formatPercentage(Number(ethers.utils.formatEther(poolFees[2])));
  }, [poolFees]);

  const earlyRedemptionFeesFormatted = useMemo(() => {
    if (!poolFees || !poolFees[1]) {
      return null;
    }
    return NumberUtils.formatPercentage(Number(ethers.utils.formatEther(poolFees[1])));
  }, [poolFees]);

  const swapFeesFormatted = useMemo(() => {
    if (!poolFees || !poolFees[3]) {
      return null;
    }
    return NumberUtils.formatPercentage(Number(ethers.utils.formatEther(poolFees[3])));
  }, [poolFees]);

  return (
    <div className="tc__feesTooltip">
      <Typography variant="card-title">{getText('fees', language)}</Typography>
      <Spacer size={15} />
      <Typography variant="card-body-text">{getText('feesTooltipInfo', language)}</Typography>
      <Spacer size={15} />
      <div className="tc__feesTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('deposit', language)}
        </Typography>
        <Typography variant="card-body-text">{depositFeesFormatted}</Typography>
      </div>
      <div className="tc__feesTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('redemption', language)}
        </Typography>
        <Typography variant="card-body-text">{redemptionFeesFormatted}</Typography>
      </div>
      <div className="tc__feesTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('earlyRedemption', language)}
        </Typography>
        <Typography variant="card-body-text">{earlyRedemptionFeesFormatted}</Typography>
      </div>
      <div className="tc__feesTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('swap', language)}
        </Typography>
        <Typography variant="card-body-text">{swapFeesFormatted}</Typography>
      </div>
    </div>
  );
};
export default FeesTooltip;
