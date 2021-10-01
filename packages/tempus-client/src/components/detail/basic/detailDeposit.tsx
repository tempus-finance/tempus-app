import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { utils, BigNumber } from 'ethers';
import { format } from 'date-fns';
import Button from '@material-ui/core/Button';
import NumberUtils from '../../../services/NumberUtils';
import { ProtocolName, Ticker } from '../../../interfaces';
import CurrencyInput from '../../currencyInput';
import TokenSelector from '../../tokenSelector';
import Typography from '../../typography/Typography';
import getNotificationService from '../../../services/getNotificationService';
import Spacer from '../../spacer/spacer';
import ActionContainer from '../shared/actionContainer';
import Execute from '../shared/execute';
import SectionContainer from '../shared/sectionContainer';
import PoolDetailProps from '../shared/PoolDetailProps';

import '../shared/style.scss';
import { interestRateProtectionTooltipText, liquidityProvisionTooltipText } from '../../../constants';

type SelectedYield = 'fixed' | 'variable';

// TODO Component is too big, we may need to break it up
const DetailDeposit: FC<PoolDetailProps> = ({ tempusPool, content, signer, userWalletAddress, poolDataAdapter }) => {
  const { address, ammAddress } = tempusPool || {};
  const { supportedTokens = [], fixedAPR = 0, variableAPY = 0, protocol, maturityDate } = content || {};
  const [triggerUpdateBalance, setTriggerUpdateBalance] = useState<boolean>(true);
  const [backingToken] = supportedTokens;

  const [selectedToken, setSelectedToken] = useState<Ticker | undefined>(undefined);
  const [amount, setAmount] = useState<number>(0);
  const [balance, setBalance] = useState<BigNumber | null>(null);
  const [usdRate, setUsdRate] = useState<BigNumber | null>(null);
  const [minTYSRate] = useState<number>(0); // TODO where to get this value?

  const [fixedPrincipalsAmount, setFixedPrincipalsAmount] = useState<BigNumber | null>(null);
  const [variablePrincipalsAmount, setVariablePrincipalsAmount] = useState<BigNumber | null>(null);
  const [variableLpTokensAmount, setVariableLpTokensAmount] = useState<BigNumber | null>(null);

  const [backingTokenBalance, setBackingTokenBalance] = useState<BigNumber | null>(null);
  const [yieldBearingTokenBalance, setYieldBearingTokenBalance] = useState<BigNumber | null>(null);

  const [estimatedFixedApr, setEstimatedFixedApr] = useState<BigNumber | null>(null);
  const [selectedYield, setSelectedYield] = useState<SelectedYield>('fixed');
  const [backingTokenRate, setBackingTokenRate] = useState<BigNumber | null>(null);
  const [yieldBearingTokenRate, setYieldBearingTokenRate] = useState<BigNumber | null>(null);

  const [approveDisabled, setApproveDisabled] = useState<boolean>(false);
  const [executeDisabled, setExecuteDisabled] = useState<boolean>(true);

  const onTokenChange = useCallback(
    (token: Ticker | undefined) => {
      if (!!token) {
        setSelectedToken(token);
        setAmount(0);

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
    (value: number | undefined) => {
      if (!!value && !isNaN(value)) {
        setAmount(value);
      } else {
        setAmount(0);
      }
    },
    [setAmount],
  );

  const onPercentageChange = useCallback(
    (event: any) => {
      const percentage = event.currentTarget.value;
      if (!!selectedToken && !!balance && !isNaN(percentage)) {
        const balanceAsNumber = Number(utils.formatEther(balance));
        setAmount(balanceAsNumber * percentage);
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

  const onApprove = useCallback(() => {
    const approve = async () => {
      if (signer && balance && poolDataAdapter) {
        try {
          const isBackingToken = backingToken === selectedToken;
          const approveTransaction = await poolDataAdapter.approve(address, isBackingToken, signer, balance);
          if (approveTransaction) {
            await approveTransaction.wait();
            setExecuteDisabled(false);
          }
        } catch (err) {
          // TODO handle errors
          console.log('onApprove err', err);
        }
      }
    };
    setApproveDisabled(true);
    approve();
  }, [address, signer, backingToken, selectedToken, balance, poolDataAdapter, setApproveDisabled, setExecuteDisabled]);

  const onExecute = useCallback(() => {
    const execute = async () => {
      if (signer && amount && poolDataAdapter) {
        try {
          const parsedAmount = amount.toString();
          const tokenAmount = utils.parseEther(parsedAmount);
          const isBackingToken = backingToken === selectedToken;
          const parsedMinTYSRate = utils.parseEther(minTYSRate.toString());
          const isEthDeposit = selectedToken === 'ETH';
          const depositTransaction = await poolDataAdapter.executeDeposit(
            ammAddress,
            tokenAmount,
            isBackingToken,
            parsedMinTYSRate,
            isEthDeposit,
          );
          await depositTransaction?.wait();
          // TODO
          // how to get transaction address for Etherscan?
          const link = 'someEtherscanLink';
          getNotificationService().notify(
            'Deposit Successful',
            getSuccessfulNotification(selectedYield, backingToken, protocol, maturityDate),
            link,
            'View on Etherscan',
          );
          setExecuteDisabled(false);
          setTriggerUpdateBalance(true);
          setAmount(0);
        } catch (err) {
          // TODO handle errors
          console.log('onExecute err', err);
        }
      }
    };

    setExecuteDisabled(true);
    execute();
  }, [
    signer,
    ammAddress,
    backingToken,
    selectedToken,
    protocol,
    maturityDate,
    selectedYield,
    amount,
    minTYSRate,
    poolDataAdapter,
    setExecuteDisabled,
    setTriggerUpdateBalance,
    setAmount,
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
      if (amount === 0) {
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

  useEffect(() => {
    setExecuteDisabled(!amount || !selectedYield);
  }, [amount, selectedYield, setExecuteDisabled]);

  useEffect(() => {
    const getAllowance = async () => {
      if (signer) {
        const isBackingToken = backingToken === selectedToken;
        const allowance = await poolDataAdapter?.getApprovedAllowance(
          userWalletAddress,
          address,
          isBackingToken,
          signer,
        );
        if (allowance) {
          setApproveDisabled(true);
        } else {
          setApproveDisabled(false);
        }
      }
    };

    getAllowance();
  }, [userWalletAddress, address, selectedToken, backingToken, signer, poolDataAdapter]);

  const fixedPrincipalsAmountFormatted = useMemo(() => {
    if (!fixedPrincipalsAmount) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(utils.formatEther(fixedPrincipalsAmount), 2);
  }, [fixedPrincipalsAmount]);

  const variablePrincipalsAmountFormatted = useMemo(() => {
    if (!variablePrincipalsAmount) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(utils.formatEther(variablePrincipalsAmount), 2);
  }, [variablePrincipalsAmount]);

  const variableLpTokensAmountFormatted = useMemo(() => {
    if (!variableLpTokensAmount) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(utils.formatEther(variableLpTokensAmount), 2);
  }, [variableLpTokensAmount]);

  const balanceFormatted = useMemo(() => {
    if (!balance) {
      return null;
    }

    return NumberUtils.formatWithMultiplier(utils.formatEther(balance), 2);
  }, [balance]);

  useEffect(() => {
    const getEstimatedFixedApr = async () => {
      if (amount && selectedToken) {
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
              <CurrencyInput defaultValue={amount} onChange={onAmountChange} disabled={!selectedToken} />
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
                selected={selectedYield === 'fixed'}
              >
                <div className="tf__dialog__flex-col-space-between" yield-attribute="fixed" onClick={onSelectYield}>
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
                selected={selectedYield === 'variable'}
              >
                <div className="tf__dialog__flex-col-space-between" yield-attribute="variable" onClick={onSelectYield}>
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

        <Execute
          approveDisabled={approveDisabled}
          executeDisabled={executeDisabled}
          onApprove={onApprove}
          onExecute={onExecute}
        />
      </div>
    </div>
  );
};

export default DetailDeposit;

const getSuccessfulNotification = (
  selectedYield: string,
  backingToken: Ticker,
  protocol: ProtocolName,
  maturityDate: Date,
): string => {
  return `${selectedYield} Yield
    ${backingToken} via ${protocol}
    ${format(maturityDate, 'dd MMMM yyyy')}`;
};
