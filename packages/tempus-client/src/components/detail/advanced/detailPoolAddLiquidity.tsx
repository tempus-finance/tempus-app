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

  const [principalsApproved, setPrincipalsApproved] = useState<boolean>(false);
  const [yieldsApproved, setYieldsApproved] = useState<boolean>(false);

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

      const principalsToYieldsRatio = ethers.utils.parseEther((principalsPercentage / yieldsPercentage).toString());

      setPrincipalsAmount(ethers.utils.formatEther(mul18f(principalsToYieldsRatio, amountOfYields)));
    },
    [principalsPercentage, yieldsPercentage],
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

      const yieldsToPrincipalsRatio = ethers.utils.parseEther((yieldsPercentage / principalsPercentage).toString());

      setYieldsAmount(ethers.utils.formatEther(mul18f(yieldsToPrincipalsRatio, amountOfPrincipals)));
    },
    [principalsPercentage, yieldsPercentage],
  );

  const onPrincipalsAmountChange = useCallback(
    (amount: string) => {
      setPrincipalsAmount(amount);
      setYieldsFromPrincipals(ethers.utils.parseEther(amount || '0'));
    },
    [setYieldsFromPrincipals],
  );

  const onYieldsAmountChange = useCallback(
    (amount: string) => {
      setYieldsAmount(amount);
      setPrincipalsFromYields(ethers.utils.parseEther(amount || '0'));
    },
    [setPrincipalsFromYields],
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
      const percentage = ethers.utils.parseEther(event.currentTarget.value);
      const calculatedAmount = mul18f(userPrincipalsBalance, percentage);
      setPrincipalsAmount(ethers.utils.formatEther(calculatedAmount));
      setYieldsFromPrincipals(calculatedAmount);
    },
    [userPrincipalsBalance, setYieldsFromPrincipals],
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
      const percentage = ethers.utils.parseEther(event.currentTarget.value);
      const calculatedAmount = mul18f(userYieldsBalance, percentage);
      setYieldsAmount(ethers.utils.formatEther(calculatedAmount));
      setPrincipalsFromYields(calculatedAmount);
    },
    [userYieldsBalance, setPrincipalsFromYields],
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
        setExpectedLPTokens(
          await poolDataAdapter.getExpectedLPTokensForShares(
            tempusPool.ammAddress,
            content.principalTokenAddress,
            content.yieldTokenAddress,
            ethers.utils.parseEther(principalsAmount),
            ethers.utils.parseEther(yieldsAmount),
          ),
        );
      } catch (error) {
        console.error(
          'DetailPoolAddLiquidity - fetchEstimatedLPTokens() - Failed to fetch estimated LP Tokens!',
          error,
        );
      }
    };
    fetchEstimatedLPTokens();
  }, [
    tempusPool.ammAddress,
    content.principalTokenAddress,
    content.yieldTokenAddress,
    principalsAmount,
    yieldsAmount,
    poolDataAdapter,
  ]);

  // Fetch pool share for amount in
  useEffect(() => {
    const fetchExpectedPoolShare = async () => {
      if (!poolDataAdapter || !expectedLPTokens) {
        return;
      }

      try {
        setExpectedPoolShare(await poolDataAdapter.getPoolShareForLPTokensIn(tempusPool.ammAddress, expectedLPTokens));
      } catch (error) {
        console.error(
          'DetailPoolAddLiquidity - fetchExpectedPoolShare() - Failed to fetch expected pool share!',
          error,
        );
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
      ethers.utils.parseEther(principalsAmount),
      ethers.utils.parseEther(yieldsAmount),
    );
  }, [
    content.principalTokenAddress,
    content.yieldTokenAddress,
    tempusPool.ammAddress,
    principalsAmount,
    yieldsAmount,
    poolDataAdapter,
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
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(userPrincipalsBalance), tempusPool.decimalsForUI);
  }, [userPrincipalsBalance, tempusPool.decimalsForUI]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!userYieldsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(userYieldsBalance), tempusPool.decimalsForUI);
  }, [userYieldsBalance, tempusPool.decimalsForUI]);

  const expectedLPTokensFormatted = useMemo(() => {
    if (!expectedLPTokens) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(expectedLPTokens), tempusPool.decimalsForUI);
  }, [expectedLPTokens, tempusPool.decimalsForUI]);

  const executeDisabled = useMemo(() => {
    const zeroAmount = isZeroString(principalsAmount) || isZeroString(yieldsAmount);
    const principalBalanceZero = userPrincipalsBalance && userPrincipalsBalance.isZero();
    const yieldsBalanceZero = userYieldsBalance && userYieldsBalance.isZero();
    const principalsAmountExceedsBalance = ethers.utils
      .parseEther(principalsAmount || '0')
      .gt(userPrincipalsBalance || BigNumber.from('0'));
    const yieldsAmountExceedsBalance = ethers.utils
      .parseEther(yieldsAmount || '0')
      .gt(userYieldsBalance || BigNumber.from('0'));

    return (
      (!principalBalanceZero && !principalsApproved) ||
      (!yieldsBalanceZero && !yieldsApproved) ||
      zeroAmount ||
      principalsAmountExceedsBalance ||
      yieldsAmountExceedsBalance
    );
  }, [principalsAmount, principalsApproved, userPrincipalsBalance, userYieldsBalance, yieldsAmount, yieldsApproved]);

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
