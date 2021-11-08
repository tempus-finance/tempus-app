import { ethers, BigNumber } from 'ethers';
import { useContext, useEffect, useMemo, useState } from 'react';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { LanguageContext } from '../../context/languageContext';
import { getDataForPool, PoolDataContext } from '../../context/poolDataContext';
import { WalletContext } from '../../context/walletContext';
import getText from '../../localisation/getText';
import NumberUtils from '../../services/NumberUtils';
import Spacer from '../spacer/spacer';
import TokenIcon from '../tokenIcon';
import Typography from '../typography/Typography';

import './ProfitLoss.scss';
import ProfitLossChart from './profitLossChart/ProfitLossChart';

const ProfitLoss = () => {
  const { userWalletSigner } = useContext(WalletContext);
  const { language } = useContext(LanguageContext);
  const { poolData, selectedPool } = useContext(PoolDataContext);

  const [estimatedWithdrawAmount, setEstimatedWithdrawAmount] = useState<BigNumber | null>(null);

  const activePoolData = useMemo(() => {
    return getDataForPool(selectedPool, poolData);
  }, [poolData, selectedPool]);

  useEffect(() => {
    const { ammAddress, userLPTokenBalance, userPrincipalsBalance, userYieldsBalance } = activePoolData;

    if (!userWalletSigner || !userLPTokenBalance || !userPrincipalsBalance || !userYieldsBalance) {
      return;
    }

    const poolDataAdapter = getPoolDataAdapter(userWalletSigner);
    const withdrawStream$ = poolDataAdapter
      .getEstimatedWithdrawAmount(ammAddress, userLPTokenBalance, userPrincipalsBalance, userYieldsBalance, true)
      .subscribe(estimate => {
        setEstimatedWithdrawAmount(estimate);
      });

    return () => {
      withdrawStream$.unsubscribe();
    };
  }, [activePoolData, userWalletSigner]);

  const estimatedWithdrawAmountFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatEther(estimatedWithdrawAmount),
      activePoolData.decimalsForUI,
    );
  }, [activePoolData.decimalsForUI, estimatedWithdrawAmount]);

  const liquidationValueFormatted = useMemo(() => {
    if (!activePoolData.userBalanceUSD) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(activePoolData.userBalanceUSD), 2, '$');
  }, [activePoolData]);

  return (
    <div className="tc__profitLoss">
      <Typography variant="card-title">{getText('profitLoss', language)}</Typography>
      <Spacer size={12} />
      <div className="tc__profitLoss__body">
        <div className="tf__flex-row-space-between tc__underline">
          <Typography variant="card-body-text" color="title">
            {getText('liquidationValue', language)}
          </Typography>
          <div className="tf__flex-row-center-v">
            <Typography variant="card-body-text">{estimatedWithdrawAmountFormatted}</Typography>
            <Spacer size={5} />
            <TokenIcon ticker="ETH" width={14} height={14} />
            <Spacer size={10} />
            <Typography variant="card-body-text" color="title">
              ({liquidationValueFormatted})
            </Typography>
          </div>
        </div>
        <ProfitLossChart />
      </div>
    </div>
  );
};

export default ProfitLoss;
