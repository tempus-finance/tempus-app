import { CircularProgress } from '@material-ui/core';
import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { ethers, BigNumber } from 'ethers';
import { catchError } from 'rxjs';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import getUserShareTokenBalanceProvider from '../../providers/getUserShareTokenBalanceProvider';
import { ETH_ALLOWANCE_FOR_GAS, ZERO } from '../../constants';
import { LanguageContext } from '../../context/languageContext';
import { WalletContext } from '../../context/walletContext';
import { UserSettingsContext } from '../../context/userSettingsContext';
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
import InfoTooltip from '../infoTooltip/infoTooltip';

import './Deposit.scss';

type DepositInProps = {
  narrow: boolean;
};

type DepositProps = DepositInProps & OperationsSharedProps;

const Deposit: FC<DepositProps> = ({ narrow, poolDataAdapter }) => {
  const selectedPool = useHookState(selectedPoolState);
  const staticPoolData = useHookState(staticPoolDataState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);

  const { language } = useContext(LanguageContext);
  const { userWalletSigner } = useContext(WalletContext);
  const { userWalletAddress } = useContext(WalletContext);
  const { slippage, autoSlippage } = useContext(UserSettingsContext);

  const [isYieldNegative, setIsYieldNegative] = useState<boolean | null>(null);
  const [selectedToken, setSelectedToken] = useState<Ticker | null>(null);
  const [amount, setAmount] = useState<string>('');

  const [usdRate, setUsdRate] = useState<BigNumber | null>(null);

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

  const [executeDisabledText, setExecuteDisabledText] = useState<string | undefined>(undefined);

  const selectedPoolAddress = selectedPool.attach(Downgraded).get();
  const fixedAPR = dynamicPoolData[selectedPool.get()].fixedAPR.attach(Downgraded).get();
  const variableAPR = dynamicPoolData[selectedPool.get()].variableAPR.attach(Downgraded).get();
  const userBackingTokenBalance = dynamicPoolData[selectedPool.get()].userBackingTokenBalance.attach(Downgraded).get();
  const userYieldBearingTokenBalance = dynamicPoolData[selectedPool.get()].userYieldBearingTokenBalance
    .attach(Downgraded)
    .get();
  const spotPrice = staticPoolData[selectedPool.get()].spotPrice.attach(Downgraded).get();
  const backingToken = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
  const yieldBearingToken = staticPoolData[selectedPool.get()].yieldBearingToken.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const backingTokenAddress = staticPoolData[selectedPool.get()].backingTokenAddress.attach(Downgraded).get();
  const yieldBearingTokenAddress = staticPoolData[selectedPool.get()].yieldBearingTokenAddress.attach(Downgraded).get();
  const decimalsForUI = staticPoolData[selectedPool.get()].decimalsForUI.attach(Downgraded).get();
  const poolId = staticPoolData[selectedPool.get()].poolId.attach(Downgraded).get();

  const onTokenChange = useCallback(
    (token: Ticker | undefined) => {
      if (!!token) {
        setSelectedToken(token);
        setAmount('');

        if (backingToken === token) {
          setTokenPrecision(getTokenPrecision(selectedPoolAddress, 'backingToken'));
          if (backingTokenRate !== null) {
            setUsdRate(backingTokenRate);
          }
        }

        if (backingToken !== token) {
          setTokenPrecision(getTokenPrecision(selectedPoolAddress, 'yieldBearingToken'));
          if (yieldBearingTokenRate !== null) {
            setUsdRate(yieldBearingTokenRate);
          }
        }
      }
    },
    [backingToken, selectedPoolAddress, backingTokenRate, yieldBearingTokenRate],
  );

  const onAmountChange = useCallback(
    (value: string) => {
      if (value) {
        setAmount(value);
        setFixedPrincipalsAmount(null);
        setEstimatedFixedApr(null);
      } else {
        setAmount('');
      }
    },
    [setAmount],
  );

  const onClickMax = useCallback(() => {
    let currentBalance: BigNumber;
    if (selectedToken === backingToken) {
      if (!userBackingTokenBalance) {
        return;
      }

      const isEthDeposit = selectedToken === 'ETH';
      if (isEthDeposit) {
        currentBalance = userBackingTokenBalance.gt(ETH_ALLOWANCE_FOR_GAS)
          ? userBackingTokenBalance.sub(ETH_ALLOWANCE_FOR_GAS)
          : ZERO;
      } else {
        currentBalance = userBackingTokenBalance;
      }
    } else {
      if (!userYieldBearingTokenBalance) {
        return;
      }
      currentBalance = userYieldBearingTokenBalance;
    }

    setAmount(ethers.utils.formatUnits(currentBalance, tokenPrecision));
  }, [backingToken, selectedToken, tokenPrecision, userBackingTokenBalance, userYieldBearingTokenBalance]);

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

    return selectedToken === backingToken ? userBackingTokenBalance : userYieldBearingTokenBalance;
  }, [backingToken, selectedToken, userBackingTokenBalance, userYieldBearingTokenBalance]);

  const getSelectedTokenAddress = useCallback((): string | null => {
    if (!selectedToken) {
      return null;
    }
    return selectedToken === backingToken ? backingTokenAddress : yieldBearingTokenAddress;
  }, [backingTokenAddress, yieldBearingTokenAddress, backingToken, selectedToken]);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (userWalletSigner && amount && poolDataAdapter) {
      const tokenAmount = ethers.utils.parseUnits(amount, tokenPrecision);
      const isBackingToken = backingToken === selectedToken;
      const isEthDeposit = selectedToken === 'ETH';
      const actualSlippage = (autoSlippage ? 1 : slippage / 100).toString();
      const principalsPrecision = getTokenPrecision(selectedPoolAddress, 'principals');
      const yieldsPrecision = getTokenPrecision(selectedPoolAddress, 'yields');
      const slippageFormatted = ethers.utils.parseUnits(actualSlippage, principalsPrecision);

      return poolDataAdapter.executeDeposit(
        ammAddress,
        tokenAmount,
        isBackingToken,
        selectedYield,
        slippageFormatted,
        yieldsPrecision,
        spotPrice,
        isEthDeposit,
      );
    } else {
      return Promise.resolve(undefined);
    }
  }, [
    userWalletSigner,
    amount,
    poolDataAdapter,
    tokenPrecision,
    backingToken,
    selectedToken,
    autoSlippage,
    slippage,
    selectedPoolAddress,
    ammAddress,
    selectedYield,
    spotPrice,
  ]);

  const onExecuted = useCallback(() => {
    setAmount('');

    if (!userWalletSigner) {
      return;
    }

    // Trigger user pool share balance update when execute is finished
    getUserShareTokenBalanceProvider({
      userWalletAddress,
      userWalletSigner,
    }).fetchForPool(selectedPoolAddress);
  }, [selectedPoolAddress, userWalletAddress, userWalletSigner]);

  const onApproveChange = useCallback(approved => {
    setTokensApproved(approved);
  }, []);

  useEffect(() => {
    if (userWalletSigner && selectedPoolAddress && ammAddress && poolDataAdapter) {
      const stream$ = poolDataAdapter
        .retrieveBalances(selectedPoolAddress, ammAddress, userWalletAddress, userWalletSigner)
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
    selectedPoolAddress,
    userWalletSigner,
    userWalletAddress,
    selectedToken,
    poolDataAdapter,
    setBackingTokenRate,
    setYieldBearingTokenRate,
    ammAddress,
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

          const { fixedDeposit, variableDeposit } =
            (await poolDataAdapter.getEstimatedDepositAmount(
              ammAddress,
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
    amount,
    tokenPrecision,
    selectedToken,
    poolDataAdapter,
    setFixedPrincipalsAmount,
    setVariablePrincipalsAmount,
    setVariableLpTokensAmount,
    ammAddress,
    backingToken,
  ]);

  useEffect(() => {
    const getEstimatedFixedApr = async () => {
      if (!isZeroString(amount) && selectedToken && poolDataAdapter) {
        setRateEstimateInProgress(true);
        const isBackingToken = selectedToken === backingToken;
        try {
          const fixedAPREstimate = await poolDataAdapter.getEstimatedFixedApr(
            ethers.utils.parseUnits(amount, tokenPrecision),
            isBackingToken,
            selectedPoolAddress,
            poolId,
            ammAddress,
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
  }, [
    selectedPoolAddress,
    amount,
    selectedToken,
    poolId,
    tokenPrecision,
    poolDataAdapter,
    setEstimatedFixedApr,
    backingToken,
    ammAddress,
  ]);

  useEffect(() => {
    if (!poolDataAdapter) {
      return;
    }

    const stream$ = poolDataAdapter
      .isCurrentYieldNegativeForPool(selectedPoolAddress)
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
  }, [selectedPoolAddress, poolDataAdapter]);

  const fixedPrincipalsAmountFormatted = useMemo(() => {
    if (!fixedPrincipalsAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(fixedPrincipalsAmount, tokenPrecision), decimalsForUI);
  }, [decimalsForUI, fixedPrincipalsAmount, tokenPrecision]);

  const variablePrincipalsAmountFormatted = useMemo(() => {
    if (!variablePrincipalsAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(variablePrincipalsAmount, tokenPrecision),
      decimalsForUI,
    );
  }, [variablePrincipalsAmount, tokenPrecision, decimalsForUI]);

  const variableLpTokensAmountFormatted = useMemo(() => {
    if (!variableLpTokensAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(variableLpTokensAmount, tokenPrecision),
      decimalsForUI,
    );
  }, [variableLpTokensAmount, tokenPrecision, decimalsForUI]);

  const balanceFormatted = useMemo(() => {
    let currentBalance = getSelectedTokenBalance();
    if (!currentBalance) {
      return null;
    }

    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(currentBalance, tokenPrecision), decimalsForUI);
  }, [decimalsForUI, getSelectedTokenBalance, tokenPrecision]);

  const usdValueFormatted = useMemo(() => {
    if (!usdRate || !amount) {
      return null;
    }

    let usdValue = mul18f(usdRate, ethers.utils.parseUnits(amount, tokenPrecision), tokenPrecision);

    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(usdValue, tokenPrecision), 2, '$');
  }, [tokenPrecision, usdRate, amount]);

  const variableAPRFormatted = useMemo(() => {
    return NumberUtils.formatPercentage(variableAPR, 2);
  }, [variableAPR]);

  const fixedAPRFormatted = useMemo(() => NumberUtils.formatPercentage(fixedAPR, 2), [fixedAPR]);

  const estimatedFixedAPRFormatted = useMemo(() => {
    if (estimatedFixedApr) {
      if (estimatedFixedApr.gt(ZERO)) {
        setExecuteDisabledText(undefined);
        return NumberUtils.formatPercentage(ethers.utils.formatUnits(estimatedFixedApr, tokenPrecision));
      } else {
        setExecuteDisabledText(getText('insufficientLiquidity', language));
        return ZERO;
      }
    }
    return null;
  }, [estimatedFixedApr, tokenPrecision, language]);

  const fixedYieldAtMaturityFormatted = useMemo(() => {
    if (!fixedPrincipalsAmount || !amount || isZeroString(amount)) {
      return null;
    }

    const value = fixedPrincipalsAmount.sub(ethers.utils.parseEther(amount));

    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(value, tokenPrecision), decimalsForUI);
  }, [amount, fixedPrincipalsAmount, tokenPrecision, decimalsForUI]);

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

    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(fixedPrincipalsAmount, tokenPrecision), decimalsForUI);
  }, [fixedPrincipalsAmount, tokenPrecision, decimalsForUI]);

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

  const amountToApprove = useMemo(() => {
    if (amount) {
      return ethers.utils.parseEther(amount);
    }

    return ZERO;
  }, [amount]);

  const executeDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsBalance = ethers.utils
      .parseUnits(amount || '0', tokenPrecision)
      .gt(getSelectedTokenBalance() || BigNumber.from('0'));

    return (
      (estimatedFixedApr && estimatedFixedApr.lte(ZERO)) ||
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
    estimatedFixedApr,
    rateEstimateInProgress,
    tokenEstimateInProgress,
    tokensApproved,
    depositDisabled,
  ]);

  return (
    <div className={`tc__deposit ${narrow ? 'tc__deposit__narrow' : ''}`}>
      <SectionContainer title="from">
        {selectedToken && balanceFormatted && (
          <div className="tc__title-and-balance bottom-padded">
            <div></div>
            <Typography variant="body-text">
              {getText('balance', language)} {balanceFormatted}
            </Typography>
          </div>
        )}
        <div className="tf__flex-row-flex-start-v">
          <TokenSelector
            value={selectedToken}
            tickers={[backingToken, yieldBearingToken]}
            onTokenChange={onTokenChange}
          />
          <Spacer size={15} />
          <div>
            <CurrencyInput
              defaultValue={amount}
              onChange={onAmountChange}
              onMaxClick={onClickMax}
              disabled={!selectedToken || depositDisabled}
              // TODO - Update text in case input is disabled because of negative yield
              disabledTooltip={getText('selectTokenFirst', language)}
            />
            {selectedToken === 'ETH' && amount && (
              <div className="tf__input__label">
                <Typography variant="disclaimer-text" color="accent">
                  {getText('warningEthGasFees', language)}
                </Typography>
              </div>
            )}
            {usdValueFormatted && (
              <div className="tf__input__label">
                <Typography variant="disclaimer-text">{usdValueFormatted}</Typography>
              </div>
            )}
          </div>
          {selectedToken && (
            <>
              <Spacer size={10} />
              <div style={{ paddingTop: 10 }}>
                <TokenIcon ticker={selectedToken} width={20} height={20} />
              </div>
            </>
          )}
        </div>
        <Spacer size={20} />
      </SectionContainer>
      <Spacer size={15} />
      <SectionContainer title="to">
        <div className="tc__deposit__to__body">
          <SectionContainer id="Fixed" selectable selected={selectedYield === 'Fixed'} onSelected={onSelectYield}>
            <div className="tf__flex-row-space-between-v">
              <div className="tf__flex-row-center-v">
                <Typography variant="h4">{getText('fixYourFutureYield', language)}</Typography>
                <Spacer size={10} />
                <InfoTooltip text={getText('interestRateProtectionTooltipText', language)} />
              </div>
              <Typography variant="body-text" color="title">
                {getText('fixedYield', language)}
              </Typography>
            </div>
            <Spacer size={15} />
            {(tokenEstimateInProgress || (fixedYieldAtMaturityFormatted && fixedYieldAtMaturityUSDFormatted)) && (
              <div className="tc__deposit__yield-body__row">
                <div className="tc__deposit__card-row-title">
                  <Typography variant="body-text" color="title">
                    {getText('fixedYieldAtMaturity', language)}
                  </Typography>
                </div>
                <div className="tc__deposit__card-row-change">
                  <Typography variant="body-text" color="success">
                    {fixedYieldAtMaturityFormatted ? (
                      `+${fixedYieldAtMaturityFormatted} ${yieldBearingToken}`
                    ) : (
                      <CircularProgress size={14} />
                    )}
                  </Typography>
                </div>
                <div className="tc__deposit__card-row-value">
                  <Typography variant="body-text" color="success">
                    {fixedYieldAtMaturityUSDFormatted ? (
                      `+${fixedYieldAtMaturityUSDFormatted}`
                    ) : (
                      <CircularProgress size={14} />
                    )}
                  </Typography>
                </div>
              </div>
            )}
            {(tokenEstimateInProgress ||
              (totalAvailableAtMaturityFormatted && totalAvailableAtMaturityUSDFormatted)) && (
              <div className="tc__deposit__yield-body__row">
                <div className="tc__deposit__card-row-title">
                  <Typography variant="body-text" color="title">
                    {getText('totalAvailableAtMaturity', language)}
                  </Typography>
                </div>
                <div className="tc__deposit__card-row-change">
                  <Typography variant="body-text">
                    {totalAvailableAtMaturityFormatted ? (
                      `${totalAvailableAtMaturityFormatted} ${yieldBearingToken}`
                    ) : (
                      <CircularProgress size={14} />
                    )}
                  </Typography>
                </div>
                <div className="tc__deposit__card-row-value">
                  <Typography variant="body-text">
                    {totalAvailableAtMaturityUSDFormatted || <CircularProgress size={14} />}
                  </Typography>
                </div>
              </div>
            )}
            {(tokenEstimateInProgress ||
              (fixedYieldAtMaturityFormatted && fixedYieldAtMaturityUSDFormatted) ||
              (totalAvailableAtMaturityFormatted && totalAvailableAtMaturityUSDFormatted)) && <Spacer size={30} />}
            <div className="tf__flex-row-space-between-v">
              <Typography variant="button-text">
                {fixedPrincipalsAmountFormatted &&
                  `${fixedPrincipalsAmountFormatted} ${getText('principals', language)}`}
                {tokenEstimateInProgress && <CircularProgress size={14} />}
              </Typography>
              <Typography variant="button-text" color="accent">
                {estimatedFixedApr && `APR ${estimatedFixedAPRFormatted}`}
                {!estimatedFixedApr && !rateEstimateInProgress && `APR ${fixedAPRFormatted}`}
                {rateEstimateInProgress && <CircularProgress size={14} />}
              </Typography>
            </div>
          </SectionContainer>
          <Spacer size={15} />
          <SectionContainer id="Variable" selectable selected={selectedYield === 'Variable'} onSelected={onSelectYield}>
            <div className="tf__flex-row-space-between-v">
              <div className="tf__flex-row-center-v">
                <Typography variant="h4">{getText('provideLiquidity', language)}</Typography>
                <Spacer size={10} />
                <InfoTooltip text={getText('liquidityProvisionTooltipText', language)} />
              </div>
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
                {getText('apr', language)} {variableAPRFormatted}
              </Typography>
            </div>
          </SectionContainer>
        </div>
        <Spacer size={15} />
        <div className="tf__flex-row-center-vh">
          <Approve
            tokenToApproveAddress={getSelectedTokenAddress()}
            spenderAddress={getConfig().tempusControllerContract}
            amountToApprove={amountToApprove}
            tokenToApproveTicker={selectedToken}
            disabled={approveDisabled}
            marginRight={20}
            onApproveChange={onApproveChange}
          />
          <Execute
            actionName="Deposit"
            actionDescription={selectedYield === 'Fixed' ? 'Fixed Yield' : 'Variable Yield'}
            disabled={executeDisabled}
            executeDisabledText={executeDisabledText}
            onExecute={onExecute}
            onExecuted={onExecuted}
          />
        </div>
      </SectionContainer>
    </div>
  );
};

export default Deposit;
