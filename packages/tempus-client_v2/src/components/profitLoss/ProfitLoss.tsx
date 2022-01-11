import { ethers, BigNumber } from 'ethers';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { LanguageContext } from '../../context/languageContext';
import { WalletContext } from '../../context/walletContext';
import getText from '../../localisation/getText';
import NumberUtils from '../../services/NumberUtils';
import Spacer from '../spacer/spacer';
import Typography from '../typography/Typography';
import ProfitLossChart from './profitLossChart/ProfitLossChart';

import './ProfitLoss.scss';

const ProfitLoss = () => {
  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { userWalletSigner } = useContext(WalletContext);
  const { language } = useContext(LanguageContext);

  const [estimatedWithdrawAmount, setEstimatedWithdrawAmount] = useState<BigNumber | null>(null);

  const decimalsForUI = staticPoolData[selectedPool.get()].decimalsForUI.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const ticker = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
  const userPrincipalsBalance = dynamicPoolData[selectedPool.get()].userPrincipalsBalance.attach(Downgraded).get();
  const userYieldsBalance = dynamicPoolData[selectedPool.get()].userYieldsBalance.attach(Downgraded).get();
  const userLPTokenBalance = dynamicPoolData[selectedPool.get()].userLPTokenBalance.attach(Downgraded).get();
  const userBalanceUSD = dynamicPoolData[selectedPool.get()].userBalanceUSD.attach(Downgraded).get();

  useEffect(() => {
    if (!userWalletSigner || !userLPTokenBalance || !userPrincipalsBalance || !userYieldsBalance) {
      return;
    }

    const poolDataAdapter = getPoolDataAdapter(userWalletSigner);
    const withdrawStream$ = poolDataAdapter
      .getEstimatedWithdrawAmount(ammAddress, userLPTokenBalance, userPrincipalsBalance, userYieldsBalance, true)
      .subscribe(estimate => {
        if (estimate) {
          setEstimatedWithdrawAmount(estimate.tokenAmount);
        }
      });

    return () => {
      withdrawStream$.unsubscribe();
    };
  }, [userWalletSigner, userPrincipalsBalance, userYieldsBalance, userLPTokenBalance, ammAddress]);

  const estimatedWithdrawAmountFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(estimatedWithdrawAmount), decimalsForUI);
  }, [decimalsForUI, estimatedWithdrawAmount]);

  const liquidationValueFormatted = useMemo(() => {
    if (!userBalanceUSD) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(userBalanceUSD), 2, '$');
  }, [userBalanceUSD]);

  return (
    <div className="tc__profitLoss">
      <Typography variant="card-title">{getText('profitLoss', language)}</Typography>
      <Spacer size={12} />
      <div className="tc__profitLoss__body">
        <div className="tf__flex-row-space-between tc__underline">
          <Typography variant="card-body-text" color="title">
            {getText('currentValue', language)}
          </Typography>
          <div className="tf__flex-row-center-v">
            <Typography variant="card-body-text">{estimatedWithdrawAmountFormatted}</Typography>
            <Spacer size={5} />
            <Typography variant="card-body-text">{ticker}</Typography>
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
