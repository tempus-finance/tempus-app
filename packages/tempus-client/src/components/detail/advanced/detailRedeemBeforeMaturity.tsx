import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
      const percentage = ethers.utils.parseEther(event.currentTarget.value);

      let balanceToUse: BigNumber;
      if (userPrincipalsBalance.lte(userYieldsBalance)) {
        balanceToUse = userPrincipalsBalance;
      } else {
        balanceToUse = userYieldsBalance;
      }
      setAmount(ethers.utils.formatEther(mul18f(balanceToUse, percentage)));
    },
    [userPrincipalsBalance, userYieldsBalance],
  );

  // Update token rate when selected token changes
  useEffect(() => {
    const getRate = async () => {
      if (!poolDataAdapter) {
        return;
      }

      if (selectedToken === backingToken) {
        setTokenRate(await poolDataAdapter.getBackingTokenRate(backingToken));
      }
      if (selectedToken === yieldBearingToken) {
        setTokenRate(await poolDataAdapter.getYieldBearingTokenRate(tempusPool.address, backingToken));
      }
    };
    getRate();
  }, [backingToken, poolDataAdapter, selectedToken, tempusPool.address, yieldBearingToken]);

  const onExecute = useCallback(() => {
    if (!poolDataAdapter) {
      return Promise.resolve(undefined);
    }

    const amountFormatted = ethers.utils.parseEther(amount);
    const toBackingToken = selectedToken === backingToken;

    return poolDataAdapter.executeRedeem(tempusPool.address, userWalletAddress, amountFormatted, toBackingToken);
  }, [amount, backingToken, poolDataAdapter, selectedToken, tempusPool.address, userWalletAddress]);

  const onExecuted = useCallback(() => {
    setAmount('');
  }, []);

  // Fetch estimated withdraw amount of tokens
  useEffect(() => {
    const retrieveEstimatedWithdrawAmount = async () => {
      if (poolDataAdapter && amount) {
        try {
          const amountFormatted = ethers.utils.parseEther(amount);
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
  }, [selectedToken, backingToken, poolDataAdapter, tempusPool.maxLeftoverShares, tempusPool.address, amount]);

  const principalsBalanceFormatted = useMemo(() => {
    if (!userPrincipalsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(userPrincipalsBalance), tempusPool.decimalsForUI);
  }, [tempusPool.decimalsForUI, userPrincipalsBalance]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!userYieldsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(userYieldsBalance), tempusPool.decimalsForUI);
  }, [tempusPool.decimalsForUI, userYieldsBalance]);

  const estimatedWithdrawAmountFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(estimatedWithdrawAmount), tempusPool.decimalsForUI);
  }, [estimatedWithdrawAmount, tempusPool.decimalsForUI]);

  const estimatedWithdrawAmountUsdFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount || !tokenRate) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(mul18f(estimatedWithdrawAmount, tokenRate)), 2, '$');
  }, [estimatedWithdrawAmount, tokenRate]);

  const executeDisabled = useMemo(() => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsPrincipalsBalance = ethers.utils
      .parseEther(amount || '0')
      .gt(userPrincipalsBalance || BigNumber.from('0'));
    const amountExceedsYieldsBalance = ethers.utils
      .parseEther(amount || '0')
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
  }, [amount, principalsApproved, userPrincipalsBalance, userYieldsBalance, yieldsApproved, estimateInProgress]);

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
