import { FC, useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { Divider, Button } from '@material-ui/core';
import { BigNumber, ethers } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Context } from '../../../context';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import NumberUtils from '../../../services/NumberUtils';
import { DashboardRowChild } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import getConfig from '../../../utils/get-config';
import { mul18f } from '../../../utils/wei-math';
import { isZeroString } from '../../../utils/isZeroString';
import getTokenPrecision from '../../../utils/getTokenPrecision';
import Typography from '../../typography/Typography';
import Spacer from '../../spacer/spacer';
import ScaleIcon from '../../icons/ScaleIcon';
import CurrencyInput from '../../currencyInput/currencyInput';
import ActionContainer from '../shared/actionContainer';
import SectionContainer from '../shared/sectionContainer';
import ApproveButton from '../shared/approveButton';
import PlusIconContainer from '../shared/plusIconContainer';
import ExecuteButton from '../shared/executeButton';

import './detailPoolAddLiquidity.scss';

type DetailPoolAddLiquidityInProps = {
  content: DashboardRowChild;
  tempusPool: TempusPool;
  poolDataAdapter: PoolDataAdapter | null;
  signer: JsonRpcSigner | null;
  userWalletAddress: string;
};

type DetailPoolAddLiquidityOutProps = {};

type DetailPoolAddLiquidityProps = DetailPoolAddLiquidityInProps & DetailPoolAddLiquidityOutProps;

