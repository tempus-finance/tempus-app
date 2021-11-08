import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { catchError } from 'rxjs';
import { LanguageContext } from '../../context/languageContext';
import { getDataForPool, PoolDataContext } from '../../context/poolDataContext';
import { WalletContext } from '../../context/walletContext';
import { Ticker } from '../../interfaces/Token';
import { SelectedYield } from '../../interfaces/SelectedYield';
import getText from '../../localisation/getText';
import getConfig from '../../utils/getConfig';
import getTokenPrecision from '../../utils/getTokenPrecision';
import { isZeroString } from '../../utils/isZeroString';
import { mul18f } from '../../utils/weiMath';
import NumberUtils from '../../services/NumberUtils';
import Approve from '../buttons/Approve';
import Execute from '../buttons/Execute';
import OperationsSharedProps from '../shared/OperationsSharedProps';
import CurrencyInput from '../currencyInput/currencyInput';
import TokenSelector from '../tokenSelector/tokenSelector';
import Typography from '../typography/Typography';
import TokenIcon from '../tokenIcon';
import SectionContainer from '../sectionContainer/SectionContainer';
import Spacer from '../spacer/spacer';

import './Deposit.scss';

type DepositInProps = {
  narrow: boolean;
};

type DepositProps = DepositInProps & OperationsSharedProps;

