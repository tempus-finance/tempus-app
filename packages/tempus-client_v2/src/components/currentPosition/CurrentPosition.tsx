import { ethers, BigNumber } from 'ethers';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { WalletContext } from '../../context/walletContext';
import getText from '../../localisation/getText';
import NumberUtils from '../../services/NumberUtils';
import SharedProps from '../../sharedProps';
import { div18f } from '../../utils/weiMath';
import Typography from '../typography/Typography';

import './CurrentPosition.scss';

type CurrentPositionInProps = SharedProps;

const CurrentPosition: FC<CurrentPositionInProps> = ({ language }) => {
  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { userWalletSigner } = useContext(WalletContext);

  const [lpTokenPrincipalReturnBalance, setLpTokenPrincipalReturn] = useState<BigNumber | null>(null);
  const [lpTokenYieldReturnBalance, setLpTokenYieldReturn] = useState<BigNumber | null>(null);

  const userPrincipalsBalance = dynamicPoolData[selectedPool.get()].userPrincipalsBalance.attach(Downgraded).get();
  const userYieldsBalance = dynamicPoolData[selectedPool.get()].userYieldsBalance.attach(Downgraded).get();
  const userLPBalance = dynamicPoolData[selectedPool.get()].userLPTokenBalance.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const decimalsForUI = staticPoolData[selectedPool.get()].decimalsForUI.attach(Downgraded).get();

  useEffect(() => {
    const retrieveExpectedReturn = async () => {
      if (!userWalletSigner) {
        return;
      }

      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);
      if (userLPBalance) {
        try {
          const expectedLPTokenReturn = await poolDataAdapter.getExpectedReturnForLPTokens(ammAddress, userLPBalance);

          setLpTokenPrincipalReturn(expectedLPTokenReturn.principals);
          setLpTokenYieldReturn(expectedLPTokenReturn.yields);
        } catch (error) {
          console.error(
            'Detail User Info - retrieveUserBalances() - Failed to fetch token balances for the user!',
            error,
          );
        }
      }
    };
    retrieveExpectedReturn();
  }, [userWalletSigner, ammAddress, userLPBalance]);

  const principalsBalanceFormatted = useMemo(() => {
    if (!userPrincipalsBalance || !lpTokenPrincipalReturnBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatEther(userPrincipalsBalance.add(lpTokenPrincipalReturnBalance)),
      decimalsForUI,
    );
  }, [decimalsForUI, userPrincipalsBalance, lpTokenPrincipalReturnBalance]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!userYieldsBalance || !lpTokenYieldReturnBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatEther(userYieldsBalance.add(lpTokenYieldReturnBalance)),
      decimalsForUI,
    );
  }, [decimalsForUI, userYieldsBalance, lpTokenYieldReturnBalance]);

  const stakedPrincipalsFormatted = useMemo(() => {
    if (!lpTokenPrincipalReturnBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(lpTokenPrincipalReturnBalance), decimalsForUI);
  }, [decimalsForUI, lpTokenPrincipalReturnBalance]);

  const stakedYieldsFormatted = useMemo(() => {
    if (!lpTokenYieldReturnBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(lpTokenYieldReturnBalance), decimalsForUI);
  }, [decimalsForUI, lpTokenYieldReturnBalance]);

  const totalValue = useMemo(() => {
    if (!userPrincipalsBalance || !userYieldsBalance || !lpTokenPrincipalReturnBalance || !lpTokenYieldReturnBalance) {
      return null;
    }

    return userPrincipalsBalance
      .add(userYieldsBalance)
      .add(lpTokenPrincipalReturnBalance)
      .add(lpTokenYieldReturnBalance);
  }, [userPrincipalsBalance, userYieldsBalance, lpTokenPrincipalReturnBalance, lpTokenYieldReturnBalance]);

  const principalsPercentage = useMemo(() => {
    if (!userPrincipalsBalance || !totalValue) {
      return 0;
    }

    return Number(ethers.utils.formatEther(div18f(userPrincipalsBalance, totalValue))) * 100;
  }, [userPrincipalsBalance, totalValue]);

  const yieldsPercentage = useMemo(() => {
    if (!userYieldsBalance || !totalValue) {
      return 0;
    }

    return Number(ethers.utils.formatEther(div18f(userYieldsBalance, totalValue))) * 100;
  }, [userYieldsBalance, totalValue]);

  const stakedPrincipalsPercentage = useMemo(() => {
    if (!lpTokenPrincipalReturnBalance || !totalValue) {
      return 0;
    }

    return Number(ethers.utils.formatEther(div18f(lpTokenPrincipalReturnBalance, totalValue))) * 100;
  }, [lpTokenPrincipalReturnBalance, totalValue]);

  const stakedYieldsPercentage = useMemo(() => {
    if (!lpTokenYieldReturnBalance || !totalValue) {
      return 0;
    }

    return Number(ethers.utils.formatEther(div18f(lpTokenYieldReturnBalance, totalValue))) * 100;
  }, [lpTokenYieldReturnBalance, totalValue]);

  return (
    <div className="tc__currentPosition">
      <Typography variant="card-title">{getText('currentPosition', language)}</Typography>
      <div className="tc__currentPosition__body">
        <div className="tc__currentPosition__body__bar">
          <div className="tc__currentPosition__body__bar__1" style={{ width: `${principalsPercentage}%` }} />
          <div className="tc__currentPosition__body__bar__2" style={{ width: `${stakedPrincipalsPercentage}%` }} />
          <div className="tc__currentPosition__body__bar__3" style={{ width: `${stakedYieldsPercentage}%` }} />
          <div className="tc__currentPosition__body__bar__4" style={{ width: `${yieldsPercentage}%` }} />
        </div>
        <div className="tc__currentPosition__body__item">
          <div className="tc__currentPosition__body__item__with-icon">
            <div className="tc__currentPosition__icon tc__currentPosition__icon-principals" />
            <Typography variant="card-body-text">{getText('principals', language)}</Typography>
          </div>
          <Typography variant="card-body-text">
            {principalsBalanceFormatted} ({stakedPrincipalsFormatted} {getText('staked', language)})
          </Typography>
        </div>
        <div className="tc__currentPosition__body__item">
          <div className="tc__currentPosition__body__item__with-icon">
            <div className="tc__currentPosition__icon tc__currentPosition__icon-yields" />
            <Typography variant="card-body-text">{getText('yields', language)}</Typography>
          </div>
          <Typography variant="card-body-text">
            {yieldsBalanceFormatted} ({stakedYieldsFormatted} {getText('staked', language)})
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default CurrentPosition;
