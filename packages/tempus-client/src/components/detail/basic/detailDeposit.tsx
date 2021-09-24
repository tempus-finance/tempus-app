import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import Button from '@material-ui/core/Button';
import { mul18f } from '../../../utils/wei-math';
import NumberUtils from '../../../services/NumberUtils';
import CurrencyInput from '../../currencyInput';
import TokenSelector from '../../tokenSelector';
import Typography from '../../typography/Typography';
import Spacer from '../../spacer/spacer';
import ActionContainer from '../shared/actionContainer';
import Execute from '../shared/execute';
import SectionContainer from '../shared/sectionContainer';
import PoolDetailProps from '../shared/PoolDetailProps';

import '../shared/style.scss';

type SelectedYield = 'fixed' | 'variable';

const DetailDeposit: FC<PoolDetailProps> = ({
  selectedTab,
  tempusPool,
  content,
  signer,
  userWalletAddress,
  poolDataAdapter,
}) => {
  const { address, ammAddress } = tempusPool || {};
  const { supportedTokens = [], fixedAPR = 0, variableAPY = 0 } = content || {};
  const [backingToken] = supportedTokens;

  const [selectedToken, setSelectedToken] = useState<string | undefined>(undefined);
  const [amount, setAmount] = useState<BigNumber>(BigNumber.from('0'));
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from('0'));
  const [usdRate, setUsdRate] = useState<BigNumber>(BigNumber.from('0'));
  const [minTYSRate] = useState<number>(0); // TODO where to get this value?

  const [fixedPrincipalsAmount, setFixedPrincipalsAmount] = useState<number | undefined>(undefined);
  const [variablePrincipalsAmount, setVariablePrincipalsAmount] = useState<number | undefined>(undefined);
  const [variableLpTokensAmount, setVariableLpTokensAmount] = useState<number | undefined>(undefined);

  const [backingTokenBalance, setBackingTokenBalance] = useState<BigNumber>(BigNumber.from('0'));
  const [yieldBearingTokenBalance, setYieldBearingTokenBalance] = useState<BigNumber>(BigNumber.from('0'));

  const [selectedYield, setSelectedYield] = useState<SelectedYield>('fixed');
  const [backingTokenRate, setBackingTokenRate] = useState<BigNumber>(BigNumber.from('0'));
  const [yieldBearingTokenRate, setYieldBearingTokenRate] = useState<BigNumber>(BigNumber.from('0'));

  const [balanceFormatted, setBalanceFormatted] = useState<string>('');
  // TODO - Use BigNumber to avoid overflows when converting from BigNumber to Number.
  const [amountFormatted, setAmountFormatted] = useState<number>(0);

  const [approveDisabled, setApproveDisabled] = useState<boolean>(false);
  const [executeDisabled, setExecuteDisabled] = useState<boolean>(true);

  const onTokenChange = useCallback(
    (token: string | undefined) => {
      if (!!token) {
        setSelectedToken(token);

        if (backingToken === token) {
          setBalance(backingTokenBalance);
          setUsdRate(backingTokenRate);
        }

        if (backingToken !== token) {
          setBalance(yieldBearingTokenBalance);
          setUsdRate(yieldBearingTokenRate);
        }
      }
    },
    [
      backingToken,
      backingTokenBalance,
      backingTokenRate,
      yieldBearingTokenBalance,
      yieldBearingTokenRate,
      setSelectedToken,
      setBalance,
    ],
  );

  const onAmountChange = useCallback(
    (value: number | undefined) => {
      if (!!value && !isNaN(value)) {
        setAmount(ethers.utils.parseEther(value.toString()));
      } else {
        setAmount(BigNumber.from('0'));
      }
    },
    [setAmount],
  );

  const onClickPercentage = useCallback(
    (percentage: number) => {
      setAmount(mul18f(balance, ethers.utils.parseEther(percentage.toString())));
    },
    [balance, setAmount],
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
      if (signer && poolDataAdapter) {
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
      if (signer) {
        try {
          const isBackingToken = backingToken === selectedToken;
          const parsedMinTYSRate = ethers.utils.parseEther(minTYSRate.toString());
          const depositTransaction = await poolDataAdapter?.executeDeposit(
            ammAddress,
            amount,
            isBackingToken,
            parsedMinTYSRate,
          );
          await depositTransaction?.wait();
          setExecuteDisabled(false);
        } catch (err) {
          // TODO handle errors
          console.log('onExecute err', err);
        }
      }
    };

    setExecuteDisabled(true);
    execute();
  }, [signer, ammAddress, backingToken, selectedToken, amount, minTYSRate, poolDataAdapter, setExecuteDisabled]);

  useMemo(() => {
    setBalanceFormatted(NumberUtils.formatWithMultiplier(ethers.utils.formatEther(balance)));
    setAmountFormatted(Number(ethers.utils.formatEther(amount)));
  }, [balance, amount]);

  useEffect(() => {
    const retrieveBalances = async () => {
      if (signer && address && ammAddress && poolDataAdapter) {
        try {
          const { backingTokenBalance, backingTokenRate, yieldBearingTokenBalance, yieldBearingTokenRate } =
            (await poolDataAdapter.retrieveBalances(address, ammAddress, userWalletAddress, signer)) || {};

          setBackingTokenBalance(backingTokenBalance);
          setBackingTokenRate(backingTokenRate);
          setYieldBearingTokenBalance(yieldBearingTokenBalance);
          setYieldBearingTokenRate(yieldBearingTokenRate);
        } catch (err) {
          // TODO handle errors
          console.log('Detail Deposit - retrieveBalances -', err);
        }
      }
    };

    retrieveBalances();
  }, [
    signer,
    address,
    ammAddress,
    userWalletAddress,
    poolDataAdapter,
    setBackingTokenBalance,
    setBackingTokenRate,
    setYieldBearingTokenRate,
    setYieldBearingTokenBalance,
  ]);

  useEffect(() => {
    const retrieveDepositAmount = async () => {
      if (amount && ammAddress && poolDataAdapter) {
        try {
          const isBackingToken = backingToken === selectedToken;

          const { fixedDeposit, variableDeposit } =
            (await poolDataAdapter.getEstimatedDepositAmount(ammAddress, amount, isBackingToken)) || {};

          if (fixedDeposit !== undefined) {
            setFixedPrincipalsAmount(fixedDeposit);
          }

          if (variableDeposit) {
            const [variablePrincipals, , variableLpTokens] = variableDeposit;
            if (variablePrincipals !== undefined) {
              setVariablePrincipalsAmount(variablePrincipals);
            }
            if (variableLpTokens !== undefined) {
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
    setApproveDisabled(!amount || !selectedYield);
  }, [amount, selectedYield, setApproveDisabled]);

  return (
    <div role="tabpanel" hidden={selectedTab !== 0}>
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
                Balance: {selectedToken ? `${balanceFormatted} ${selectedToken}` : '-'}
              </Typography>
            </div>
            <Spacer size={14} />
            <div className="tf__dialog__flex-row">
              <div className="tf__dialog__label-align-right">
                <Typography variant="body-text">Amount</Typography>
              </div>
              <CurrencyInput defaultValue={amountFormatted} onChange={onAmountChange} disabled={!selectedToken} />
              <Spacer size={20} />
              <Button variant="contained" size="small" onClick={() => onClickPercentage(0.25)}>
                25%
              </Button>
              <Spacer size={10} />
              <Button variant="contained" size="small" onClick={() => onClickPercentage(0.5)}>
                50%
              </Button>
              <Spacer size={10} />
              <Button value="tps" variant="contained" size="small" onClick={() => onClickPercentage(0.75)}>
                75%
              </Button>
              <Spacer size={10} />
              <Button value="tps" variant="contained" size="small" onClick={() => onClickPercentage(1)}>
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
                tooltip="Waiting for text..."
                selectable={true}
                selected={selectedYield === 'fixed'}
              >
                <div className="tf__dialog__flex-col-space-between" yield-attribute="fixed" onClick={onSelectYield}>
                  <Typography variant="h4">Fixed Yield</Typography>
                  <Typography variant="body-text">
                    est. {fixedPrincipalsAmount ? new Intl.NumberFormat().format(fixedPrincipalsAmount) : '-'}{' '}
                    Principals
                  </Typography>
                  <Typography variant="h3" color="accent">
                    est. {NumberUtils.formatPercentage(fixedAPR, 2)}
                  </Typography>
                </div>
              </SectionContainer>
            </div>

            <Spacer size={20} />

            <div className="tf__dialog__flex-row-half-width">
              <SectionContainer
                title="Liquidity provision"
                tooltip="Waiting for text..."
                selectable={true}
                selected={selectedYield === 'variable'}
              >
                <div className="tf__dialog__flex-col-space-between" yield-attribute="variable" onClick={onSelectYield}>
                  <Typography variant="h4">Variable Yield</Typography>
                  <div>
                    <Typography variant="body-text">
                      est. {variablePrincipalsAmount ? new Intl.NumberFormat().format(variablePrincipalsAmount) : '-'}{' '}
                      Principals
                    </Typography>
                    <Typography variant="body-text">
                      est. {variableLpTokensAmount ? new Intl.NumberFormat().format(variableLpTokensAmount) : '-'} LP
                      Tokens
                    </Typography>
                  </div>
                  <Typography variant="h3" color="accent">
                    est. {NumberUtils.formatPercentage(variableAPY, 2)}
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
