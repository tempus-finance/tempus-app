import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { NumberUtils } from 'tempus-core-services';
import { BigNumber } from '@ethersproject/bignumber';
import { ethers } from 'ethers';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { Chain } from 'tempus-core-services';
import { selectedPoolState, staticPoolDataState } from '../../../state/PoolDataState';
import getPoolDataAdapter from '../../../adapters/getPoolDataAdapter';
import { LocaleContext } from '../../../context/localeContext';
import { WalletContext } from '../../../context/walletContext';
import getText from '../../../localisation/getText';
import Spacer from '../../spacer/spacer';
import Typography from '../../typography/Typography';

import './feesTooltip.scss';

interface FeesTooltipProps {
  chain: Chain;
}

const FeesTooltip: FC<FeesTooltipProps> = ({ chain }) => {
  const selectedPool = useHookState(selectedPoolState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { userWalletSigner } = useContext(WalletContext);
  const { locale } = useContext(LocaleContext);

  const [poolFees, setPoolFees] = useState<BigNumber[] | null>(null);

  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const selectedPoolAddress = selectedPool.attach(Downgraded).get();

  useEffect(() => {
    const fetchPoolFees = async () => {
      if (!userWalletSigner) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);

      setPoolFees(await poolDataAdapter.getPoolFees(selectedPoolAddress, ammAddress));
    };
    fetchPoolFees();
  }, [selectedPoolAddress, ammAddress, userWalletSigner, chain]);

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
      <Typography variant="card-title">{getText('fees', locale)}</Typography>
      <Spacer size={15} />
      <Typography variant="card-body-text">{getText('feesTooltipInfo', locale)}</Typography>
      <Spacer size={15} />
      <div className="tc__feesTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('deposit', locale)}
        </Typography>
        <Typography variant="card-body-text">{depositFeesFormatted}</Typography>
      </div>
      <div className="tc__feesTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('redemption', locale)}
        </Typography>
        <Typography variant="card-body-text">{redemptionFeesFormatted}</Typography>
      </div>
      <div className="tc__feesTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('earlyRedemption', locale)}
        </Typography>
        <Typography variant="card-body-text">{earlyRedemptionFeesFormatted}</Typography>
      </div>
      <div className="tc__feesTooltip-row">
        <Typography variant="card-body-text" color="title">
          {getText('swap', locale)}
        </Typography>
        <Typography variant="card-body-text">{swapFeesFormatted}</Typography>
      </div>
    </div>
  );
};
export default FeesTooltip;
