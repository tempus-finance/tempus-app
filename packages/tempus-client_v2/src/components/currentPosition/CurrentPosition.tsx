import { ethers, BigNumber } from 'ethers';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { getDataForPool, PoolDataContext } from '../../context/poolData';
import { WalletContext } from '../../context/wallet';
import getText from '../../localisation/getText';
import NumberUtils from '../../services/NumberUtils';
import SharedProps from '../../sharedProps';
import { div18f } from '../../utils/weiMath';
import Typography from '../typography/Typography';
import './CurrentPosition.scss';

type CurrentPositionInProps = SharedProps;

const CurrentPosition: FC<CurrentPositionInProps> = ({ language }) => {
  const { poolData, selectedPool } = useContext(PoolDataContext);
  const { userWalletSigner } = useContext(WalletContext);

  const [lpTokenPrincipalReturnBalance, setLpTokenPrincipalReturn] = useState<BigNumber | null>(null);
  const [lpTokenYieldReturnBalance, setLpTokenYieldReturn] = useState<BigNumber | null>(null);

  const activePoolData = useMemo(() => {
    return getDataForPool(selectedPool, poolData);
  }, [poolData, selectedPool]);

  useEffect(() => {
    const retrieveExpectedReturn = async () => {
      if (!userWalletSigner) {
        return;
      }

      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      if (activePoolData.ammAddress && poolDataAdapter && activePoolData.userLPTokenBalance) {
        try {
          const expectedLPTokenReturn = await poolDataAdapter.getExpectedReturnForLPTokens(
            activePoolData.ammAddress,
            activePoolData.userLPTokenBalance,
          );

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
  }, [userWalletSigner, activePoolData.ammAddress, activePoolData.userLPTokenBalance]);

  const principalsBalanceFormatted = useMemo(() => {
    if (!activePoolData.userPrincipalsBalance || !lpTokenPrincipalReturnBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatEther(activePoolData.userPrincipalsBalance.add(lpTokenPrincipalReturnBalance)),
      activePoolData.decimalsForUI,
    );
  }, [activePoolData.decimalsForUI, activePoolData.userPrincipalsBalance, lpTokenPrincipalReturnBalance]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!activePoolData.userYieldsBalance || !lpTokenYieldReturnBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatEther(activePoolData.userYieldsBalance.add(lpTokenYieldReturnBalance)),
      activePoolData.decimalsForUI,
    );
  }, [activePoolData.decimalsForUI, activePoolData.userYieldsBalance, lpTokenYieldReturnBalance]);

  const stakedPrincipalsFormatted = useMemo(() => {
    if (!lpTokenPrincipalReturnBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatEther(lpTokenPrincipalReturnBalance),
      activePoolData.decimalsForUI,
    );
  }, [activePoolData.decimalsForUI, lpTokenPrincipalReturnBalance]);

  const stakedYieldsFormatted = useMemo(() => {
    if (!lpTokenYieldReturnBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatEther(lpTokenYieldReturnBalance),
      activePoolData.decimalsForUI,
    );
  }, [activePoolData.decimalsForUI, lpTokenYieldReturnBalance]);

  const totalValue = useMemo(() => {
    const { userPrincipalsBalance, userYieldsBalance } = activePoolData;

    if (!userPrincipalsBalance || !userYieldsBalance || !lpTokenPrincipalReturnBalance || !lpTokenYieldReturnBalance) {
      return null;
    }

    return userPrincipalsBalance
      .add(userYieldsBalance)
      .add(lpTokenPrincipalReturnBalance)
      .add(lpTokenYieldReturnBalance);
  }, [activePoolData, lpTokenPrincipalReturnBalance, lpTokenYieldReturnBalance]);

  const principalsPercentage = useMemo(() => {
    if (!activePoolData.userPrincipalsBalance || !totalValue) {
      return 0;
    }

    return Number(ethers.utils.formatEther(div18f(activePoolData.userPrincipalsBalance, totalValue))) * 100;
  }, [activePoolData.userPrincipalsBalance, totalValue]);

  const yieldsPercentage = useMemo(() => {
    if (!activePoolData.userYieldsBalance || !totalValue) {
      return 0;
    }

    return Number(ethers.utils.formatEther(div18f(activePoolData.userYieldsBalance, totalValue))) * 100;
  }, [activePoolData.userYieldsBalance, totalValue]);

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
          <div className="tc__currentPosition__body__bar__3" style={{ width: `${yieldsPercentage}%` }} />
          <div className="tc__currentPosition__body__bar__4" style={{ width: `${stakedYieldsPercentage}%` }} />
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
