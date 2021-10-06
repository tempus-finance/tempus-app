import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { utils, BigNumber, ethers } from 'ethers';
import Button from '@material-ui/core/Button';
import { interestRateProtectionTooltipText, liquidityProvisionTooltipText } from '../../../constants';
import NumberUtils from '../../../services/NumberUtils';
import { getDepositNotification } from '../../../services/NotificationService';
import { Ticker } from '../../../interfaces';
import { mul18f } from '../../../utils/wei-math';
import getConfig from '../../../utils/get-config';
import CurrencyInput from '../../currencyInput';
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
  const [triggerUpdateBalance, setTriggerUpdateBalance] = useState<boolean>(true);
  const [backingToken] = supportedTokens;

  const [selectedToken, setSelectedToken] = useState<Ticker | null>(null);
  const [amount, setAmount] = useState<string>('0');
  const [balance, setBalance] = useState<BigNumber | null>(null);
  const [usdRate, setUsdRate] = useState<BigNumber | null>(null);
  const [minTYSRate] = useState<number>(0); // TODO where to get this value?

  const [fixedPrincipalsAmount, setFixedPrincipalsAmount] = useState<BigNumber | null>(null);
  const [variablePrincipalsAmount, setVariablePrincipalsAmount] = useState<BigNumber | null>(null);
  const [variableLpTokensAmount, setVariableLpTokensAmount] = useState<BigNumber | null>(null);

  const [backingTokenBalance, setBackingTokenBalance] = useState<BigNumber | null>(null);
  const [yieldBearingTokenBalance, setYieldBearingTokenBalance] = useState<BigNumber | null>(null);

  const [estimatedFixedApr, setEstimatedFixedApr] = useState<BigNumber | null>(null);
  const [selectedYield, setSelectedYield] = useState<SelectedYield>('Fixed');
  const [backingTokenRate, setBackingTokenRate] = useState<BigNumber | null>(null);
  const [yieldBearingTokenRate, setYieldBearingTokenRate] = useState<BigNumber | null>(null);

  const [executeDisabled, setExecuteDisabled] = useState<boolean>(true);

  const onTokenChange = useCallback(
    (token: Ticker | undefined) => {
      if (!!token) {
        setSelectedToken(token);
        setAmount('0');

        if (backingToken === token) {
          if (backingTokenBalance !== null) {
            setBalance(backingTokenBalance);
          }

          if (backingTokenRate !== null) {
            setUsdRate(backingTokenRate);
          }
        }

        if (backingToken !== token) {
          if (yieldBearingTokenBalance !== null) {
            setBalance(yieldBearingTokenBalance);
          }

          if (yieldBearingTokenRate !== null) {
            setUsdRate(yieldBearingTokenRate);
          }
        }
      }
    },
    [
      backingToken,
      backingTokenBalance,
      backingTokenRate,
      yieldBearingTokenRate,
      yieldBearingTokenBalance,
      setSelectedToken,
      setBalance,
      setAmount,
    ],
  );

  const onAmountChange = useCallback(
    (value: string) => {
      if (value) {
        setAmount(value);
      } else {
        setAmount('0');
      }
    },
    [setAmount],
  );

  const onPercentageChange = useCallback(
    (event: any) => {
      const percentage = event.currentTarget.value;
      if (!!selectedToken && !!balance && !isNaN(percentage)) {
        const balanceAsNumber = Number(utils.formatEther(balance));
        setAmount(Number(balanceAsNumber * percentage).toString());
      }
    },
    [balance, selectedToken, setAmount],
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

  const onApproved = useCallback(() => {
    setExecuteDisabled(false);
  }, []);

  const onAllowanceExceeded = useCallback(() => {
    setExecuteDisabled(true);
  }, []);

  const onExecuted = useCallback(() => {
    setExecuteDisabled(false);
  }, []);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (signer && amount && poolDataAdapter) {
      setExecuteDisabled(true);

      const tokenAmount = utils.parseEther(amount.toString());
      const isBackingToken = backingToken === selectedToken;
      const parsedMinTYSRate = utils.parseEther(minTYSRate.toString());
      const isEthDeposit = selectedToken === 'ETH';
      return poolDataAdapter
        .executeDeposit(ammAddress, tokenAmount, isBackingToken, parsedMinTYSRate, selectedYield, isEthDeposit)
        .catch(() => {
          setExecuteDisabled(false);
          return undefined;
        });
    } else {
      return Promise.resolve(undefined);
    }
  }, [
    signer,
    ammAddress,
    backingToken,
    selectedToken,
    selectedYield,
    amount,
    minTYSRate,
    poolDataAdapter,
    setExecuteDisabled,
  ]);

  useEffect(() => {
    const retrieveBalances = async () => {
      if (signer && address && ammAddress && poolDataAdapter) {
        try {
          const { backingTokenBalance, backingTokenRate, yieldBearingTokenBalance, yieldBearingTokenRate } =
            (await poolDataAdapter?.retrieveBalances(address, ammAddress, userWalletAddress, signer)) || {};

          if (backingTokenBalance) {
            setBackingTokenBalance(backingTokenBalance);

            if (backingToken === selectedToken) {
              setBalance(backingTokenBalance);
            }
          }

          if (backingTokenRate) {
            setBackingTokenRate(backingTokenRate);
          }

          if (yieldBearingTokenBalance) {
            setYieldBearingTokenBalance(yieldBearingTokenBalance);
            if (backingToken !== selectedToken) {
              setBalance(yieldBearingTokenBalance);
            }
          }

          if (yieldBearingTokenRate) {
            setYieldBearingTokenRate(yieldBearingTokenRate);
          }

          setTriggerUpdateBalance(false);
        } catch (err) {
          // TODO handle errors
          console.log('Detail Deposit - retrieveBalances -', err);
        }
      }
    };

    if (triggerUpdateBalance) {
      retrieveBalances();
    }
  }, [
    triggerUpdateBalance,
    backingToken,
    selectedToken,
    signer,
    address,
    ammAddress,
    userWalletAddress,
    poolDataAdapter,
    setBackingTokenBalance,
    setBackingTokenRate,
    setYieldBearingTokenRate,
    setYieldBearingTokenBalance,
    setTriggerUpdateBalance,
  ]);

  useEffect(() => {
    const retrieveDepositAmount = async () => {
      if (amount === '0') {
        setFixedPrincipalsAmount(null);
        setVariablePrincipalsAmount(null);
        setVariableLpTokensAmount(null);
      } else if (ammAddress && poolDataAdapter) {
        try {
          const isBackingToken = backingToken === selectedToken;

          const { fixedDeposit, variableDeposit } =
            (await poolDataAdapter.getEstimatedDepositAmount(
              ammAddress,
              utils.parseEther(amount.toString()),
              isBackingToken,
            )) || {};

          if (fixedDeposit !== null) {
            setFixedPrincipalsAmount(fixedDeposit);
          }

          if (variableDeposit) {
            const [variableLpTokens, variablePrincipals] = variableDeposit;
            if (variablePrincipals !== null) {
              setVariablePrincipalsAmount(variablePrincipals);
            }
            if (variableLpTokens !== null) {
              setVariableLpTokensAmount(variableLpTokens);
            }
          }
        } catch (err) {
          // TODO handle errors
          console.log('Detail Deposit - retrieveDepositAmount -', err);
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
    if (!balance) {
      return null;
    }

    return NumberUtils.formatToCurrency(utils.formatEther(balance), tempusPool.decimalsForUI);
  }, [balance, tempusPool.decimalsForUI]);

  const usdValueFormatted = useMemo(() => {
    if (!usdRate || !amount) {
      return null;
    }

    let usdValue = mul18f(usdRate, utils.parseEther(amount.toString()));

    return NumberUtils.formatToCurrency(utils.formatEther(usdValue), 2, '$');
  }, [usdRate, amount]);

  useEffect(() => {
    const getEstimatedFixedApr = async () => {
      if (amount && amount !== '0' && selectedToken) {
        const isBackingToken = selectedToken === backingToken;
        const result = await poolDataAdapter?.getEstimatedFixedApr(
          utils.parseEther(amount.toString()),
          isBackingToken,
          address,
          ammAddress,
        );

        if (result) {
          setEstimatedFixedApr(result);
        } else {
          setEstimatedFixedApr(null);
        }
      } else {
        setEstimatedFixedApr(null);
      }
    };

    getEstimatedFixedApr();
  }, [amount, selectedToken, backingToken, address, ammAddress, poolDataAdapter, setEstimatedFixedApr]);

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
          <ApproveButton
            poolDataAdapter={poolDataAdapter}
            tokenToApprove={
              selectedToken === backingToken ? content.backingTokenAddress : content.yieldBearingTokenAddress
            }
            spenderAddress={getConfig().tempusControllerContract}
            amountToApprove={balance}
            tokenTicker={selectedToken}
            onApproved={onApproved}
            onAllowanceExceeded={onAllowanceExceeded}
          />
          <Spacer size={20} />
          <ExecuteButton
            actionName="Deposit"
            notificationText={getDepositNotification(
              `${selectedYield} Yield`,
              content.backingTokenTicker,
              content.protocol,
              content.maturityDate,
            )}
            disabled={executeDisabled || amount === '0'}
            onExecute={onExecute}
            onExecuted={onExecuted}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailDeposit;
