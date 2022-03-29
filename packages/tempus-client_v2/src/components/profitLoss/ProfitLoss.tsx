import { ethers, BigNumber } from 'ethers';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { NumberUtils } from 'tempus-core-services';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { Chain } from 'tempus-core-services';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { LocaleContext } from '../../context/localeContext';
import { WalletContext } from '../../context/walletContext';
import getText from '../../localisation/getText';
import Spacer from '../spacer/spacer';
import Typography from '../typography/Typography';
import ProfitLossChart from './profitLossChart/ProfitLossChart';

import './ProfitLoss.scss';

interface ProfitLossProps {
  chain: Chain;
}

const ProfitLoss: FC<ProfitLossProps> = ({ chain }) => {
  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { userWalletSigner } = useContext(WalletContext);
  const { locale } = useContext(LocaleContext);

  const [estimatedWithdrawAmount, setEstimatedWithdrawAmount] = useState<BigNumber | null>(null);

  const selectedPoolAddress = selectedPool.attach(Downgraded).get();
  const decimalsForUI = staticPoolData[selectedPool.get()].decimalsForUI.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const ticker = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
  const tokenPrecision = staticPoolData[selectedPool.get()].tokenPrecision.attach(Downgraded).get();
  const userPrincipalsBalance = dynamicPoolData[selectedPool.get()].userPrincipalsBalance.attach(Downgraded).get();
  const userYieldsBalance = dynamicPoolData[selectedPool.get()].userYieldsBalance.attach(Downgraded).get();
  const userLPTokenBalance = dynamicPoolData[selectedPool.get()].userLPTokenBalance.attach(Downgraded).get();
  const userBalanceUSD = dynamicPoolData[selectedPool.get()].userBalanceUSD.attach(Downgraded).get();

  useEffect(() => {
    if (!userWalletSigner || !userLPTokenBalance || !userPrincipalsBalance || !userYieldsBalance) {
      return;
    }

    const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);
    const withdrawStream$ = poolDataAdapter
      .getEstimatedWithdrawAmount(
        selectedPoolAddress,
        ammAddress,
        userLPTokenBalance,
        userPrincipalsBalance,
        userYieldsBalance,
        true,
      )
      .subscribe(estimate => {
        if (estimate) {
          setEstimatedWithdrawAmount(estimate.tokenAmount);
        }
      });

    return () => {
      withdrawStream$.unsubscribe();
    };
  }, [
    userWalletSigner,
    userPrincipalsBalance,
    userYieldsBalance,
    userLPTokenBalance,
    ammAddress,
    selectedPoolAddress,
    chain,
  ]);

  const estimatedWithdrawAmountFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(estimatedWithdrawAmount, tokenPrecision.backingToken),
      decimalsForUI,
    );
  }, [decimalsForUI, estimatedWithdrawAmount, tokenPrecision.backingToken]);

  const liquidationValueFormatted = useMemo(() => {
    if (!userBalanceUSD) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(userBalanceUSD, tokenPrecision.backingToken), 2, '$');
  }, [userBalanceUSD, tokenPrecision.backingToken]);

  return (
    <div className="tc__profitLoss">
      <Typography variant="card-title">{getText('profitLoss', locale)}</Typography>
      <Spacer size={12} />
      <div className="tc__profitLoss__body">
        <div className="tf__flex-row-space-between tc__underline">
          <Typography variant="card-body-text" color="title">
            {getText('currentValue', locale)}
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
        <ProfitLossChart chain={chain} />
      </div>
    </div>
  );
};

export default ProfitLoss;
