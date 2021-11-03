import { FC, MouseEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
import './Deposit.scss';

type DepositInProps = {
  narrow: boolean;
};

type DepositOutProps = {};

type DepositProps = DepositInProps & DepositOutProps & OperationsSharedProps;

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
    (event: MouseEvent<HTMLDivElement>) => {
      const selectedYield = (event.currentTarget as HTMLDivElement).getAttribute('data-value');
      if (selectedYield && (selectedYield === 'Fixed' || selectedYield === 'Variable')) {
        setSelectedYield(selectedYield);
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
          console.log('DetailDeposit - getEstimatedFixedApr() - Failed to fetch estimated fixed APR!', error);
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
          console.log('DetailDeposit - isCurrentYieldNegativeForPool - Failed to retrieve current yield!', error);
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
      <div className="tc__deposit__from">
        <Typography variant="h1">{getText('from', language)}</Typography>
        <div className="tc__deposit__from__body">
          <div>
            <TokenSelector
              tickers={[activePoolData.backingToken, activePoolData.yieldBearingToken]}
              onTokenChange={onTokenChange}
            />
          </div>
          <div>
            <CurrencyInput
              defaultValue={amount}
              onChange={onAmountChange}
              onMaxClick={onClickMax}
              disabled={!selectedToken || depositDisabled}
            />
            {usdValueFormatted && (
              <div className="tf__input__label">
                <Typography variant="disclaimer-text">Approx {usdValueFormatted}</Typography>
              </div>
            )}
          </div>
          <div>
            <Typography variant="body-text">
              {getText('balance', language)}{' '}
              {selectedToken && balanceFormatted ? `${balanceFormatted} ${selectedToken}` : ''}
            </Typography>
            {selectedToken && <TokenIcon ticker={selectedToken} />}
          </div>
        </div>
      </div>
      <div className="tc__deposit__to">
        <Typography variant="h1">{getText('to', language)}</Typography>
        <div className="tc__deposit__to__body">
          <div className="tc__deposit__select-yield">
            <div
              className={`tc__deposit__yield tc__deposit__fixed-yield ${
                selectedYield === 'Fixed' ? 'tc__deposit__yield__selected' : ''
              }`}
              data-value="Fixed"
              onClick={onSelectYield}
            >
              <div className="tc__deposit__yield-title">
                <Typography variant="h2">{getText('fixYourFutureYield', language)}</Typography>
                <Typography variant="body-text" color="title">
                  {getText('fixedYield', language)}
                </Typography>
              </div>
              <div className="tc__deposit__yield-body">
                <div className="tc__deposit__yield-body__row">
                  <Typography variant="body-text" color="title">
                    {getText('fixedYieldAtMaturity', language)}
                  </Typography>
                  <div className="tc__deposit__yield-body__right">
                    <Typography variant="body-text" color="success">
                      +000.6{selectedToken}
                    </Typography>
                    <Typography variant="body-text" color="success">
                      +$400.123$
                    </Typography>
                  </div>
                </div>
                <div className="tc__deposit__yield-body__row">
                  <Typography variant="body-text" color="title">
                    {getText('totalAvailableAtMaturity', language)}
                  </Typography>
                  <div className="tc__deposit__yield-body__right">
                    <Typography variant="body-text">
                      {balanceFormatted}
                      {selectedToken}
                    </Typography>

                    <Typography variant="body-text">$1400.123$</Typography>
                  </div>
                </div>
              </div>
              <div className="tc__deposit__yield-bottom">
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
            </div>
            <div
              className={`tc__deposit__yield tc__deposit__variable-yield ${
                selectedYield === 'Variable' ? 'tc__deposit__yield__selected' : ''
              }`}
              data-value="Variable"
              onClick={onSelectYield}
            >
              <div className="tc__deposit__yield-title">
                <Typography variant="h2">{getText('provideLiquidity', language)}</Typography>
                <Typography variant="body-text" color="title">
                  {getText('variableYield', language)}
                </Typography>
              </div>
              <div className="tc__deposit__yield-body"></div>
              <div className="tc__deposit__yield-bottom">
                <Typography variant="button-text">
                  {' '}
                  {variablePrincipalsAmountFormatted &&
                    `${variablePrincipalsAmountFormatted} ${getText('principals', language)}`}
                </Typography>
              </div>
              <div className="tc__deposit__yield-bottom">
                <Typography variant="button-text">
                  {variableLpTokensAmountFormatted &&
                    `${variableLpTokensAmountFormatted} ${getText('lpTokens', language)}`}
                </Typography>
                <Typography variant="button-text" color="accent">
                  APR {variableAPRFormatted}
                </Typography>
              </div>
            </div>
          </div>
        </div>
        <div className="tc__deposit__actions">
          <Approve
            poolDataAdapter={poolDataAdapter}
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
      </div>
    </div>
  );
};

export default Deposit;
