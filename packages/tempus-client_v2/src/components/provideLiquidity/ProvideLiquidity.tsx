import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { getTokenPrecision, isZeroString, mul18f, NumberUtils } from 'tempus-core-services';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import getPoolShareBalanceProvider from '../../providers/getPoolShareBalanceProvider';
import { refreshBalances } from '../../providers/balanceProviderHelper';
import { LocaleContext } from '../../context/localeContext';
import { WalletContext } from '../../context/walletContext';
import getText from '../../localisation/getText';
import { getChainConfig, getConfig } from '../../utils/getConfig';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { Chain } from '../../interfaces/Chain';
import Typography from '../typography/Typography';
import Descriptor from '../descriptor/Descriptor';
import CurrencyInput from '../currencyInput/currencyInput';
import SectionContainer from '../sectionContainer/SectionContainer';
import PlusIconContainer from '../plusIconContainer/PlusIconContainer';
import Spacer from '../spacer/spacer';
import Approve from '../buttons/Approve';
import Execute from '../buttons/Execute';

import './ProvideLiquidity.scss';

interface ProvideLiquidityProps {
  chain: Chain;
}

const ProvideLiquidity: FC<ProvideLiquidityProps> = props => {
  const { chain } = props;

  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { locale } = useContext(LocaleContext);

  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);

  const [principalsPercentage, setPrincipalsPercentage] = useState<number | null>(null);
  const [yieldsPercentage, setYieldsPercentage] = useState<number | null>(null);

  const [principalsAmount, setPrincipalsAmount] = useState<string>('');
  const [yieldsAmount, setYieldsAmount] = useState<string>('');
  const [maxDisabled, setMaxDisabled] = useState<boolean>(false);

  const [expectedLPTokens, setExpectedLPTokens] = useState<BigNumber | null>(null);
  const [expectedPoolShare, setExpectedPoolShare] = useState<number | null>(null);

  const [tokenEstimateInProgress, setTokenEstimateInProgress] = useState<boolean>(false);
  const [poolShareEstimateInProgress, setPoolShareEstimateInProgress] = useState<boolean>(false);

  const [principalsApproved, setPrincipalsApproved] = useState<boolean>(false);
  const [yieldsApproved, setYieldsApproved] = useState<boolean>(false);

  const [principalsPrecision, setPrincipalsPrecision] = useState<number>(0);
  const [yieldsPrecision, setYieldsPrecision] = useState<number>(0);
  const [lpTokensPrecision, setLpTokensPrecision] = useState<number>(0);

  const selectedPoolAddress = selectedPool.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const principalsAddress = staticPoolData[selectedPool.get()].principalsAddress.attach(Downgraded).get();
  const yieldsAddress = staticPoolData[selectedPool.get()].yieldsAddress.attach(Downgraded).get();
  const decimalsForUI = staticPoolData[selectedPool.get()].decimalsForUI.attach(Downgraded).get();
  const poolId = staticPoolData[selectedPool.get()].poolId.attach(Downgraded).get();
  const userPrincipalsBalance = dynamicPoolData[selectedPool.get()].userPrincipalsBalance.attach(Downgraded).get();
  const userYieldsBalance = dynamicPoolData[selectedPool.get()].userYieldsBalance.attach(Downgraded).get();
  const poolShareBalance = dynamicPoolData[selectedPool.get()].poolShareBalance.attach(Downgraded).get();

  /**
   * When user enters some amount of yields, we need to calculate amount of principals user
   * also needs to deposit in order to keep principals/yields balance in the pool unchanged.
   */
  const setPrincipalsFromYields = useCallback(
    (amountOfYields: BigNumber) => {
      if (!yieldsPercentage || !principalsPercentage) {
        return;
      }
      if (amountOfYields.isZero()) {
        setPrincipalsAmount('');
        return;
      }

      const principalsToYieldsRatio = ethers.utils.parseUnits(
        (principalsPercentage / yieldsPercentage).toFixed(principalsPrecision),
        principalsPrecision,
      );

      setPrincipalsAmount(
        ethers.utils.formatUnits(
          mul18f(principalsToYieldsRatio, amountOfYields, principalsPrecision),
          principalsPrecision,
        ),
      );
    },
    [principalsPercentage, yieldsPercentage, principalsPrecision],
  );

  /**
   * When user enters some amount of principals, we need to calculate amount of yields user
   * also needs to deposit in order to keep principals/yields balance in the pool unchanged.
   */
  const setYieldsFromPrincipals = useCallback(
    (amountOfPrincipals: BigNumber) => {
      if (!yieldsPercentage || !principalsPercentage) {
        return;
      }
      if (amountOfPrincipals.isZero()) {
        setYieldsAmount('');
        return;
      }

      const yieldsToPrincipalsRatio = ethers.utils.parseUnits(
        (yieldsPercentage / principalsPercentage).toFixed(yieldsPrecision),
        yieldsPrecision,
      );

      setYieldsAmount(
        ethers.utils.formatUnits(mul18f(yieldsToPrincipalsRatio, amountOfPrincipals, yieldsPrecision), yieldsPrecision),
      );
    },
    [principalsPercentage, yieldsPercentage, yieldsPrecision],
  );

  const onPrincipalsAmountChange = useCallback(
    (amount: string) => {
      setMaxDisabled(false);
      setPrincipalsAmount(amount);
      setYieldsFromPrincipals(ethers.utils.parseUnits(amount || '0', principalsPrecision));
    },
    [principalsPrecision, setYieldsFromPrincipals],
  );

  const onYieldsAmountChange = useCallback(
    (amount: string) => {
      setMaxDisabled(false);
      setYieldsAmount(amount);
      setPrincipalsFromYields(ethers.utils.parseUnits(amount || '0', yieldsPrecision));
    },
    [yieldsPrecision, setPrincipalsFromYields],
  );

  /**
   * Update principals amount field when user clicks on percentage buttons.
   * - Requires user principals balance to be loaded so we can calculate percentage of that.
   */
  const onPrincipalsPercentageChange = useCallback(() => {
    if (
      !userPrincipalsBalance ||
      !userYieldsBalance ||
      (yieldsPercentage !== 0 && !yieldsPercentage) ||
      (principalsPercentage !== 0 && !principalsPercentage) ||
      !poolShareBalance.principals ||
      !poolShareBalance.yields
    ) {
      return;
    }

    setMaxDisabled(true);
    if (poolShareBalance.principals.isZero() && poolShareBalance.yields.isZero()) {
      setPrincipalsAmount(ethers.utils.formatUnits(userPrincipalsBalance, principalsPrecision));
      setYieldsAmount(ethers.utils.formatUnits(userYieldsBalance, yieldsPrecision));

      return;
    }

    const yieldsToPrincipalsRatio = ethers.utils.parseUnits(
      (yieldsPercentage / principalsPercentage).toFixed(yieldsPrecision),
      yieldsPrecision,
    );
    const resultingYields = mul18f(userPrincipalsBalance, yieldsToPrincipalsRatio, yieldsPrecision);
    if (resultingYields.gt(userYieldsBalance)) {
      setYieldsAmount(ethers.utils.formatUnits(userYieldsBalance, yieldsPrecision));
      setPrincipalsFromYields(userYieldsBalance);
      return;
    }

    setPrincipalsAmount(ethers.utils.formatUnits(userPrincipalsBalance, principalsPrecision));
    setYieldsFromPrincipals(userPrincipalsBalance);
  }, [
    userPrincipalsBalance,
    userYieldsBalance,
    yieldsPercentage,
    principalsPercentage,
    poolShareBalance.principals,
    poolShareBalance.yields,
    yieldsPrecision,
    principalsPrecision,
    setYieldsFromPrincipals,
    setPrincipalsFromYields,
  ]);

  /**
   * Update yields amount field when user clicks on percentage buttons.
   * - Requires user yields balance to be loaded so we can calculate percentage of that.
   */
  const onYieldsPercentageChange = useCallback(() => {
    if (
      !userPrincipalsBalance ||
      !userYieldsBalance ||
      (yieldsPercentage !== 0 && !yieldsPercentage) ||
      (principalsPercentage !== 0 && !principalsPercentage) ||
      !poolShareBalance.principals ||
      !poolShareBalance.yields
    ) {
      return;
    }

    setMaxDisabled(true);
    if (poolShareBalance.principals.isZero() && poolShareBalance.yields.isZero()) {
      setPrincipalsAmount(ethers.utils.formatUnits(userPrincipalsBalance, principalsPrecision));
      setYieldsAmount(ethers.utils.formatUnits(userYieldsBalance, yieldsPrecision));

      return;
    }

    const principalsToYieldsRatio = ethers.utils.parseUnits(
      (principalsPercentage / yieldsPercentage).toFixed(principalsPrecision),
      principalsPrecision,
    );
    const resultingPrincipals = mul18f(userYieldsBalance, principalsToYieldsRatio, principalsPrecision);
    if (resultingPrincipals.gt(userPrincipalsBalance)) {
      setPrincipalsAmount(ethers.utils.formatUnits(userPrincipalsBalance, principalsPrecision));
      setYieldsFromPrincipals(userPrincipalsBalance);
      return;
    }

    setYieldsAmount(ethers.utils.formatUnits(userYieldsBalance, yieldsPrecision));
    setPrincipalsFromYields(userYieldsBalance);
  }, [
    userPrincipalsBalance,
    userYieldsBalance,
    yieldsPercentage,
    principalsPercentage,
    poolShareBalance.principals,
    poolShareBalance.yields,
    principalsPrecision,
    yieldsPrecision,
    setPrincipalsFromYields,
    setYieldsFromPrincipals,
  ]);

  // Calculate pool ratios
  useEffect(() => {
    const getRatioOfAssetsInPool = async () => {
      if (!userWalletSigner) {
        return;
      }
      const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);

      const ratios = await poolDataAdapter.getPoolRatioOfAssets(ammAddress, principalsAddress, yieldsAddress);

      setPrincipalsPercentage(ratios.principalsShare);
      setYieldsPercentage(ratios.yieldsShare);
    };
    getRatioOfAssetsInPool();
  }, [ammAddress, principalsAddress, userWalletSigner, yieldsAddress, chain]);

  // Fetch estimated LP Token amount
  useEffect(() => {
    const fetchEstimatedLPTokens = async () => {
      if (!userWalletSigner || !principalsAmount || !yieldsAmount) {
        return;
      }

      try {
        const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);

        setTokenEstimateInProgress(true);
        setExpectedLPTokens(
          await poolDataAdapter.getExpectedLPTokensForShares(
            ammAddress,
            principalsAddress,
            yieldsAddress,
            ethers.utils.parseUnits(principalsAmount, principalsPrecision),
            ethers.utils.parseUnits(yieldsAmount, yieldsPrecision),
          ),
        );
        setTokenEstimateInProgress(false);
      } catch (error) {
        console.error(
          'DetailPoolAddLiquidity - fetchEstimatedLPTokens() - Failed to fetch estimated LP Tokens!',
          error,
        );
        setTokenEstimateInProgress(false);
      }
    };
    const config = getConfig();

    setPrincipalsPrecision(getTokenPrecision(selectedPoolAddress, 'principals', config));
    setYieldsPrecision(getTokenPrecision(selectedPoolAddress, 'yields', config));
    setLpTokensPrecision(getTokenPrecision(selectedPoolAddress, 'lpTokens', config));
    fetchEstimatedLPTokens();
  }, [
    userWalletSigner,
    selectedPoolAddress,
    principalsAmount,
    yieldsAmount,
    principalsPrecision,
    yieldsPrecision,
    setPrincipalsPrecision,
    setYieldsPrecision,
    setLpTokensPrecision,
    ammAddress,
    principalsAddress,
    yieldsAddress,
    chain,
  ]);

  // Fetch pool share for amount in
  useEffect(() => {
    const fetchExpectedPoolShare = async () => {
      if (!expectedLPTokens || !userWalletSigner) {
        return;
      }

      try {
        const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);

        setPoolShareEstimateInProgress(true);
        setExpectedPoolShare(await poolDataAdapter.getPoolShareForLPTokensIn(ammAddress, expectedLPTokens));
        setPoolShareEstimateInProgress(false);
      } catch (error) {
        console.error(
          'DetailPoolAddLiquidity - fetchExpectedPoolShare() - Failed to fetch expected pool share!',
          error,
        );
        setPoolShareEstimateInProgress(false);
      }
    };
    fetchExpectedPoolShare();
  }, [expectedLPTokens, userWalletSigner, ammAddress, chain]);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (!userWalletSigner) {
      return Promise.resolve(undefined);
    }
    const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);

    return poolDataAdapter.provideLiquidity(
      ammAddress,
      userWalletAddress,
      principalsAddress,
      yieldsAddress,
      ethers.utils.parseUnits(principalsAmount, principalsPrecision),
      ethers.utils.parseUnits(yieldsAmount, yieldsPrecision),
    );
  }, [
    userWalletSigner,
    ammAddress,
    userWalletAddress,
    principalsAddress,
    yieldsAddress,
    principalsAmount,
    principalsPrecision,
    yieldsAmount,
    yieldsPrecision,
    chain,
  ]);

  const principalsAmountToApprove = useMemo(() => {
    if (!principalsAmount) {
      return null;
    }

    return ethers.utils.parseUnits(principalsAmount, getTokenPrecision(selectedPoolAddress, 'principals', getConfig()));
  }, [selectedPoolAddress, principalsAmount]);

  const yieldsAmountToApprove = useMemo(() => {
    if (!yieldsAmount) {
      return null;
    }

    return ethers.utils.parseUnits(yieldsAmount, getTokenPrecision(selectedPoolAddress, 'yields', getConfig()));
  }, [selectedPoolAddress, yieldsAmount]);

  const onExecuted = useCallback(
    (successful: boolean, txBlockNumber?: number) => {
      setPrincipalsAmount('');
      setYieldsAmount('');
      setMaxDisabled(false);

      if (!userWalletSigner) {
        return;
      }
      refreshBalances(
        {
          chain,
          userWalletAddress,
          userWalletSigner,
        },
        selectedPoolAddress,
        txBlockNumber,
      );

      // Trigger pool share balance update when execute is finished
      getPoolShareBalanceProvider({
        chain,
        userWalletSigner,
      }).fetchForPoolWithId(poolId, txBlockNumber);
    },
    [poolId, selectedPoolAddress, userWalletAddress, userWalletSigner, chain],
  );

  const principalsBalanceFormatted = useMemo(() => {
    if (!userPrincipalsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userPrincipalsBalance, principalsPrecision),
      decimalsForUI,
      true,
    );
  }, [decimalsForUI, principalsPrecision, userPrincipalsBalance]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!userYieldsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userYieldsBalance, yieldsPrecision),
      decimalsForUI,
      true,
    );
  }, [userYieldsBalance, yieldsPrecision, decimalsForUI]);

  const expectedLPTokensFormatted = useMemo(() => {
    if (!expectedLPTokens) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(expectedLPTokens, lpTokensPrecision),
      decimalsForUI,
      true,
    );
  }, [expectedLPTokens, lpTokensPrecision, decimalsForUI]);

  const executeDisabled = useMemo(() => {
    const zeroAmount = isZeroString(principalsAmount) || isZeroString(yieldsAmount);
    const principalBalanceZero = userPrincipalsBalance && userPrincipalsBalance.isZero();
    const yieldsBalanceZero = userYieldsBalance && userYieldsBalance.isZero();
    const principalsAmountExceedsBalance = ethers.utils
      .parseUnits(principalsAmount || '0', principalsPrecision)
      .gt(userPrincipalsBalance || BigNumber.from('0'));
    const yieldsAmountExceedsBalance = ethers.utils
      .parseUnits(yieldsAmount || '0', yieldsPrecision)
      .gt(userYieldsBalance || BigNumber.from('0'));

    return (
      (!principalBalanceZero && !principalsApproved) ||
      (!yieldsBalanceZero && !yieldsApproved) ||
      zeroAmount ||
      principalsAmountExceedsBalance ||
      yieldsAmountExceedsBalance ||
      tokenEstimateInProgress ||
      poolShareEstimateInProgress
    );
  }, [
    principalsAmount,
    yieldsAmount,
    userPrincipalsBalance,
    userYieldsBalance,
    principalsPrecision,
    yieldsPrecision,
    principalsApproved,
    yieldsApproved,
    tokenEstimateInProgress,
    poolShareEstimateInProgress,
  ]);

  return (
    <div className="tc__provideLiquidity">
      <Descriptor>{getText('provideLiquidityDescription', locale)}</Descriptor>
      <SectionContainer title="from">
        <SectionContainer elevation={2}>
          <div className="tc__title-and-balance">
            <Typography variant="h4">{getText('principals', locale)}</Typography>
            {principalsBalanceFormatted && (
              <div>
                <Typography variant="card-body-text">{getText('balance', locale)}</Typography>
                <Spacer size={15} />
                <Typography variant="card-body-text">{principalsBalanceFormatted}</Typography>
              </div>
            )}
          </div>
          <Spacer size={15} />
          <div className="tf__flex-row-space-between">
            <div className="tf__flex-row-center-v">
              <CurrencyInput
                defaultValue={principalsAmount}
                precision={principalsPrecision}
                onChange={onPrincipalsAmountChange}
                maxDisabled={maxDisabled}
                onMaxClick={onPrincipalsPercentageChange}
              />
              <Spacer size={15} />
            </div>
            <Spacer size={15} />
            <div className="tf__flex-row-center-v-end">
              <Approve
                tokenToApproveTicker="Principals"
                amountToApprove={principalsAmountToApprove}
                userBalance={userPrincipalsBalance}
                onApproveChange={approved => {
                  setPrincipalsApproved(approved);
                }}
                spenderAddress={getChainConfig(chain).vaultContract}
                tokenToApproveAddress={principalsAddress}
                chain={chain}
              />
            </div>
          </div>
        </SectionContainer>
        <PlusIconContainer orientation="horizontal" />
        <SectionContainer elevation={2}>
          <div className="tc__title-and-balance">
            <Typography variant="h4">Yields</Typography>
            <div>
              {yieldsBalanceFormatted && (
                <>
                  <Typography variant="card-body-text">{getText('balance', locale)}</Typography>
                  <Spacer size={15} />
                  <Typography variant="card-body-text">{yieldsBalanceFormatted}</Typography>
                </>
              )}
            </div>
          </div>
          <Spacer size={15} />
          <div className="tf__flex-row-space-between">
            <div className="tf__flex-row-center-v">
              <CurrencyInput
                defaultValue={yieldsAmount}
                precision={yieldsPrecision}
                onChange={onYieldsAmountChange}
                maxDisabled={maxDisabled}
                onMaxClick={onYieldsPercentageChange}
              />
              <Spacer size={15} />
            </div>
            <Spacer size={15} />
            <div className="tf__flex-row-center-v-end">
              <Approve
                tokenToApproveTicker="Yields"
                amountToApprove={yieldsAmountToApprove}
                userBalance={userYieldsBalance}
                onApproveChange={approved => {
                  setYieldsApproved(approved);
                }}
                spenderAddress={getChainConfig(chain).vaultContract}
                tokenToApproveAddress={yieldsAddress}
                chain={chain}
              />
            </div>
          </div>
        </SectionContainer>
      </SectionContainer>
      <Spacer size={15} />
      <SectionContainer title="to">
        <SectionContainer elevation={2}>
          <Typography variant="h4">{getText('lpTokens', locale)}</Typography>
          <Spacer size={10} />
          <div className="tf__flex-row-space-between">
            <div className="tf__flex-row-center-v">
              <Typography variant="card-body-text">{getText('estimatedAmountReceived', locale)}</Typography>
              <Spacer size={15} />
              <Typography variant="card-body-text">
                {getText('xxxLpTokens', locale, { token: expectedLPTokensFormatted })}
              </Typography>
            </div>
            <div className="tf__flex-row-center-v-end">
              <Typography variant="card-body-text">
                {getText('xxxOfPool', locale, { share: NumberUtils.formatPercentage(expectedPoolShare) })}
              </Typography>
            </div>
          </div>
        </SectionContainer>
        <Spacer size={15} />
        <div className="tf__flex-row-center-vh">
          <Execute
            actionName="Liquidity Deposit"
            disabled={executeDisabled}
            chain={chain}
            onExecute={onExecute}
            onExecuted={onExecuted}
          />
        </div>
      </SectionContainer>
    </div>
  );
};
export default ProvideLiquidity;