const Deposit: FC<DepositProps> = ({ narrow, poolDataAdapter }) => {
  const { language } = useContext(LanguageContext);
  const { userWalletSigner } = useContext(WalletContext);
  const { userWalletAddress } = useContext(WalletContext);
  const { poolData, selectedPool } = useContext(PoolDataContext);

  const [isYieldNegative, setIsYieldNegative] = useState<boolean | null>(null);
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

  const [tokenPrecision, setTokenPrecision] = useState<number>(0);

  const activePoolData = useMemo(() => {
    return getDataForPool(selectedPool, poolData);
  }, [poolData, selectedPool]);

  const onTokenChange = useCallback(
    (token: Ticker | undefined) => {
      if (!!token) {
        setSelectedToken(token);
        setAmount('');

        if (activePoolData.backingToken === token) {
          setTokenPrecision(getTokenPrecision(activePoolData.address, 'backingToken'));
          if (backingTokenRate !== null) {
            setUsdRate(backingTokenRate);
          }
        }

        if (activePoolData.backingToken !== token) {
          setTokenPrecision(getTokenPrecision(activePoolData.address, 'yieldBearingToken'));
          if (yieldBearingTokenRate !== null) {
            setUsdRate(yieldBearingTokenRate);
          }
        }
      }
    },
    [activePoolData, backingTokenRate, yieldBearingTokenRate, setSelectedToken, setAmount],
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

  const onClickMax = useCallback(() => {
    const data = getDataForPool(activePoolData.address, poolData);

    let currentBalance: BigNumber;
    if (selectedToken === activePoolData.backingToken) {
      if (!data.userBackingTokenBalance) {
        return;
      }
      currentBalance = data.userBackingTokenBalance;
    } else {
      if (!data.userYieldBearingTokenBalance) {
        return;
      }
      currentBalance = data.userYieldBearingTokenBalance;
    }

    setAmount(ethers.utils.formatUnits(currentBalance, tokenPrecision));
  }, [activePoolData, poolData, selectedToken, tokenPrecision]);

  const onSelectYield = useCallback(
    (value: string) => {
      if (value === 'Fixed' || value === 'Variable') {
        setSelectedYield(value);
      }
    },
    [setSelectedYield],
  );

  const getSelectedTokenBalance = useCallback((): BigNumber | null => {
    if (!selectedToken) {
      return null;
    }
    const data = getDataForPool(activePoolData.address, poolData);

    return selectedToken === activePoolData.backingToken
      ? data.userBackingTokenBalance
      : data.userYieldBearingTokenBalance;
  }, [activePoolData, poolData, selectedToken]);

  const getSelectedTokenAddress = useCallback((): string | null => {
    if (!selectedToken) {
      return null;
    }
    return selectedToken === activePoolData.backingToken
      ? activePoolData.backingTokenAddress
      : activePoolData.yieldBearingTokenAddress;
  }, [activePoolData, selectedToken]);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (userWalletSigner && amount && poolDataAdapter) {
      const tokenAmount = ethers.utils.parseUnits(amount, tokenPrecision);
      const isBackingToken = activePoolData.backingToken === selectedToken;
      const parsedMinTYSRate = ethers.utils.parseUnits(minTYSRate.toString(), tokenPrecision);
      const isEthDeposit = selectedToken === 'ETH';
      return poolDataAdapter.executeDeposit(
        activePoolData.ammAddress,
        tokenAmount,
        isBackingToken,
        parsedMinTYSRate,
        selectedYield,
        isEthDeposit,
      );
    } else {
      return Promise.resolve(undefined);
    }
  }, [
    activePoolData,
    userWalletSigner,
    poolDataAdapter,
    tokenPrecision,
    selectedToken,
    selectedYield,
    amount,
    minTYSRate,
  ]);

  const onExecuted = useCallback(() => {
    setAmount('');
  }, []);

  const onApproveChange = useCallback(approved => {
    setTokensApproved(approved);
  }, []);

  useEffect(() => {
    if (userWalletSigner && activePoolData.address && activePoolData.ammAddress && poolDataAdapter) {
      const stream$ = poolDataAdapter
        .retrieveBalances(activePoolData.address, activePoolData.ammAddress, userWalletAddress, userWalletSigner)
        .pipe(
          catchError((error, caught) => {
            console.log('DetailDeposit - retrieveTokenRates - Failed to retrieve token rates!', error);
            return caught;
          }),
        )
        .subscribe((result: { backingTokenRate: BigNumber; yieldBearingTokenRate: BigNumber }) => {
          if (result) {
            setBackingTokenRate(result.backingTokenRate);
            setYieldBearingTokenRate(result.yieldBearingTokenRate);
          }
        });

      return () => stream$.unsubscribe();
    }
  }, [
    activePoolData,
    userWalletSigner,
    userWalletAddress,
    selectedToken,
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
      } else if (activePoolData.ammAddress && poolDataAdapter) {
        try {
          setTokenEstimateInProgress(true);

          const isBackingToken = activePoolData.backingToken === selectedToken;

          const { fixedDeposit, variableDeposit } =
            (await poolDataAdapter.getEstimatedDepositAmount(
              activePoolData.ammAddress,
              ethers.utils.parseUnits(amount, tokenPrecision),
              isBackingToken,
            )) || {};
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
    activePoolData,
    amount,
    tokenPrecision,
    selectedToken,
    poolDataAdapter,
    setFixedPrincipalsAmount,
    setVariablePrincipalsAmount,
    setVariableLpTokensAmount,
  ]);

  useEffect(() => {
    const getEstimatedFixedApr = async () => {
      if (amount && amount !== '0' && selectedToken && poolDataAdapter) {
        setRateEstimateInProgress(true);
        const isBackingToken = selectedToken === activePoolData.backingToken;
        try {
          const fixedAPREstimate = await poolDataAdapter.getEstimatedFixedApr(
            ethers.utils.parseUnits(amount, tokenPrecision),
            isBackingToken,
            activePoolData.address,
            activePoolData.ammAddress,
          );

          setEstimatedFixedApr(fixedAPREstimate);
          setRateEstimateInProgress(false);
        } catch (error) {
          console.log('Deposit - getEstimatedFixedApr() - Failed to fetch estimated fixed APR!', error);
          setRateEstimateInProgress(false);
        }
      } else {
        setEstimatedFixedApr(null);
      }
    };

    getEstimatedFixedApr();
  }, [activePoolData, amount, selectedToken, tokenPrecision, poolDataAdapter, setEstimatedFixedApr]);

  useEffect(() => {
    if (!poolDataAdapter) {
      return;
    }

    const stream$ = poolDataAdapter
      .isCurrentYieldNegativeForPool(activePoolData.address)
      .pipe(
        catchError((error, caught) => {
          console.log('Deposit - isCurrentYieldNegativeForPool - Failed to retrieve current yield!', error);
          return caught;
        }),
      )
      .subscribe(isYieldNegative => {
        setIsYieldNegative(isYieldNegative);
      });

    return () => stream$.unsubscribe();
  }, [activePoolData, poolDataAdapter]);

  const fixedPrincipalsAmountFormatted = useMemo(() => {
    if (!fixedPrincipalsAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(fixedPrincipalsAmount, tokenPrecision),
      activePoolData.decimalsForUI,
    );
  }, [activePoolData, fixedPrincipalsAmount, tokenPrecision]);

  const variablePrincipalsAmountFormatted = useMemo(() => {
    if (!variablePrincipalsAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(variablePrincipalsAmount, tokenPrecision),
      activePoolData.decimalsForUI,
    );
  }, [activePoolData, variablePrincipalsAmount, tokenPrecision]);

  const variableLpTokensAmountFormatted = useMemo(() => {
    if (!variableLpTokensAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(variableLpTokensAmount, tokenPrecision),
      activePoolData.decimalsForUI,
    );
  }, [activePoolData, variableLpTokensAmount, tokenPrecision]);

  const balanceFormatted = useMemo(() => {
    let currentBalance = getSelectedTokenBalance();
    if (!currentBalance) {
      return null;
    }

    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(currentBalance, tokenPrecision),
      activePoolData.decimalsForUI,
    );
  }, [activePoolData, getSelectedTokenBalance, tokenPrecision]);

  const usdValueFormatted = useMemo(() => {
    if (!usdRate || !amount) {
      return null;
    }

    let usdValue = mul18f(usdRate, ethers.utils.parseUnits(amount, tokenPrecision), tokenPrecision);

    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(usdValue, tokenPrecision), 2, '$');
  }, [tokenPrecision, usdRate, amount]);

  const variableAPRFormatted = useMemo(() => {
    const poolContextData = getDataForPool(activePoolData.address, poolData);

    return NumberUtils.formatPercentage(poolContextData.variableAPR, 2);
  }, [activePoolData, poolData]);

  const fixedAPRFormatted = useMemo(() => {
    const poolContextData = getDataForPool(activePoolData.address, poolData);

    return NumberUtils.formatPercentage(poolContextData.fixedAPR, 2);
  }, [activePoolData, poolData]);

  const fixedYieldAtMaturityFormatted = useMemo(() => {
    if (!fixedPrincipalsAmount || !amount || isZeroString(amount)) {
      return null;
    }

    const value = fixedPrincipalsAmount.sub(ethers.utils.parseEther(amount));

    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(value, tokenPrecision), 2);
  }, [amount, fixedPrincipalsAmount, tokenPrecision]);

  const fixedYieldAtMaturityUSDFormatted = useMemo(() => {
    if (!fixedPrincipalsAmount || !yieldBearingTokenRate || !amount || isZeroString(amount)) {
      return null;
    }

    const value = fixedPrincipalsAmount.sub(ethers.utils.parseEther(amount));

    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(mul18f(value, yieldBearingTokenRate, tokenPrecision), tokenPrecision),
      2,
      '$',
    );
  }, [amount, fixedPrincipalsAmount, tokenPrecision, yieldBearingTokenRate]);

  const totalAvailableAtMaturityFormatted = useMemo(() => {
    if (!fixedPrincipalsAmount) {
      return null;
    }

    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(fixedPrincipalsAmount, tokenPrecision), 2);
  }, [fixedPrincipalsAmount, tokenPrecision]);

  const totalAvailableAtMaturityUSDFormatted = useMemo(() => {
    if (!fixedPrincipalsAmount || !yieldBearingTokenRate) {
      return null;
    }

    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(mul18f(fixedPrincipalsAmount, yieldBearingTokenRate, tokenPrecision), tokenPrecision),
      2,
      '$',
    );
  }, [fixedPrincipalsAmount, tokenPrecision, yieldBearingTokenRate]);

  const depositDisabled = useMemo((): boolean => {
    return isYieldNegative === null ? true : isYieldNegative;
  }, [isYieldNegative]);

  const approveDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);

    return zeroAmount || depositDisabled;
  }, [amount, depositDisabled]);

  const executeDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsBalance = ethers.utils
      .parseUnits(amount || '0', tokenPrecision)
      .gt(getSelectedTokenBalance() || BigNumber.from('0'));

    return (
      !tokensApproved ||
      zeroAmount ||
      amountExceedsBalance ||
      rateEstimateInProgress ||
      tokenEstimateInProgress ||
      depositDisabled
    );
  }, [
    amount,
    tokenPrecision,
    getSelectedTokenBalance,
    rateEstimateInProgress,
    tokenEstimateInProgress,
    tokensApproved,
    depositDisabled,
  ]);

  return (
    <div className={`tc__deposit ${narrow ? 'tc__deposit__narrow' : ''}`}>
      <SectionContainer title="from">
        <div className="tf__flex-row-center-v">
          <TokenSelector
            tickers={[activePoolData.backingToken, activePoolData.yieldBearingToken]}
            onTokenChange={onTokenChange}
          />
          <Spacer size={15} />
          <div className="tf__flex-column-start">
            <CurrencyInput
              defaultValue={amount}
              onChange={onAmountChange}
              onMaxClick={onClickMax}
              disabled={!selectedToken || depositDisabled}
              // TODO - Update text in case input is disabled because of negative yield
              disabledTooltip="Please select the token first"
            />
            {usdValueFormatted && (
              <div className="tf__input__label">
                <Typography variant="disclaimer-text">{usdValueFormatted}</Typography>
              </div>
            )}
          </div>
          <Spacer size={15} />
          {selectedToken && balanceFormatted && (
            <Typography variant="body-text">
              {getText('balance', language)} {balanceFormatted}
            </Typography>
          )}
          <Spacer size={10} />
          {selectedToken && <TokenIcon ticker={selectedToken} width={20} height={20} />}
        </div>
        <Spacer size={20} />
      </SectionContainer>
      <Spacer size={15} />
      <SectionContainer title="to">
        <div className="tc__deposit__to__body">
          <SectionContainer id="Fixed" selectable selected={selectedYield === 'Fixed'} onSelected={onSelectYield}>
            <div className="tf__flex-row-space-between-v">
              <Typography variant="h2">{getText('fixYourFutureYield', language)}</Typography>
              <Typography variant="body-text" color="title">
                {getText('fixedYield', language)}
              </Typography>
            </div>
            <Spacer size={20} />
            {fixedYieldAtMaturityFormatted && fixedYieldAtMaturityUSDFormatted && (
              <div className="tc__deposit__yield-body__row">
                <div className="tc__deposit__card-row-title">
                  <Typography variant="body-text" color="title">
                    {getText('fixedYieldAtMaturity', language)}
                  </Typography>
                </div>
                <div className="tc__deposit__card-row-change">
                  <Typography variant="body-text" color="success">
                    {`+${fixedYieldAtMaturityFormatted} ${activePoolData.yieldBearingToken}`}
                  </Typography>
                </div>
                <div className="tc__deposit__card-row-value">
                  <Typography variant="body-text" color="success">
                    {`+${fixedYieldAtMaturityUSDFormatted}`}
                  </Typography>
                </div>
              </div>
            )}
            {totalAvailableAtMaturityFormatted && totalAvailableAtMaturityUSDFormatted && (
              <div className="tc__deposit__yield-body__row">
                <div className="tc__deposit__card-row-title">
                  <Typography variant="body-text" color="title">
                    {getText('totalAvailableAtMaturity', language)}
                  </Typography>
                </div>
                <div className="tc__deposit__card-row-change">
                  <Typography variant="body-text">
                    {`${totalAvailableAtMaturityFormatted} ${activePoolData.yieldBearingToken}`}
                  </Typography>
                </div>
                <div className="tc__deposit__card-row-value">
                  <Typography variant="body-text">{totalAvailableAtMaturityUSDFormatted}</Typography>
                </div>
              </div>
            )}
            <Spacer size={30} />
            <div className="tf__flex-row-space-between-v">
              <Typography variant="button-text">
                {fixedPrincipalsAmountFormatted &&
                  `${fixedPrincipalsAmountFormatted} ${getText('principals', language)}`}
              </Typography>
              <Typography variant="button-text" color="accent">
                APR{' '}
                {estimatedFixedApr
                  ? NumberUtils.formatPercentage(ethers.utils.formatUnits(estimatedFixedApr, tokenPrecision))
                  : fixedAPRFormatted}
              </Typography>
            </div>
          </SectionContainer>
          <Spacer size={15} />
          <SectionContainer id="Variable" selectable selected={selectedYield === 'Variable'} onSelected={onSelectYield}>
            <div className="tf__flex-row-space-between-v">
              <Typography variant="h2">{getText('provideLiquidity', language)}</Typography>
              <Typography variant="body-text" color="title">
                {getText('variableYield', language)}
              </Typography>
            </div>
            <Spacer size={15} />
            <div className="tf__flex-row-space-between-v">
              <Typography variant="button-text">
                {' '}
                {variablePrincipalsAmountFormatted &&
                  `${variablePrincipalsAmountFormatted} ${getText('principals', language)}`}
              </Typography>
            </div>
            <div className="tf__flex-row-space-between-v">
              <Typography variant="button-text">
                {variableLpTokensAmountFormatted &&
                  `${variableLpTokensAmountFormatted} ${getText('lpTokens', language)}`}
              </Typography>
              <Typography variant="button-text" color="accent">
                APR {variableAPRFormatted}
              </Typography>
            </div>
          </SectionContainer>
        </div>
        <Spacer size={15} />
        <div className="tf__flex-row-center-vh">
          <Approve
            tokenToApproveAddress={getSelectedTokenAddress()}
            spenderAddress={getConfig().tempusControllerContract}
            amountToApprove={getSelectedTokenBalance()}
            tokenToApproveTicker={selectedToken}
            disabled={approveDisabled}
            marginRight={20}
            onApproveChange={onApproveChange}
          />
          <Execute
            actionName="Deposit"
            actionDescription={selectedYield === 'Fixed' ? 'Fixed Yield' : 'Variable Yield'}
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

export default Deposit;
