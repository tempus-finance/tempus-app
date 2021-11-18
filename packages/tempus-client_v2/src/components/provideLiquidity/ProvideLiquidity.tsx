import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { LanguageContext } from '../../context/languageContext';
import { getDataForPool, PoolDataContext } from '../../context/poolDataContext';
import { WalletContext } from '../../context/walletContext';
import getText from '../../localisation/getText';
import getConfig from '../../utils/getConfig';
import { mul18f } from '../../utils/weiMath';
import getTokenPrecision from '../../utils/getTokenPrecision';
import { isZeroString } from '../../utils/isZeroString';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import NumberUtils from '../../services/NumberUtils';
import Typography from '../typography/Typography';
import CurrencyInput from '../currencyInput/currencyInput';
import SectionContainer from '../sectionContainer/SectionContainer';
import PlusIconContainer from '../plusIconContainer/PlusIconContainer';
import Spacer from '../spacer/spacer';
import Approve from '../buttons/Approve';
import Execute from '../buttons/Execute';

import './ProvideLiquidity.scss';

const ProvideLiquidity = () => {
  const { language } = useContext(LanguageContext);
  const { poolData, selectedPool } = useContext(PoolDataContext);
  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);

  const [principalsPercentage, setPrincipalsPercentage] = useState<number | null>(null);
  const [yieldsPercentage, setYieldsPercentage] = useState<number | null>(null);

  const [principalsAmount, setPrincipalsAmount] = useState<string>('');
  const [yieldsAmount, setYieldsAmount] = useState<string>('');

  const [expectedLPTokens, setExpectedLPTokens] = useState<BigNumber | null>(null);
  const [expectedPoolShare, setExpectedPoolShare] = useState<number | null>(null);

  const [tokenEstimateInProgress, setTokenEstimateInProgress] = useState<boolean>(false);
  const [poolShareEstimateInProgress, setPoolShareEstimateInProgress] = useState<boolean>(false);

  const [principalsApproved, setPrincipalsApproved] = useState<boolean>(false);
  const [yieldsApproved, setYieldsApproved] = useState<boolean>(false);

  const [principalsPrecision, setPrincipalsPrecision] = useState<number>(0);
  const [yieldsPrecision, setYieldsPrecision] = useState<number>(0);
  const [lpTokensPrecision, setLpTokensPrecision] = useState<number>(0);

  const activePoolData = useMemo(() => {
    return getDataForPool(selectedPool, poolData);
  }, [poolData, selectedPool]);

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
        (principalsPercentage / yieldsPercentage).toString(),
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
        (yieldsPercentage / principalsPercentage).toString(),
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
      setPrincipalsAmount(amount);
      setYieldsFromPrincipals(ethers.utils.parseUnits(amount || '0', principalsPrecision));
    },
    [principalsPrecision, setYieldsFromPrincipals],
  );

  const onYieldsAmountChange = useCallback(
    (amount: string) => {
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
      !activePoolData.userPrincipalsBalance ||
      !activePoolData.userYieldsBalance ||
      !yieldsPercentage ||
      !principalsPercentage
    ) {
      return;
    }

    const yieldsToPrincipalsRatio = ethers.utils.parseUnits(
      (yieldsPercentage / principalsPercentage).toString(),
      yieldsPrecision,
    );
    const resultingYields = mul18f(activePoolData.userPrincipalsBalance, yieldsToPrincipalsRatio, yieldsPrecision);
    if (resultingYields.gt(activePoolData.userYieldsBalance)) {
      setYieldsAmount(ethers.utils.formatUnits(activePoolData.userYieldsBalance, yieldsPrecision));
      setPrincipalsFromYields(activePoolData.userYieldsBalance);
      return;
    }

    setPrincipalsAmount(ethers.utils.formatUnits(activePoolData.userPrincipalsBalance, principalsPrecision));
    setYieldsFromPrincipals(activePoolData.userPrincipalsBalance);
  }, [
    activePoolData.userPrincipalsBalance,
    activePoolData.userYieldsBalance,
    principalsPercentage,
    principalsPrecision,
    setPrincipalsFromYields,
    setYieldsFromPrincipals,
    yieldsPercentage,
    yieldsPrecision,
  ]);

  /**
   * Update yields amount field when user clicks on percentage buttons.
   * - Requires user yields balance to be loaded so we can calculate percentage of that.
   */
  const onYieldsPercentageChange = useCallback(() => {
    if (
      !activePoolData.userPrincipalsBalance ||
      !activePoolData.userYieldsBalance ||
      !yieldsPercentage ||
      !principalsPercentage
    ) {
      return;
    }

    const principalsToYieldsRatio = ethers.utils.parseUnits(
      (principalsPercentage / yieldsPercentage).toString(),
      principalsPrecision,
    );
    const resultingPrincipals = mul18f(activePoolData.userYieldsBalance, principalsToYieldsRatio, principalsPrecision);
    if (resultingPrincipals.gt(activePoolData.userPrincipalsBalance)) {
      setPrincipalsAmount(ethers.utils.formatUnits(activePoolData.userPrincipalsBalance, principalsPrecision));
      setYieldsFromPrincipals(activePoolData.userPrincipalsBalance);
      return;
    }

    setYieldsAmount(ethers.utils.formatUnits(activePoolData.userYieldsBalance, yieldsPrecision));
    setPrincipalsFromYields(activePoolData.userYieldsBalance);
  }, [
    activePoolData.userPrincipalsBalance,
    activePoolData.userYieldsBalance,
    yieldsPercentage,
    principalsPercentage,
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
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      const ratios = await poolDataAdapter.getPoolRatioOfAssets(
        activePoolData.ammAddress,
        activePoolData.principalsAddress,
        activePoolData.yieldsAddress,
      );

      setPrincipalsPercentage(ratios.principalsShare);
      setYieldsPercentage(ratios.yieldsShare);
    };
    getRatioOfAssetsInPool();
  }, [activePoolData, userWalletSigner]);

  // Fetch estimated LP Token amount
  useEffect(() => {
    const fetchEstimatedLPTokens = async () => {
      if (!userWalletSigner || !principalsAmount || !yieldsAmount) {
        return;
      }

      try {
        const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

        setTokenEstimateInProgress(true);
        setExpectedLPTokens(
          await poolDataAdapter.getExpectedLPTokensForShares(
            activePoolData.ammAddress,
            activePoolData.principalsAddress,
            activePoolData.yieldsAddress,
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
    setPrincipalsPrecision(getTokenPrecision(activePoolData.address, 'principals'));
    setYieldsPrecision(getTokenPrecision(activePoolData.address, 'yields'));
    setLpTokensPrecision(getTokenPrecision(activePoolData.address, 'lpTokens'));
    fetchEstimatedLPTokens();
  }, [
    userWalletSigner,
    activePoolData,
    principalsAmount,
    yieldsAmount,
    principalsPrecision,
    yieldsPrecision,
    setPrincipalsPrecision,
    setYieldsPrecision,
    setLpTokensPrecision,
  ]);

  // Fetch pool share for amount in
  useEffect(() => {
    const fetchExpectedPoolShare = async () => {
      if (!expectedLPTokens || !userWalletSigner) {
        return;
      }

      try {
        const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

        setPoolShareEstimateInProgress(true);
        setExpectedPoolShare(
          await poolDataAdapter.getPoolShareForLPTokensIn(activePoolData.ammAddress, expectedLPTokens),
        );
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
  }, [expectedLPTokens, activePoolData, userWalletSigner]);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (!userWalletSigner) {
      return Promise.resolve(undefined);
    }
    const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

    return poolDataAdapter.provideLiquidity(
      activePoolData.ammAddress,
      userWalletAddress,
      activePoolData.principalsAddress,
      activePoolData.yieldsAddress,
      ethers.utils.parseUnits(principalsAmount, principalsPrecision),
      ethers.utils.parseUnits(yieldsAmount, yieldsPrecision),
    );
  }, [
    userWalletSigner,
    activePoolData,
    userWalletAddress,
    principalsAmount,
    principalsPrecision,
    yieldsAmount,
    yieldsPrecision,
  ]);

  const onExecuted = useCallback(() => {
    setPrincipalsAmount('');
    setYieldsAmount('');
  }, []);

  const principalsBalanceFormatted = useMemo(() => {
    if (!activePoolData.userPrincipalsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(activePoolData.userPrincipalsBalance, principalsPrecision),
      activePoolData.decimalsForUI,
    );
  }, [activePoolData, principalsPrecision]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!activePoolData.userYieldsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(activePoolData.userYieldsBalance, yieldsPrecision),
      activePoolData.decimalsForUI,
    );
  }, [activePoolData, yieldsPrecision]);

  const expectedLPTokensFormatted = useMemo(() => {
    if (!expectedLPTokens) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(expectedLPTokens, lpTokensPrecision),
      activePoolData.decimalsForUI,
    );
  }, [expectedLPTokens, lpTokensPrecision, activePoolData.decimalsForUI]);

  const executeDisabled = useMemo(() => {
    const zeroAmount = isZeroString(principalsAmount) || isZeroString(yieldsAmount);
    const principalBalanceZero = activePoolData.userPrincipalsBalance && activePoolData.userPrincipalsBalance.isZero();
    const yieldsBalanceZero = activePoolData.userYieldsBalance && activePoolData.userYieldsBalance.isZero();
    const principalsAmountExceedsBalance = ethers.utils
      .parseUnits(principalsAmount || '0', principalsPrecision)
      .gt(activePoolData.userPrincipalsBalance || BigNumber.from('0'));
    const yieldsAmountExceedsBalance = ethers.utils
      .parseUnits(yieldsAmount || '0', yieldsPrecision)
      .gt(activePoolData.userYieldsBalance || BigNumber.from('0'));

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
    poolShareEstimateInProgress,
    principalsAmount,
    principalsPrecision,
    yieldsPrecision,
    principalsApproved,
    tokenEstimateInProgress,
    activePoolData,
    yieldsAmount,
    yieldsApproved,
  ]);

  return (
    <div className="tc__provideLiquidity">
      <SectionContainer title="from">
        <SectionContainer elevation={2}>
          <Typography variant="h4">Principals</Typography>
          <Spacer size={15} />
          <div className="tf__flex-row-space-between">
            <div className="tf__flex-row-center-v">
              <CurrencyInput
                defaultValue={principalsAmount}
                onChange={onPrincipalsAmountChange}
                onMaxClick={onPrincipalsPercentageChange}
              />
              <Spacer size={15} />
              {principalsBalanceFormatted && (
                <>
                  <Typography variant="card-body-text">{getText('balance', language)}</Typography>
                  <Spacer size={15} />
                  <Typography variant="card-body-text">{principalsBalanceFormatted}</Typography>
                </>
              )}
            </div>
            <Spacer size={15} />
            <div className="tf__flex-row-center-v-end">
              <Approve
                tokenToApproveTicker="Principals"
                amountToApprove={activePoolData.userPrincipalsBalance}
                onApproveChange={approved => {
                  setPrincipalsApproved(approved);
                }}
                spenderAddress={getConfig().vaultContract}
                tokenToApproveAddress={activePoolData.principalsAddress}
              />
            </div>
          </div>
        </SectionContainer>
        <PlusIconContainer orientation="horizontal" />
        <SectionContainer elevation={2}>
          <Typography variant="h4">Yields</Typography>
          <Spacer size={15} />
          <div className="tf__flex-row-space-between">
            <div className="tf__flex-row-center-v">
              <CurrencyInput
                defaultValue={yieldsAmount}
                onChange={onYieldsAmountChange}
                onMaxClick={onYieldsPercentageChange}
              />
              <Spacer size={15} />
              {yieldsBalanceFormatted && (
                <>
                  <Typography variant="card-body-text">{getText('balance', language)}</Typography>
                  <Spacer size={15} />
                  <Typography variant="card-body-text">{yieldsBalanceFormatted}</Typography>
                </>
              )}
            </div>
            <Spacer size={15} />
            <div className="tf__flex-row-center-v-end">
              <Approve
                tokenToApproveTicker="Yields"
                amountToApprove={activePoolData.userYieldsBalance}
                onApproveChange={approved => {
                  setYieldsApproved(approved);
                }}
                spenderAddress={getConfig().vaultContract}
                tokenToApproveAddress={activePoolData.yieldsAddress}
              />
            </div>
          </div>
        </SectionContainer>
      </SectionContainer>
      <Spacer size={15} />
      <SectionContainer title="to">
        <SectionContainer elevation={2}>
          <Typography variant="h4">{getText('lpTokens', language)}</Typography>
          <Spacer size={10} />
          <div className="tf__flex-row-space-between">
            <div className="tf__flex-row-center-v">
              <Typography variant="card-body-text">{getText('estimatedAmountReceived', language)}</Typography>
              <Spacer size={15} />
              <Typography variant="card-body-text">
                {expectedLPTokensFormatted} {getText('lpTokens', language)}
              </Typography>
            </div>
            <div className="tf__flex-row-center-v-end">
              <Typography variant="card-body-text">
                {NumberUtils.formatPercentage(expectedPoolShare)} {getText('ofPool', language)}
              </Typography>
            </div>
          </div>
        </SectionContainer>
        <Spacer size={15} />
        <div className="tf__flex-row-center-vh">
          <Execute
            actionName="Liquidity Deposit"
            tempusPool={activePoolData}
            disabled={executeDisabled}
            onExecute={onExecute}
            onExecuted={onExecuted}
          />
        </div>
      </SectionContainer>
    </div>
  );
};
export default ProvideLiquidity;
