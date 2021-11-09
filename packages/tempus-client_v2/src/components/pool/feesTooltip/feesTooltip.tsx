import { BigNumber } from '@ethersproject/bignumber';
import { ethers } from 'ethers';
import { useContext, useEffect, useMemo, useState } from 'react';
import getPoolDataAdapter from '../../../adapters/getPoolDataAdapter';
import { LanguageContext } from '../../../context/languageContext';
import { getDataForPool, PoolDataContext } from '../../../context/poolDataContext';
import { WalletContext } from '../../../context/walletContext';
import getText from '../../../localisation/getText';
import NumberUtils from '../../../services/NumberUtils';
import Spacer from '../../spacer/spacer';
import Typography from '../../typography/Typography';

import './feesTooltip.scss';

const FeesTooltip = () => {
  const { userWalletSigner } = useContext(WalletContext);
  const { language } = useContext(LanguageContext);
  const { poolData, selectedPool } = useContext(PoolDataContext);

  const [poolFees, setPoolFees] = useState<BigNumber[] | null>(null);

  const activePoolData = useMemo(() => {
    return getDataForPool(selectedPool, poolData);
  }, [poolData, selectedPool]);

  useEffect(() => {
    const fetchPoolFees = async () => {
      if (!userWalletSigner) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      setPoolFees(await poolDataAdapter.getPoolFees(activePoolData.address, activePoolData.ammAddress));
    };
    fetchPoolFees();
  }, [activePoolData.address, activePoolData.ammAddress, userWalletSigner]);

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
      <Typography variant="card-title">Fees</Typography>
      <Spacer size={15} />
      <Typography variant="card-body-text">{getText('feesTooltipInfo', language)}</Typography>
      <Spacer size={15} />
      <div className="tc__feesTooltip-row">
        <Typography variant="card-body-text" color="title">
          Deposit
        </Typography>
        <Typography variant="card-body-text">{depositFeesFormatted}</Typography>
      </div>
      <div className="tc__feesTooltip-row">
        <Typography variant="card-body-text" color="title">
          Redemption
        </Typography>
        <Typography variant="card-body-text">{redemptionFeesFormatted}</Typography>
      </div>
      <div className="tc__feesTooltip-row">
        <Typography variant="card-body-text" color="title">
          Early Redemption
        </Typography>
        <Typography variant="card-body-text">{earlyRedemptionFeesFormatted}</Typography>
      </div>
      <div className="tc__feesTooltip-row">
        <Typography variant="card-body-text" color="title">
          Swap
        </Typography>
        <Typography variant="card-body-text">{swapFeesFormatted}</Typography>
      </div>
    </div>
  );
};
export default FeesTooltip;
