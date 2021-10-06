import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import Button from '@material-ui/core/Button';
import { Ticker } from '../../../interfaces/Token';
import { DashboardRowChild } from '../../../interfaces';
import CurrencyInput from '../../currencyInput';
import TokenSelector from '../../tokenSelector';
import Typography from '../../typography/Typography';
import ActionContainer from '../shared/actionContainer';
import Spacer from '../../spacer/spacer';
import SectionContainer from '../shared/sectionContainer';
import ApproveButton from '../shared/approveButton';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import { Context } from '../../../context';
import getConfig from '../../../utils/get-config';
import { Divider } from '@material-ui/core';
import NumberUtils from '../../../services/NumberUtils';
import { mul18f } from '../../../utils/wei-math';
import { TempusPool } from '../../../interfaces/TempusPool';
import ExecuteButton from '../shared/executeButton';
import { getWithdrawNotification } from '../../../services/NotificationService';

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

  const [amount, setAmount] = useState<number>(0);
  const [principalsApproved, setPrincipalsApproved] = useState<boolean>(false);
  const [yieldsApproved, setYieldsApproved] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<Ticker>(yieldBearingToken);
  const [estimatedWithdrawAmount, setEstimatedWithdrawAmount] = useState<BigNumber | null>(null);
  const [tokenRate, setTokenRate] = useState<BigNumber | null>(null);

  const onAmountChange = useCallback(
    (amount: number | undefined) => {
      if (!!amount && !isNaN(amount)) {
        setAmount(amount);
      }
    },
    [setAmount],
  );

  const onTokenChange = useCallback((token: Ticker | undefined) => {
    if (token) {
      setSelectedToken(token);
    }
  }, []);

  const onPercentageChange = useCallback(
    (event: any) => {
      const percentage = event.currentTarget.value;
      if (!!userPrincipalsBalance && !!userYieldsBalance && !isNaN(percentage)) {
        let balanceAsNumber = 0;
        if (userPrincipalsBalance.lte(userYieldsBalance)) {
          balanceAsNumber = Number(ethers.utils.formatEther(userPrincipalsBalance));
        } else {
          balanceAsNumber = Number(ethers.utils.formatEther(userYieldsBalance));
        }
        setAmount(balanceAsNumber * percentage);
      }
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

    const amountFormatted = ethers.utils.parseEther(amount.toString());
    const toBackingToken = selectedToken === backingToken;

    return poolDataAdapter.executeRedeem(tempusPool.address, userWalletAddress, amountFormatted, toBackingToken);
  }, [amount, backingToken, poolDataAdapter, selectedToken, tempusPool.address, userWalletAddress]);

  const onExecuted = useCallback(() => {}, []);

  // Fetch estimated withdraw amount of tokens
  useEffect(() => {
    const retrieveEstimatedWithdrawAmount = async () => {
      if (poolDataAdapter) {
        try {
          const amountFormatted = ethers.utils.parseEther(amount.toString());
          const toBackingToken = selectedToken === backingToken;

          setEstimatedWithdrawAmount(
            await poolDataAdapter.estimatedRedeem(tempusPool.address, amountFormatted, amountFormatted, toBackingToken),
          );
        } catch (error) {
          console.log(
            'DetailRedeem - retrieveEstimatedWithdrawAmount() - Failed to fetch estimated withdraw amount!',
            error,
          );
          return Promise.reject(error);
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
                  tokenTicker="Principals"
                  poolDataAdapter={poolDataAdapter}
                  amountToApprove={userPrincipalsBalance || BigNumber.from('0')}
                  tokenToApprove={content.principalTokenAddress}
                  spenderAddress={getConfig().tempusControllerContract}
                  onApproved={() => {
                    setPrincipalsApproved(true);
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
                  tokenTicker="Yields"
                  poolDataAdapter={poolDataAdapter}
                  amountToApprove={userYieldsBalance || BigNumber.from('0')}
                  tokenToApprove={content.yieldTokenAddress}
                  spenderAddress={getConfig().tempusControllerContract}
                  onApproved={() => {
                    setYieldsApproved(true);
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
          notificationText={getWithdrawNotification(content.backingTokenTicker, content.protocol, content.maturityDate)}
          actionName="Redeem"
          disabled={
            (!principalsApproved && !userPrincipalsBalance?.isZero()) ||
            (!yieldsApproved && !userYieldsBalance?.isZero()) ||
            !amount
          }
          onExecute={onExecute}
          onExecuted={onExecuted}
        />
      </div>
    </>
  );
};

export default DetailRedeemBeforeMaturity;
