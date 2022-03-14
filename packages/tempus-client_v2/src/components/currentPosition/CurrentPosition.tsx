import { ethers, BigNumber } from 'ethers';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import { Chain } from '../../interfaces/Chain';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { WalletContext } from '../../context/walletContext';
import getText from '../../localisation/getText';
import NumberUtils from '../../services/NumberUtils';
import SharedProps from '../../sharedProps';
import { div18f } from '../../utils/weiMath';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';

import './CurrentPosition.scss';

type CurrentPositionInProps = {
  chain: Chain;
};

type CurrentPositionProps = SharedProps & CurrentPositionInProps;

const CurrentPosition: FC<CurrentPositionProps> = ({ chain, language }) => {
  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { userWalletSigner } = useContext(WalletContext);

  const [lpTokenPrincipalReturnBalance, setLpTokenPrincipalReturn] = useState<BigNumber | null>(null);
  const [lpTokenYieldReturnBalance, setLpTokenYieldReturn] = useState<BigNumber | null>(null);

  const userPrincipalsBalance = dynamicPoolData[selectedPool.get()].userPrincipalsBalance.attach(Downgraded).get();
  const userYieldsBalance = dynamicPoolData[selectedPool.get()].userYieldsBalance.attach(Downgraded).get();
  const userLPBalance = dynamicPoolData[selectedPool.get()].userLPTokenBalance.attach(Downgraded).get();
  const backingToken = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const decimalsForUI = staticPoolData[selectedPool.get()].decimalsForUI.attach(Downgraded).get();
  const tokenPrecision = staticPoolData[selectedPool.get()].tokenPrecision.attach(Downgraded).get();

  useEffect(() => {
    const retrieveExpectedReturn = async () => {
      if (!userWalletSigner) {
        return;
      }

      const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);
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
  }, [userWalletSigner, ammAddress, userLPBalance, chain]);

  const principalsBalanceFormatted = useMemo(() => {
    if (!userPrincipalsBalance || !lpTokenPrincipalReturnBalance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(
      ethers.utils.formatUnits(userPrincipalsBalance.add(lpTokenPrincipalReturnBalance), tokenPrecision.principals),
      decimalsForUI,
    );
  }, [decimalsForUI, userPrincipalsBalance, lpTokenPrincipalReturnBalance, tokenPrecision.principals]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!userYieldsBalance || !lpTokenYieldReturnBalance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(
      ethers.utils.formatUnits(userYieldsBalance.add(lpTokenYieldReturnBalance), tokenPrecision.yields),
      decimalsForUI,
    );
  }, [decimalsForUI, userYieldsBalance, lpTokenYieldReturnBalance, tokenPrecision.yields]);

  const unstakedPrincipalsFormatted = useMemo(() => {
    if (!userPrincipalsBalance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(
      ethers.utils.formatUnits(userPrincipalsBalance, tokenPrecision.principals),
      decimalsForUI,
    );
  }, [decimalsForUI, userPrincipalsBalance, tokenPrecision.principals]);

  const stakedPrincipalsFormatted = useMemo(() => {
    if (!lpTokenPrincipalReturnBalance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(
      ethers.utils.formatUnits(lpTokenPrincipalReturnBalance, tokenPrecision.principals),
      decimalsForUI,
    );
  }, [decimalsForUI, lpTokenPrincipalReturnBalance, tokenPrecision.principals]);

  const unstakedYieldsFormatted = useMemo(() => {
    if (!userYieldsBalance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(
      ethers.utils.formatUnits(userYieldsBalance, tokenPrecision.yields),
      decimalsForUI,
    );
  }, [decimalsForUI, userYieldsBalance, tokenPrecision.yields]);

  const stakedYieldsFormatted = useMemo(() => {
    if (!lpTokenYieldReturnBalance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(
      ethers.utils.formatUnits(lpTokenYieldReturnBalance, tokenPrecision.yields),
      decimalsForUI,
    );
  }, [decimalsForUI, lpTokenYieldReturnBalance, tokenPrecision.yields]);

  const unstakedPrincipalsPercentage = useMemo(() => {
    if (!userPrincipalsBalance || !lpTokenPrincipalReturnBalance) {
      return NumberUtils.formatPercentage('0', 0);
    }

    if (userPrincipalsBalance.add(lpTokenPrincipalReturnBalance).isZero()) {
      return NumberUtils.formatPercentage('0', 0);
    }

    return NumberUtils.formatPercentage(
      ethers.utils.formatUnits(
        div18f(
          userPrincipalsBalance,
          userPrincipalsBalance.add(lpTokenPrincipalReturnBalance),
          tokenPrecision.principals,
        ),
        tokenPrecision.principals,
      ),
    );
  }, [userPrincipalsBalance, lpTokenPrincipalReturnBalance, tokenPrecision.principals]);

  const stakedPrincipalsPercentage = useMemo(() => {
    if (!userPrincipalsBalance || !lpTokenPrincipalReturnBalance) {
      return NumberUtils.formatPercentage('0', 0);
    }

    if (lpTokenPrincipalReturnBalance.add(userPrincipalsBalance).isZero()) {
      return NumberUtils.formatPercentage('0', 0);
    }

    return NumberUtils.formatPercentage(
      ethers.utils.formatUnits(
        div18f(
          lpTokenPrincipalReturnBalance,
          lpTokenPrincipalReturnBalance.add(userPrincipalsBalance),
          tokenPrecision.principals,
        ),
        tokenPrecision.principals,
      ),
    );
  }, [userPrincipalsBalance, lpTokenPrincipalReturnBalance, tokenPrecision.principals]);

  const unstakedYieldsPercentage = useMemo(() => {
    if (!userYieldsBalance || !lpTokenYieldReturnBalance) {
      return NumberUtils.formatPercentage('0', 0);
    }

    if (userYieldsBalance.add(lpTokenYieldReturnBalance).isZero()) {
      return NumberUtils.formatPercentage('0', 0);
    }

    return NumberUtils.formatPercentage(
      ethers.utils.formatUnits(
        div18f(userYieldsBalance, userYieldsBalance.add(lpTokenYieldReturnBalance), tokenPrecision.yields),
        tokenPrecision.yields,
      ),
    );
  }, [userYieldsBalance, lpTokenYieldReturnBalance, tokenPrecision.yields]);

  const stakedYieldsPercentage = useMemo(() => {
    if (!userYieldsBalance || !lpTokenYieldReturnBalance) {
      return NumberUtils.formatPercentage('0', 0);
    }

    if (lpTokenYieldReturnBalance.add(userYieldsBalance).isZero()) {
      return NumberUtils.formatPercentage('0', 0);
    }

    return NumberUtils.formatPercentage(
      ethers.utils.formatUnits(
        div18f(lpTokenYieldReturnBalance, lpTokenYieldReturnBalance.add(userYieldsBalance), tokenPrecision.yields),
        tokenPrecision.yields,
      ),
    );
  }, [lpTokenYieldReturnBalance, userYieldsBalance, tokenPrecision.yields]);

  return (
    <div className="tc__currentPosition">
      <Typography variant="card-title">{getText('currentPosition', language)}</Typography>
      <Spacer size={12} />
      <div className="tc__currentPosition-header-row">
        <Typography variant="card-body-text">{getText('xxxPrincipals', language, { token: backingToken })}</Typography>
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
        <Typography variant="card-body-text">{getText('xxxYields', language, { token: backingToken })}</Typography>
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