const DetailPoolAddLiquidity: FC<DetailPoolAddLiquidityProps> = props => {
  const { content, poolDataAdapter, userWalletAddress, tempusPool } = props;

  const {
    data: { userPrincipalsBalance, userYieldsBalance },
  } = useContext(Context);

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
  const onPrincipalsPercentageChange = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!userPrincipalsBalance) {
        return;
      }
      const percentage = ethers.utils.parseUnits(event.currentTarget.value, principalsPrecision);
      const calculatedAmount = mul18f(userPrincipalsBalance, percentage, principalsPrecision);
      setPrincipalsAmount(ethers.utils.formatUnits(calculatedAmount, principalsPrecision));
      setYieldsFromPrincipals(calculatedAmount);
    },
    [userPrincipalsBalance, principalsPrecision, setYieldsFromPrincipals],
  );

  /**
   * Update yields amount field when user clicks on percentage buttons.
   * - Requires user yields balance to be loaded so we can calculate percentage of that.
   */
  const onYieldsPercentageChange = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!userYieldsBalance) {
        return;
      }
      const percentage = ethers.utils.parseUnits(event.currentTarget.value, yieldsPrecision);
      const calculatedAmount = mul18f(userYieldsBalance, percentage, yieldsPrecision);
      setYieldsAmount(ethers.utils.formatUnits(calculatedAmount, yieldsPrecision));
      setPrincipalsFromYields(calculatedAmount);
    },
    [userYieldsBalance, yieldsPrecision, setPrincipalsFromYields],
  );

  // Calculate pool ratios
  useEffect(() => {
    const getRatioOfAssetsInPool = async () => {
      if (!poolDataAdapter) {
        return;
      }

      const ratios = await poolDataAdapter.getPoolRatioOfAssets(
        tempusPool.ammAddress,
        content.principalTokenAddress,
        content.yieldTokenAddress,
      );

      setPrincipalsPercentage(ratios.principalsShare);
      setYieldsPercentage(ratios.yieldsShare);
    };
    getRatioOfAssetsInPool();
  }, [poolDataAdapter, tempusPool.ammAddress, content.principalTokenAddress, content.yieldTokenAddress]);

  // Fetch estimated LP Token amount
  useEffect(() => {
    const fetchEstimatedLPTokens = async () => {
      if (!poolDataAdapter || !principalsAmount || !yieldsAmount) {
        return;
      }

      try {
        setTokenEstimateInProgress(true);
        setExpectedLPTokens(
          await poolDataAdapter.getExpectedLPTokensForShares(
            tempusPool.ammAddress,
            content.principalTokenAddress,
            content.yieldTokenAddress,
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
    setPrincipalsPrecision(getTokenPrecision(tempusPool.address, 'principals'));
    setYieldsPrecision(getTokenPrecision(tempusPool.address, 'yields'));
    setLpTokensPrecision(getTokenPrecision(tempusPool.address, 'lpTokens'));
    fetchEstimatedLPTokens();
  }, [
    tempusPool.ammAddress,
    tempusPool.address,
    content.principalTokenAddress,
    content.yieldTokenAddress,
    principalsAmount,
    yieldsAmount,
    principalsPrecision,
    yieldsPrecision,
    poolDataAdapter,
    setPrincipalsPrecision,
    setYieldsPrecision,
    setLpTokensPrecision,
  ]);

  // Fetch pool share for amount in
  useEffect(() => {
    const fetchExpectedPoolShare = async () => {
      if (!poolDataAdapter || !expectedLPTokens) {
        return;
      }

      try {
        setPoolShareEstimateInProgress(true);
        setExpectedPoolShare(await poolDataAdapter.getPoolShareForLPTokensIn(tempusPool.ammAddress, expectedLPTokens));
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
  }, [expectedLPTokens, poolDataAdapter, tempusPool.ammAddress]);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (!poolDataAdapter) {
      return Promise.resolve(undefined);
    }

    return poolDataAdapter.provideLiquidity(
      tempusPool.ammAddress,
      userWalletAddress,
      content.principalTokenAddress,
      content.yieldTokenAddress,
      ethers.utils.parseUnits(principalsAmount, principalsPrecision),
      ethers.utils.parseUnits(yieldsAmount, yieldsPrecision),
    );
  }, [
    content.principalTokenAddress,
    content.yieldTokenAddress,
    tempusPool.ammAddress,
    principalsAmount,
    yieldsAmount,
    poolDataAdapter,
    principalsPrecision,
    yieldsPrecision,
    userWalletAddress,
  ]);

  const onExecuted = useCallback(() => {
    setPrincipalsAmount('');
    setYieldsAmount('');
  }, []);

  const principalsBalanceFormatted = useMemo(() => {
    if (!userPrincipalsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userPrincipalsBalance, principalsPrecision),
      tempusPool.decimalsForUI,
    );
  }, [userPrincipalsBalance, principalsPrecision, tempusPool.decimalsForUI]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!userYieldsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userYieldsBalance, yieldsPrecision),
      tempusPool.decimalsForUI,
    );
  }, [userYieldsBalance, yieldsPrecision, tempusPool.decimalsForUI]);

  const expectedLPTokensFormatted = useMemo(() => {
    if (!expectedLPTokens) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(expectedLPTokens, lpTokensPrecision),
      tempusPool.decimalsForUI,
    );
  }, [expectedLPTokens, lpTokensPrecision, tempusPool.decimalsForUI]);

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
    poolShareEstimateInProgress,
    principalsAmount,
    principalsPrecision,
    yieldsPrecision,
    principalsApproved,
    tokenEstimateInProgress,
    userPrincipalsBalance,
    userYieldsBalance,
    yieldsAmount,
    yieldsApproved,
  ]);

  return (
    <>
      {(principalsPercentage !== 0 || yieldsPercentage !== 0) && (
        <SectionContainer>
          <Typography variant="h4">Ratio of Assets</Typography>
          <div className="tf__flex-row-center-vh">
            <Typography variant="body-text">
              {principalsPercentage !== null && NumberUtils.formatPercentage(principalsPercentage, 3)}
            </Typography>
            <Spacer size={20} />
            <div className="tf__flex-column-center-vh">
              <Typography variant="body-text">Principal</Typography>
              <Divider orientation="horizontal" className="tf__full_width" />
              <Typography variant="body-text">Yield</Typography>
            </div>
            <Spacer size={40} />
            <div className="tf__detail__add__liquidity-icon-container">
              <ScaleIcon />
            </div>
            <Spacer size={40} />
            <div className="tf__flex-column-center-vh">
              <Typography variant="body-text">Yield</Typography>
              <Divider orientation="horizontal" className="tf__full_width" />
              <Typography variant="body-text">Principal</Typography>
            </div>
            <Spacer size={20} />
            <Typography variant="body-text">
              {yieldsPercentage !== null && NumberUtils.formatPercentage(yieldsPercentage, 3)}
            </Typography>
          </div>
        </SectionContainer>
      )}
      <Spacer size={15} />
      <ActionContainer label="From">
        <Spacer size={10} />
        <SectionContainer>
          <div className="tf__flex-row-center-v">
            <div className="tf__flex-column-space-between">
              <Typography variant="h4">Principals</Typography>
              <Spacer size={10} />
              <div className="tf__flex-row-center-v">
                <Typography variant="body-text">Amount</Typography>
                <Spacer size={10} />
                <CurrencyInput defaultValue={principalsAmount} onChange={onPrincipalsAmountChange} />
              </div>
            </div>
            <Spacer size={20} />
            <div className="tf__flex-column-space-between">
              {principalsBalanceFormatted && (
                <Typography variant="body-text">Balance {principalsBalanceFormatted}</Typography>
              )}
              <Spacer size={10} />
              <div className="tf__flex-row-center-v">
                <Button variant="contained" size="small" value="0.25" onClick={onPrincipalsPercentageChange}>
                  25%
                </Button>
                <Spacer size={10} />
                <Button variant="contained" size="small" value="0.5" onClick={onPrincipalsPercentageChange}>
                  50%
                </Button>
                <Spacer size={10} />
                <Button variant="contained" size="small" value="0.75" onClick={onPrincipalsPercentageChange}>
                  75%
                </Button>
                <Spacer size={10} />
                <Button variant="contained" size="small" value="1" onClick={onPrincipalsPercentageChange}>
                  Max
                </Button>
              </div>
            </div>
            <Spacer size={20} />
            <div className="tf__flex-column-space-between">
              <ApproveButton
                tokenToApproveTicker="Principals"
                amountToApprove={userPrincipalsBalance}
                onApproveChange={approved => {
                  setPrincipalsApproved(approved);
                }}
                poolDataAdapter={poolDataAdapter}
                spenderAddress={getConfig().vaultContract}
                tokenToApproveAddress={content.principalTokenAddress}
              />
            </div>
          </div>
        </SectionContainer>
        <PlusIconContainer orientation="horizontal" />
        <SectionContainer>
          <div className="tf__flex-row-center-v">
            <div className="tf__flex-column-space-between">
              <Typography variant="h4">Yields</Typography>
              <Spacer size={10} />
              <div className="tf__flex-row-center-v">
                <Typography variant="body-text">Amount</Typography>
                <Spacer size={10} />
                <CurrencyInput defaultValue={yieldsAmount} onChange={onYieldsAmountChange} />
              </div>
            </div>
            <Spacer size={20} />
            <div className="tf__flex-column-space-between">
              {yieldsBalanceFormatted && <Typography variant="body-text">Balance {yieldsBalanceFormatted}</Typography>}
              <Spacer size={10} />
              <div className="tf__flex-row-center-v">
                <Button variant="contained" size="small" value="0.25" onClick={onYieldsPercentageChange}>
                  25%
                </Button>
                <Spacer size={10} />
                <Button variant="contained" size="small" value="0.5" onClick={onYieldsPercentageChange}>
                  50%
                </Button>
                <Spacer size={10} />
                <Button variant="contained" size="small" value="0.75" onClick={onYieldsPercentageChange}>
                  75%
                </Button>
                <Spacer size={10} />
                <Button variant="contained" size="small" value="1" onClick={onYieldsPercentageChange}>
                  Max
                </Button>
              </div>
            </div>
            <Spacer size={20} />
            <div className="tf__flex-column-space-between">
              <ApproveButton
                tokenToApproveTicker="Yields"
                amountToApprove={userYieldsBalance}
                onApproveChange={approved => {
                  setYieldsApproved(approved);
                }}
                poolDataAdapter={poolDataAdapter}
                spenderAddress={getConfig().vaultContract}
                tokenToApproveAddress={content.yieldTokenAddress}
              />
            </div>
          </div>
        </SectionContainer>
      </ActionContainer>
      <Spacer size={20} />
      <ActionContainer label="To">
        <Spacer size={20} />
        <SectionContainer>
          <Typography variant="h4">LP Tokens</Typography>
          <Spacer size={20} />
          <div className="tf__flex-row-space-between">
            <div className="tf__flex-row-center-v">
              <Typography variant="body-text">Estimate:&nbsp;</Typography>
              <Typography variant="h5">{expectedLPTokensFormatted} LP Tokens</Typography>
            </div>
            <Typography variant="body-text">{NumberUtils.formatPercentage(expectedPoolShare)} share of Pool</Typography>
          </div>
        </SectionContainer>
      </ActionContainer>

      <Spacer size={20} />
      <div className="tf__flex-row-center-v">
        <ExecuteButton
          actionName="Liquidity Deposit"
          tempusPool={tempusPool}
          disabled={executeDisabled}
          onExecute={onExecute}
          onExecuted={onExecuted}
        />
      </div>
    </>
  );
};

export default DetailPoolAddLiquidity;
