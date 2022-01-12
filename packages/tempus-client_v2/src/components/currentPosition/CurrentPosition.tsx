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
import Spacer from '../spacer/spacer';

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
    return NumberUtils.formatWithMultiplier(
      ethers.utils.formatEther(userPrincipalsBalance.add(lpTokenPrincipalReturnBalance)),
      decimalsForUI,
    );
  }, [decimalsForUI, userPrincipalsBalance, lpTokenPrincipalReturnBalance]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!userYieldsBalance || !lpTokenYieldReturnBalance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(
      ethers.utils.formatEther(userYieldsBalance.add(lpTokenYieldReturnBalance)),
      decimalsForUI,
    );
  }, [decimalsForUI, userYieldsBalance, lpTokenYieldReturnBalance]);

  const unstakedPrincipalsFormatted = useMemo(() => {
    if (!userPrincipalsBalance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(userPrincipalsBalance), decimalsForUI);
  }, [decimalsForUI, userPrincipalsBalance]);

  const stakedPrincipalsFormatted = useMemo(() => {
    if (!lpTokenPrincipalReturnBalance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(lpTokenPrincipalReturnBalance), decimalsForUI);
  }, [decimalsForUI, lpTokenPrincipalReturnBalance]);

  const unstakedYieldsFormatted = useMemo(() => {
    if (!userYieldsBalance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(userYieldsBalance), decimalsForUI);
  }, [decimalsForUI, userYieldsBalance]);

  const stakedYieldsFormatted = useMemo(() => {
    if (!lpTokenYieldReturnBalance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(lpTokenYieldReturnBalance), decimalsForUI);
  }, [decimalsForUI, lpTokenYieldReturnBalance]);

  const unstakedPrincipalsPercentage = useMemo(() => {
    if (!userPrincipalsBalance || !lpTokenPrincipalReturnBalance) {
      return 0;
    }

    if (userPrincipalsBalance.add(lpTokenPrincipalReturnBalance).isZero()) {
      return 0;
    }

    return NumberUtils.formatPercentage(
      ethers.utils.formatEther(div18f(userPrincipalsBalance, userPrincipalsBalance.add(lpTokenPrincipalReturnBalance))),
    );
  }, [userPrincipalsBalance, lpTokenPrincipalReturnBalance]);

  const stakedPrincipalsPercentage = useMemo(() => {
    if (!userPrincipalsBalance || !lpTokenPrincipalReturnBalance) {
      return 0;
    }

    if (lpTokenPrincipalReturnBalance.add(userPrincipalsBalance).isZero()) {
      return 0;
    }

    return NumberUtils.formatPercentage(
      ethers.utils.formatEther(
        div18f(lpTokenPrincipalReturnBalance, lpTokenPrincipalReturnBalance.add(userPrincipalsBalance)),
      ),
    );
  }, [userPrincipalsBalance, lpTokenPrincipalReturnBalance]);

  const unstakedYieldsPercentage = useMemo(() => {
    if (!userYieldsBalance || !lpTokenYieldReturnBalance) {
      return 0;
    }

    if (userYieldsBalance.add(lpTokenYieldReturnBalance).isZero()) {
      return 0;
    }

    return NumberUtils.formatPercentage(
      ethers.utils.formatEther(div18f(userYieldsBalance, userYieldsBalance.add(lpTokenYieldReturnBalance))),
    );
  }, [userYieldsBalance, lpTokenYieldReturnBalance]);

  const stakedYieldsPercentage = useMemo(() => {
    if (!userYieldsBalance || !lpTokenYieldReturnBalance) {
      return 0;
    }

    if (lpTokenYieldReturnBalance.add(userYieldsBalance).isZero()) {
      return 0;
    }

    return NumberUtils.formatPercentage(
      ethers.utils.formatEther(div18f(lpTokenYieldReturnBalance, lpTokenYieldReturnBalance.add(userYieldsBalance))),
    );
  }, [lpTokenYieldReturnBalance, userYieldsBalance]);

  return (
    <div className="tc__currentPosition">
      <Typography variant="card-title">{getText('currentPosition', language)}</Typography>
      <Spacer size={12} />
      <div className="tc__currentPosition-header-row">
        <Typography variant="card-body-text">{getText('principals', language)}</Typography>
        <Typography variant="card-body-text">{principalsBalanceFormatted}</Typography>
      </div>

      <Spacer size={13} />

      <div className="tc__currentPosition-data-row">
        <div className="tc__currentPosition-data-row-label">
          <div className="tc__currentPosition-unstaked-principals-icon" />
          <Typography variant="card-body-text">{getText('unstaked', language)}</Typography>
        </div>

        <div className="tc__currentPosition-data-row-percentage">
          <Typography variant="card-body-text">{unstakedPrincipalsPercentage}</Typography>
        </div>

        <div className="tc__currentPosition-data-row-value">
          <Typography variant="card-body-text">{unstakedPrincipalsFormatted}</Typography>
        </div>
      </div>

      <Spacer size={13} />

      <div className="tc__currentPosition-data-row">
        <div className="tc__currentPosition-data-row-label">
          <div className="tc__currentPosition-staked-principals-icon" />
          <Typography variant="card-body-text">{getText('staked', language)}</Typography>
        </div>

        <div className="tc__currentPosition-data-row-percentage">
          <Typography variant="card-body-text">{stakedPrincipalsPercentage}</Typography>
        </div>

        <div className="tc__currentPosition-data-row-value">
          <Typography variant="card-body-text">{stakedPrincipalsFormatted}</Typography>
        </div>
      </div>

      <Spacer size={20} />

      <div className="tc__currentPosition-header-row">
        <Typography variant="card-body-text">{getText('yields', language)}</Typography>
        <Typography variant="card-body-text">{yieldsBalanceFormatted}</Typography>
      </div>

      <Spacer size={13} />

      <div className="tc__currentPosition-data-row">
        <div className="tc__currentPosition-data-row-label">
          <div className="tc__currentPosition-unstaked-yields-icon" />
          <Typography variant="card-body-text">{getText('unstaked', language)}</Typography>
        </div>

        <div className="tc__currentPosition-data-row-percentage">
          <Typography variant="card-body-text">{unstakedYieldsPercentage}</Typography>
        </div>

        <div className="tc__currentPosition-data-row-value">
          <Typography variant="card-body-text">{unstakedYieldsFormatted}</Typography>
        </div>
      </div>

      <Spacer size={13} />

      <div className="tc__currentPosition-data-row">
        <div className="tc__currentPosition-data-row-label">
          <div className="tc__currentPosition-staked-yields-icon" />
          <Typography variant="card-body-text">{getText('staked', language)}</Typography>
        </div>

        <div className="tc__currentPosition-data-row-percentage">
          <Typography variant="card-body-text">{stakedYieldsPercentage}</Typography>
        </div>

        <div className="tc__currentPosition-data-row-value">
          <Typography variant="card-body-text">{stakedYieldsFormatted}</Typography>
        </div>
      </div>
    </div>
  );
};

export default CurrentPosition;
