import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { utils, BigNumber, ethers } from 'ethers';
import Button from '@material-ui/core/Button';
import { interestRateProtectionTooltipText, liquidityProvisionTooltipText } from '../../../constants';
import NumberUtils from '../../../services/NumberUtils';
import { Context } from '../../../context';
import { getDepositNotification } from '../../../services/NotificationService';
import { Ticker } from '../../../interfaces';
import { mul18f } from '../../../utils/wei-math';
import getConfig from '../../../utils/get-config';
import { isZeroString } from '../../../utils/isZeroString';
import CurrencyInput from '../../currencyInput/currencyInput';
import TokenSelector from '../../tokenSelector';
import Typography from '../../typography/Typography';
import Spacer from '../../spacer/spacer';
import ActionContainer from '../shared/actionContainer';
import SectionContainer from '../shared/sectionContainer';
import PoolDetailProps from '../shared/PoolDetailProps';
import ApproveButton from '../shared/approveButton';
import ExecuteButton from '../shared/executeButton';

import '../shared/style.scss';

export type SelectedYield = 'Fixed' | 'Variable';

// TODO Component is too big, we may need to break it up
const DetailDeposit: FC<PoolDetailProps> = ({ tempusPool, content, signer, userWalletAddress, poolDataAdapter }) => {
  const { address, ammAddress } = tempusPool || {};
  const { supportedTokens = [], fixedAPR = 0, variableAPY = 0 } = content || {};
  const [backingToken] = supportedTokens;

  const {
    data: { userBackingTokenBalance, userYieldBearingTokenBalance },
  } = useContext(Context);

  const [selectedToken, setSelectedToken] = useState<Ticker | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [usdRate, setUsdRate] = useState<BigNumber | null>(null);
  const [minTYSRate] = useState<number>(0); // TODO where to get this value?

  const [fixedPrincipalsAmount, setFixedPrincipalsAmount] = useState<BigNumber | null>(null);
  const [variablePrincipalsAmount, setVariablePrincipalsAmount] = useState<BigNumber | null>(null);
  const [variableLpTokensAmount, setVariableLpTokensAmount] = useState<BigNumber | null>(null);

  const [estimatedFixedApr, setEstimatedFixedApr] = useState<BigNumber | null>(null);
  const [selectedYield, setSelectedYield] = useState<SelectedYield>('Fixed');
  const [backingTokenRate, setBackingTokenRate] = useState<BigNumber | null>(null);
  const [yieldBearingTokenRate, setYieldBearingTokenRate] = useState<BigNumber | null>(null);

  const [tokenEstimateInProgress, setTokenEstimateInProgress] = useState<boolean>(false);
  const [rateEstimateInProgress, setRateEstimateInProgress] = useState<boolean>(false);

  const [tokensApproved, setTokensApproved] = useState<boolean>(false);

  const onTokenChange = useCallback(
    (token: Ticker | undefined) => {
      if (!!token) {
        setSelectedToken(token);
        setAmount('');

        if (backingToken === token) {
          if (backingTokenRate !== null) {
            setUsdRate(backingTokenRate);
          }
        }

        if (backingToken !== token) {
          if (yieldBearingTokenRate !== null) {
            setUsdRate(yieldBearingTokenRate);
          }
        }
      }
    },
    [backingToken, backingTokenRate, yieldBearingTokenRate, setSelectedToken, setAmount],
  );

  const onAmountChange = useCallback(
    (value: string) => {
      if (value) {
        setAmount(value);
      } else {
        setAmount('');
      }
    },
    [setAmount],
  );

  /**
   * Update amount field when user clicks on percentage buttons.
   * - Requires token balance to be loaded so we can calculate percentage of that.
   */
  const onPercentageChange = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      let currentBalance: BigNumber;
      if (selectedToken === backingToken) {
        if (!userBackingTokenBalance) {
          return;
        }
        currentBalance = userBackingTokenBalance;
      } else {
        if (!userYieldBearingTokenBalance) {
          return;
        }
        currentBalance = userYieldBearingTokenBalance;
      }

      const percentage = ethers.utils.parseEther(event.currentTarget.value);
      setAmount(ethers.utils.formatEther(mul18f(currentBalance, percentage)));
    },
    [backingToken, selectedToken, userBackingTokenBalance, userYieldBearingTokenBalance],
  );

  const onSelectYield = useCallback(
    (event: any) => {
      const element = event.target.closest('[yield-attribute]');
      if (element) {
        setSelectedYield(element.getAttribute('yield-attribute'));
      }
    },
    [setSelectedYield],
  );

  const getSelectedTokenBalance = useCallback((): BigNumber | null => {
    if (!selectedToken) {
      return null;
    }
    return selectedToken === backingToken ? userBackingTokenBalance : userYieldBearingTokenBalance;
  }, [backingToken, selectedToken, userBackingTokenBalance, userYieldBearingTokenBalance]);

  const getSelectedTokenAddress = useCallback((): string | null => {
    if (!selectedToken) {
      return null;
    }
    return selectedToken === backingToken ? content.backingTokenAddress : content.yieldBearingTokenAddress;
  }, [backingToken, content.backingTokenAddress, content.yieldBearingTokenAddress, selectedToken]);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (signer && amount && poolDataAdapter) {
      const tokenAmount = utils.parseEther(amount);
      const isBackingToken = backingToken === selectedToken;
      const parsedMinTYSRate = utils.parseEther(minTYSRate.toString());
      const isEthDeposit = selectedToken === 'ETH';
      return poolDataAdapter.executeDeposit(
        ammAddress,
        tokenAmount,
        isBackingToken,
        parsedMinTYSRate,
        selectedYield,
        isEthDeposit,
      );
    } else {
      return Promise.resolve(undefined);
    }
  }, [signer, poolDataAdapter, ammAddress, backingToken, selectedToken, selectedYield, amount, minTYSRate]);

  const onExecuted = useCallback(() => {
    setAmount('');
  }, []);

  const onApproveChange = useCallback(approved => {
    setTokensApproved(approved);
  }, []);

  useEffect(() => {
    const retrieveTokenRates = async () => {
      if (signer && address && ammAddress && poolDataAdapter) {
        try {
          const { backingTokenRate, yieldBearingTokenRate } = await poolDataAdapter.retrieveBalances(
            address,
            ammAddress,
            userWalletAddress,
            signer,
          );

          setBackingTokenRate(backingTokenRate);
          setYieldBearingTokenRate(yieldBearingTokenRate);
        } catch (error) {
          console.log('DetailDeposit - retrieveTokenRates - Failed to retrieve token rates!', error);
        }
      }
    };
    retrieveTokenRates();
  }, [
    backingToken,
    selectedToken,
    signer,
    address,
    ammAddress,
    userWalletAddress,
    poolDataAdapter,
    setBackingTokenRate,
    setYieldBearingTokenRate,
  ]);

  useEffect(() => {
    const retrieveDepositAmount = async () => {
      if (isZeroString(amount)) {
        setFixedPrincipalsAmount(null);
        setVariablePrincipalsAmount(null);
        setVariableLpTokensAmount(null);
      } else if (ammAddress && poolDataAdapter) {
        try {
          setTokenEstimateInProgress(true);

          const isBackingToken = backingToken === selectedToken;

          const { fixedDeposit, variableDeposit } = await poolDataAdapter.getEstimatedDepositAmount(
            ammAddress,
            utils.parseEther(amount),
            isBackingToken,
          );
          setFixedPrincipalsAmount(fixedDeposit);

          const [variableLpTokens, variablePrincipals] = variableDeposit;
          setVariablePrincipalsAmount(variablePrincipals);
          setVariableLpTokensAmount(variableLpTokens);

          setTokenEstimateInProgress(false);
        } catch (err) {
          // TODO handle errors
          console.log('Detail Deposit - retrieveDepositAmount -', err);

          setTokenEstimateInProgress(false);
        }
      }
    };

    retrieveDepositAmount();
  }, [
    ammAddress,
    amount,
    selectedToken,
    backingToken,
    poolDataAdapter,
    setFixedPrincipalsAmount,
    setVariablePrincipalsAmount,
    setVariableLpTokensAmount,
  ]);

  useEffect(() => {
    const getEstimatedFixedApr = async () => {
      if (amount && amount !== '0' && selectedToken && poolDataAdapter) {
        setRateEstimateInProgress(true);
        const isBackingToken = selectedToken === backingToken;
        try {
          const fixedAPREstimate = await poolDataAdapter.getEstimatedFixedApr(
            utils.parseEther(amount),
            isBackingToken,
            address,
            ammAddress,
          );

          setEstimatedFixedApr(fixedAPREstimate);
          setRateEstimateInProgress(false);
        } catch (error) {
          console.log('DetailDeposit - getEstimatedFixedApr() - Failed to fetch estimated fixed APR!', error);
          setRateEstimateInProgress(false);
        }
      } else {
        setEstimatedFixedApr(null);
      }
    };

    getEstimatedFixedApr();
  }, [amount, selectedToken, backingToken, address, ammAddress, poolDataAdapter, setEstimatedFixedApr]);

  const fixedPrincipalsAmountFormatted = useMemo(() => {
    if (!fixedPrincipalsAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(utils.formatEther(fixedPrincipalsAmount), tempusPool.decimalsForUI);
  }, [fixedPrincipalsAmount, tempusPool.decimalsForUI]);

  const variablePrincipalsAmountFormatted = useMemo(() => {
    if (!variablePrincipalsAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(utils.formatEther(variablePrincipalsAmount), tempusPool.decimalsForUI);
  }, [variablePrincipalsAmount, tempusPool.decimalsForUI]);

  const variableLpTokensAmountFormatted = useMemo(() => {
    if (!variableLpTokensAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(utils.formatEther(variableLpTokensAmount), tempusPool.decimalsForUI);
  }, [variableLpTokensAmount, tempusPool.decimalsForUI]);

  const balanceFormatted = useMemo(() => {
    let currentBalance = getSelectedTokenBalance();
    if (!currentBalance) {
      return null;
    }

    return NumberUtils.formatToCurrency(utils.formatEther(currentBalance), tempusPool.decimalsForUI);
  }, [getSelectedTokenBalance, tempusPool.decimalsForUI]);

  const usdValueFormatted = useMemo(() => {
    if (!usdRate || !amount) {
      return null;
    }

    let usdValue = mul18f(usdRate, utils.parseEther(amount));

    return NumberUtils.formatToCurrency(utils.formatEther(usdValue), 2, '$');
  }, [usdRate, amount]);

  const approveDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);

    return zeroAmount;
  }, [amount]);

  const executeDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsBalance = ethers.utils
      .parseEther(amount || '0')
      .gt(getSelectedTokenBalance() || BigNumber.from('0'));

    return !tokensApproved || zeroAmount || amountExceedsBalance || rateEstimateInProgress || tokenEstimateInProgress;
  }, [amount, getSelectedTokenBalance, rateEstimateInProgress, tokenEstimateInProgress, tokensApproved]);

  return (
    <div role="tabpanel">
      <div className="tf__dialog__content-tab">
        <Spacer size={25} />
        <ActionContainer label="From">
          <Spacer size={18} />
          <SectionContainer>
            <div className="tf__dialog__flex-row">
              <div className="tf__dialog__label-align-right">
                <Typography variant="body-text">Token</Typography>
              </div>
              <TokenSelector tickers={supportedTokens} onTokenChange={onTokenChange} />
              <Spacer size={20} />
              <Typography variant="body-text">
                {selectedToken && balanceFormatted ? `Balance: ${balanceFormatted} ${selectedToken}` : ''}
              </Typography>
            </div>
            <Spacer size={14} />
            <div className="tf__dialog__flex-row">
              <div className="tf__dialog__label-align-right">
                <Typography variant="body-text">Amount</Typography>
              </div>
              <div className="tf__flex-column-start">
                <CurrencyInput defaultValue={amount} onChange={onAmountChange} disabled={!selectedToken} />
                {usdValueFormatted && (
                  <div className="tf__input__label">
                    <Typography variant="disclaimer-text">Approx {usdValueFormatted}</Typography>
                  </div>
                )}
              </div>
              {selectedToken && (
                <>
                  <Spacer size={20} />
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
                </>
              )}
            </div>
            <Spacer size={15} />
          </SectionContainer>
        </ActionContainer>
        <Spacer size={25} />
        <ActionContainer label="To">
          <div className="tf__dialog__flex-row">
            <div className="tf__dialog__flex-row-half-width">
              <SectionContainer
                title="Interest rate protection"
                tooltip={interestRateProtectionTooltipText}
                selectable={true}
                selected={selectedYield === 'Fixed'}
              >
                <div className="tf__dialog__flex-col-space-between" yield-attribute="Fixed" onClick={onSelectYield}>
                  <Typography variant="h4">Fixed Yield</Typography>
                  <Typography variant="body-text">
                    {fixedPrincipalsAmountFormatted && `est. ${fixedPrincipalsAmountFormatted} Principals`}
                  </Typography>
                  <Typography variant="h3" color="accent">
                    est. APR{' '}
                    {estimatedFixedApr
                      ? NumberUtils.formatPercentage(utils.formatEther(estimatedFixedApr))
                      : NumberUtils.formatPercentage(fixedAPR, 2)}
                  </Typography>
                </div>
              </SectionContainer>
            </div>

            <Spacer size={20} />

            <div className="tf__dialog__flex-row-half-width">
              <SectionContainer
                title="Liquidity provision"
                tooltip={liquidityProvisionTooltipText}
                selectable={true}
                selected={selectedYield === 'Variable'}
              >
                <div className="tf__dialog__flex-col-space-between" yield-attribute="Variable" onClick={onSelectYield}>
                  <Typography variant="h4">Variable Yield</Typography>
                  <div>
                    <Typography variant="body-text">
                      {variablePrincipalsAmountFormatted && `est. ${variablePrincipalsAmountFormatted} Principals`}
                    </Typography>
                    <Typography variant="body-text">
                      {variableLpTokensAmountFormatted && `est.  ${variableLpTokensAmountFormatted} LP Tokens`}
                    </Typography>
                  </div>
                  <Typography variant="h3" color="accent">
                    est. APR {NumberUtils.formatPercentage(variableAPY, 2)}
                  </Typography>
                </div>
              </SectionContainer>
            </div>
          </div>
        </ActionContainer>
        <Spacer size={20} />
        <div className="tf__flex-row-center-vh">
          {selectedToken && (
            <>
              <ApproveButton
                poolDataAdapter={poolDataAdapter}
                tokenToApproveAddress={getSelectedTokenAddress()}
                spenderAddress={getConfig().tempusControllerContract}
                amountToApprove={getSelectedTokenBalance()}
                tokenToApproveTicker={selectedToken}
                disabled={approveDisabled}
                marginRight={20}
                onApproveChange={onApproveChange}
              />
            </>
          )}
          <ExecuteButton
            actionName="Deposit"
            notificationText={getDepositNotification(
              `${selectedYield} Yield`,
              content.backingTokenTicker,
              content.protocol,
              content.maturityDate,
            )}
            disabled={executeDisabled}
            onExecute={onExecute}
            onExecuted={onExecuted}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailDeposit;
