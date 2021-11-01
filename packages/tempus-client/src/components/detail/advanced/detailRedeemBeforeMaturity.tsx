import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { combineLatest } from 'rxjs';
import { BigNumber, ethers } from 'ethers';
import { Divider, Button } from '@material-ui/core';
import { Context } from '../../../context';
import { Ticker } from '../../../interfaces/Token';
import { DashboardRowChild } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import NumberUtils from '../../../services/NumberUtils';
import { isZeroString } from '../../../utils/isZeroString';
import getConfig from '../../../utils/get-config';
import { mul18f } from '../../../utils/wei-math';
import getTokenPrecision from '../../../utils/getTokenPrecision';
import CurrencyInput from '../../currencyInput/currencyInput';
import TokenSelector from '../../tokenSelector';
import Typography from '../../typography/Typography';
import Spacer from '../../spacer/spacer';
import ActionContainer from '../shared/actionContainer';
import SectionContainer from '../shared/sectionContainer';
import ApproveButton from '../shared/approveButton';
import ExecuteButton from '../shared/executeButton';

type DetailRedeemBeforeMaturityProps = {
  content: DashboardRowChild;
  poolDataAdapter: PoolDataAdapter | null;
  tempusPool: TempusPool;
};

const DetailRedeemBeforeMaturity: FC<DetailRedeemBeforeMaturityProps> = props => {
  const { poolDataAdapter, content, tempusPool } = props;
  const supportedTokens = content.supportedTokens.filter(token => token !== 'ETH');
  const backingToken = content.backingTokenTicker;
  const yieldBearingToken = content.yieldBearingTokenTicker;

  const {
    data: { userPrincipalsBalance, userYieldsBalance, userWalletAddress },
  } = useContext(Context);

  const [amount, setAmount] = useState<string>('');
  const [principalsApproved, setPrincipalsApproved] = useState<boolean>(false);
  const [yieldsApproved, setYieldsApproved] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<Ticker>(yieldBearingToken);
  const [estimatedWithdrawAmount, setEstimatedWithdrawAmount] = useState<BigNumber | null>(null);
  const [tokenRate, setTokenRate] = useState<BigNumber | null>(null);
  const [estimateInProgress, setEstimateInProgress] = useState<boolean>(false);
  const [tokenPrecision, setTokenPrecision] = useState<number>(0);

  const onAmountChange = useCallback(
    (amount: string) => {
      if (amount) {
        setAmount(amount);
      } else {
        setAmount('');
      }
    },
    [setAmount],
  );

  const onTokenChange = useCallback((token: Ticker | undefined) => {
    if (token) {
      setSelectedToken(token);
    }
  }, []);

  /**
   * Update amount field when user clicks on percentage buttons.
   * Checks which is lower from principals and yields and takes percentage of lower one.
   * - Requires user principals and yields balance to be loaded so we can calculate percentage of the lower one.
   */
  const onPercentageChange = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!userPrincipalsBalance || !userYieldsBalance) {
        return;
      }
      const percentage = ethers.utils.parseUnits(event.currentTarget.value, tokenPrecision);

      let balanceToUse: BigNumber;
      if (userPrincipalsBalance.lte(userYieldsBalance)) {
        balanceToUse = userPrincipalsBalance;
      } else {
        balanceToUse = userYieldsBalance;
      }
      setAmount(ethers.utils.formatUnits(mul18f(balanceToUse, percentage, tokenPrecision)));
    },
    [userPrincipalsBalance, userYieldsBalance, tokenPrecision],
  );

  // Update token rate when selected token changes
  useEffect(() => {
    if (!poolDataAdapter) {
      return;
    }

    setTokenPrecision(getTokenPrecision(tempusPool.address, 'principals'));

    const getBackingTokenRate$ = poolDataAdapter.getBackingTokenRate(backingToken);
    const getYieldBearingTokenRate$ = poolDataAdapter.getYieldBearingTokenRate(tempusPool.address, backingToken);

    const stream$ = combineLatest([getBackingTokenRate$, getYieldBearingTokenRate$]).subscribe(
      ([backingTokenRate, yieldBearingTokenRate]) => {
        if (selectedToken === backingToken) {
          setTokenRate(backingTokenRate);
        }

        if (selectedToken === yieldBearingToken) {
          setTokenRate(yieldBearingTokenRate);
        }
      },
    );

    return () => stream$.unsubscribe();
  }, [backingToken, poolDataAdapter, selectedToken, tempusPool.address, yieldBearingToken]);

  const onExecute = useCallback(() => {
    if (!poolDataAdapter) {
      return Promise.resolve(undefined);
    }

    const amountFormatted = ethers.utils.parseUnits(amount, tokenPrecision);
    const toBackingToken = selectedToken === backingToken;

    return poolDataAdapter.executeRedeem(tempusPool.address, userWalletAddress, amountFormatted, toBackingToken);
  }, [amount, backingToken, poolDataAdapter, selectedToken, tempusPool.address, userWalletAddress, tokenPrecision]);

  const onExecuted = useCallback(() => {
    setAmount('');
  }, []);

  // Fetch estimated withdraw amount of tokens
  useEffect(() => {
    const retrieveEstimatedWithdrawAmount = async () => {
      if (poolDataAdapter && amount) {
        try {
          const amountFormatted = ethers.utils.parseUnits(amount, tokenPrecision);
          const toBackingToken = selectedToken === backingToken;

          setEstimateInProgress(true);
          setEstimatedWithdrawAmount(
            await poolDataAdapter.estimatedRedeem(tempusPool.address, amountFormatted, amountFormatted, toBackingToken),
          );
          setEstimateInProgress(false);
        } catch (error) {
          console.log(
            'DetailRedeem - retrieveEstimatedWithdrawAmount() - Failed to fetch estimated withdraw amount!',
            error,
          );
          setEstimateInProgress(false);
        }
      }
    };
    retrieveEstimatedWithdrawAmount();
  }, [tokenPrecision, selectedToken, backingToken, poolDataAdapter, tempusPool.address, amount]);

  const principalsBalanceFormatted = useMemo(() => {
    if (!userPrincipalsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userPrincipalsBalance, tokenPrecision),
      tempusPool.decimalsForUI,
    );
  }, [tempusPool.decimalsForUI, userPrincipalsBalance, tokenPrecision]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!userYieldsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userYieldsBalance, tokenPrecision),
      tempusPool.decimalsForUI,
    );
  }, [tempusPool.decimalsForUI, userYieldsBalance, tokenPrecision]);

  const estimatedWithdrawAmountFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(estimatedWithdrawAmount, tokenPrecision),
      tempusPool.decimalsForUI,
    );
  }, [estimatedWithdrawAmount, tempusPool.decimalsForUI, tokenPrecision]);

  const estimatedWithdrawAmountUsdFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount || !tokenRate) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(mul18f(estimatedWithdrawAmount, tokenRate, tokenPrecision), tokenPrecision),
      2,
      '$',
    );
  }, [estimatedWithdrawAmount, tokenRate, tokenPrecision]);

  const executeDisabled = useMemo(() => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsPrincipalsBalance = ethers.utils
      .parseUnits(amount || '0', tokenPrecision)
      .gt(userPrincipalsBalance || BigNumber.from('0'));
    const amountExceedsYieldsBalance = ethers.utils
      .parseUnits(amount || '0', tokenPrecision)
      .gt(userYieldsBalance || BigNumber.from('0'));
    const principalBalanceZero = userPrincipalsBalance && userPrincipalsBalance.isZero();
    const yieldsBalanceZero = userYieldsBalance && userYieldsBalance.isZero();

    return (
      (!principalBalanceZero && !principalsApproved) ||
      (!yieldsBalanceZero && !yieldsApproved) ||
      zeroAmount ||
      amountExceedsPrincipalsBalance ||
      amountExceedsYieldsBalance ||
      estimateInProgress
    );
  }, [
    amount,
    principalsApproved,
    userPrincipalsBalance,
    userYieldsBalance,
    yieldsApproved,
    estimateInProgress,
    tokenPrecision,
  ]);

  return (
    <>
      <ActionContainer label="From">
        <Spacer size={20} />
        <SectionContainer>
          <div className="tf__flex-column-center-vh">
            <div className="tf__flex-row-center-v" style={{ width: '100%' }}>
              <div className="tf__flex-column-space-between">
                <Typography variant="h4">Primitives</Typography>
                <Spacer size={10} />
                <div className="tf__flex-row-center-v">
                  <Typography variant="body-text">Amount</Typography>
                  <Spacer size={10} />
                  <CurrencyInput defaultValue={amount} onChange={onAmountChange} />
                </div>
              </div>
              <Spacer size={20} />
              <div className="tf__flex-column-space-between">
                {principalsBalanceFormatted && (
                  <Typography variant="body-text">
                    Balance: {principalsBalanceFormatted} Principals &amp; {yieldsBalanceFormatted} Yields
                  </Typography>
                )}
                <Spacer size={10} />
                <div className="tf__flex-row-center-v">
                  <Button variant="contained" size="small" value="0.25" onClick={onPercentageChange}>
                    25%
                  </Button>
                  <Spacer size={10} />
                  <Button variant="contained" size="small" value="0.5" onClick={onPercentageChange}>
                    50%
                  </Button>
                  <Spacer size={10} />
                  <Button variant="contained" size="small" value="0.75" onClick={onPercentageChange}>
                    75%
                  </Button>
                  <Spacer size={10} />
                  <Button variant="contained" size="small" value="1" onClick={onPercentageChange}>
                    Max
                  </Button>
                </div>
              </div>
            </div>
            <Spacer size={15} />
            <Divider style={{ width: '100%' }} />
            <Spacer size={15} />
            <div className="tf__flex-row-space-between" style={{ width: '100%' }}>
              <div className="tf__flex-column-space-between">
                <Typography variant="h4">Principals</Typography>
                <Spacer size={10} />
                <Typography variant="body-text">Balance {principalsBalanceFormatted} Principals</Typography>
              </div>
              <div className="tf__flex-column-center-end">
                <ApproveButton
                  tokenToApproveTicker="Principals"
                  poolDataAdapter={poolDataAdapter}
                  amountToApprove={userPrincipalsBalance}
                  tokenToApproveAddress={content.principalTokenAddress}
                  spenderAddress={getConfig().tempusControllerContract}
                  onApproveChange={approved => {
                    setPrincipalsApproved(approved);
                  }}
                />
              </div>
            </div>
            <Spacer size={15} />
            <Divider style={{ width: '100%' }} />
            <Spacer size={15} />
            <div className="tf__flex-row-space-between" style={{ width: '100%' }}>
              <div className="tf__flex-column-space-between">
                <Typography variant="h4">Yields</Typography>
                <Spacer size={10} />
                <Typography variant="body-text">Balance {yieldsBalanceFormatted} Yields</Typography>
              </div>
              <div className="tf__flex-column-center-end">
                <ApproveButton
                  tokenToApproveTicker="Yields"
                  poolDataAdapter={poolDataAdapter}
                  amountToApprove={userYieldsBalance}
                  tokenToApproveAddress={content.yieldTokenAddress}
                  spenderAddress={getConfig().tempusControllerContract}
                  onApproveChange={approved => {
                    setYieldsApproved(approved);
                  }}
                />
              </div>
            </div>
          </div>
        </SectionContainer>
      </ActionContainer>
      <Spacer size={20} />
      <ActionContainer label="To">
        <Spacer size={20} />
        <SectionContainer>
          <div className="tf__flex-row-space-between">
            <div className="tf__flex-row-center-v">
              <Typography variant="body-text">Token</Typography>
              <Spacer size={10} />
              <TokenSelector
                tickers={supportedTokens}
                defaultTicker={selectedToken as Ticker}
                onTokenChange={onTokenChange}
              />
            </div>
            <div className="tf__flex-column-center-end">
              <Typography variant="h5">
                Estimate: {estimatedWithdrawAmountFormatted} {selectedToken}
              </Typography>
              <Typography variant="disclaimer-text">~{estimatedWithdrawAmountUsdFormatted}</Typography>
            </div>
          </div>
        </SectionContainer>
      </ActionContainer>
      <Spacer size={20} />
      <div className="tf__flex-row-center-v">
        <ExecuteButton
          tempusPool={tempusPool}
          actionName="Redeem"
          disabled={executeDisabled}
          onExecute={onExecute}
          onExecuted={onExecuted}
        />
      </div>
    </>
  );
};

export default DetailRedeemBeforeMaturity;
