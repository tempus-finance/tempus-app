import { CircularProgress } from '@material-ui/core';
import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { ethers, BigNumber } from 'ethers';
import { catchError, of } from 'rxjs';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import getUserShareTokenBalanceProvider from '../../providers/getUserShareTokenBalanceProvider';
import getUserBalanceProvider from '../../providers/getBalanceProvider';
import { ETH_ALLOWANCE_FOR_GAS, MILLISECONDS_IN_A_YEAR, ZERO } from '../../constants';
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
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import Approve from '../buttons/Approve';
import Execute from '../buttons/Execute';
import CurrencyInput from '../currencyInput/currencyInput';
import TokenSelector from '../tokenSelector/tokenSelector';
import Typography from '../typography/Typography';
import SectionContainer from '../sectionContainer/SectionContainer';
import Spacer from '../spacer/spacer';
import InfoTooltip from '../infoTooltip/infoTooltip';
import SelectIcon from '../icons/SelectIcon';

import './Deposit.scss';

type DepositInProps = {
  narrow: boolean;
};

type DepositProps = DepositInProps;

const Deposit: FC<DepositProps> = ({ narrow }) => {
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
  const [variableUnstakedPrincipalsAmount, setVariableUnstakedPrincipalsAmount] = useState<BigNumber | null>(null);
  const [variableStakedPrincipalsAmount, setVariableStakedPrincipalsAmount] = useState<BigNumber | null>(null);
  const [variableStakedYieldsAmount, setVariableStakedYieldsAmount] = useState<BigNumber | null>(null);

  const [estimatedFixedApr, setEstimatedFixedApr] = useState<BigNumber | null>(null);
  const [selectedYield, setSelectedYield] = useState<SelectedYield>('Fixed');
  const [backingTokenRate, setBackingTokenRate] = useState<BigNumber | null>(null);
  const [yieldBearingTokenRate, setYieldBearingTokenRate] = useState<BigNumber | null>(null);

  const [tokenEstimateInProgress, setTokenEstimateInProgress] = useState<boolean>(false);
  const [rateEstimateInProgress, setRateEstimateInProgress] = useState<boolean>(false);

  const [tokensApproved, setTokensApproved] = useState<boolean>(false);

  const [selectedTokenPrecision, setSelectedTokenPrecision] = useState<number>(0);

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
  const maturityDate = staticPoolData[selectedPool.get()].maturityDate.attach(Downgraded).get();
  const tokenPrecision = staticPoolData[selectedPool.get()].tokenPrecision.attach(Downgraded).get();
  const showEstimatesInBackingToken = staticPoolData[selectedPool.get()].showEstimatesInBackingToken
    .attach(Downgraded)
    .get();

  const onTokenChange = useCallback(
    (token: Ticker | undefined) => {
      if (!!token) {
        setSelectedToken(token);
        setAmount('');

        if (backingToken === token) {
          setSelectedTokenPrecision(getTokenPrecision(selectedPoolAddress, 'backingToken'));
          if (backingTokenRate !== null) {
            setUsdRate(backingTokenRate);
          }
        }

        if (backingToken !== token) {
          setSelectedTokenPrecision(getTokenPrecision(selectedPoolAddress, 'yieldBearingToken'));
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
        setVariableUnstakedPrincipalsAmount(null);
        setVariableStakedPrincipalsAmount(null);
        setVariableStakedYieldsAmount(null);
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

    setAmount(ethers.utils.formatUnits(currentBalance, selectedTokenPrecision));
  }, [backingToken, selectedToken, selectedTokenPrecision, userBackingTokenBalance, userYieldBearingTokenBalance]);

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
    if (userWalletSigner && amount) {
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      const tokenAmount = ethers.utils.parseUnits(amount, selectedTokenPrecision);
      const isBackingToken = backingToken === selectedToken;
      const isEthDeposit = selectedToken === 'ETH';
      const actualSlippage = (autoSlippage ? 1 : slippage / 100).toString();
      const principalsPrecision = getTokenPrecision(selectedPoolAddress, 'principals');
      const slippageFormatted = ethers.utils.parseUnits(actualSlippage, principalsPrecision);

      return poolDataAdapter.executeDeposit(
        ammAddress,
        tokenAmount,
        isBackingToken,
        selectedYield,
        slippageFormatted,
        principalsPrecision,
        spotPrice,
        isEthDeposit,
      );
    } else {
      return Promise.resolve(undefined);
    }
  }, [
    userWalletSigner,
    amount,
    selectedTokenPrecision,
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

    // Trigger user balance update when execute is finished
    getUserBalanceProvider({
      userWalletAddress,
      userWalletSigner,
    }).fetchForPool(selectedPoolAddress);
  }, [selectedPoolAddress, userWalletAddress, userWalletSigner]);

  const onApproveChange = useCallback(approved => {
    setTokensApproved(approved);
  }, []);

  useEffect(() => {
    if (userWalletSigner && selectedPoolAddress && ammAddress) {
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      const stream$ = poolDataAdapter
        .retrieveBalances(
          selectedPoolAddress,
          ammAddress,
          tokenPrecision.backingToken,
          userWalletAddress,
          userWalletSigner,
        )
        .pipe(
          catchError(error => {
            console.error('DetailDeposit - retrieveTokenRates - Failed to retrieve token rates!', error);
            return of(null);
          }),
        )
        .subscribe((result: { backingTokenRate: BigNumber; yieldBearingTokenRate: BigNumber } | null) => {
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
    tokenPrecision.backingToken,
    userWalletAddress,
    selectedToken,
    setBackingTokenRate,
    setYieldBearingTokenRate,
    ammAddress,
  ]);

  useEffect(() => {
    const retrieveDepositAmount = async () => {
      if (isZeroString(amount)) {
        setFixedPrincipalsAmount(null);
        setVariableUnstakedPrincipalsAmount(null);
        setVariableStakedPrincipalsAmount(null);
        setVariableStakedYieldsAmount(null);
      } else if (ammAddress && userWalletSigner) {
        try {
          setTokenEstimateInProgress(true);

          const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

          const isBackingToken = backingToken === selectedToken;

          const { fixedDeposit, variableDeposit } =
            (await poolDataAdapter.getEstimatedDepositAmount(
              ammAddress,
              ethers.utils.parseUnits(amount, selectedTokenPrecision),
              isBackingToken,
            )) || {};
          setFixedPrincipalsAmount(fixedDeposit);

          setVariableUnstakedPrincipalsAmount(variableDeposit.unstakedPrincipals);
          setVariableStakedPrincipalsAmount(variableDeposit.stakedPrincipals);
          setVariableStakedYieldsAmount(variableDeposit.stakedYields);

          setTokenEstimateInProgress(false);
        } catch (err) {
          // TODO handle errors
          console.log('Detail Deposit - retrieveDepositAmount -', err);

          setTokenEstimateInProgress(false);
        }
      }
    };

    retrieveDepositAmount();
  }, [amount, selectedTokenPrecision, selectedToken, ammAddress, backingToken, userWalletSigner]);

  useEffect(() => {
    const getEstimatedFixedApr = async () => {
      if (!isZeroString(amount) && selectedToken && userWalletSigner) {
        setRateEstimateInProgress(true);

        const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

        const isBackingToken = selectedToken === backingToken;
        try {
          const fixedAPREstimate = await poolDataAdapter.getEstimatedFixedApr(
            ethers.utils.parseUnits(amount, selectedTokenPrecision),
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
    selectedTokenPrecision,
    userWalletSigner,
    setEstimatedFixedApr,
    backingToken,
    ammAddress,
  ]);

  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

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
  }, [selectedPoolAddress, userWalletSigner]);

  const fixedPrincipalsAmountFormatted = useMemo(() => {
    if (!fixedPrincipalsAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(fixedPrincipalsAmount, tokenPrecision.principals),
      decimalsForUI,
    );
  }, [decimalsForUI, fixedPrincipalsAmount, tokenPrecision.principals]);

  const variableUnstakedPrincipalsAmountFormatted = useMemo(() => {
    if (!variableUnstakedPrincipalsAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(variableUnstakedPrincipalsAmount, tokenPrecision.principals),
      decimalsForUI,
    );
  }, [variableUnstakedPrincipalsAmount, tokenPrecision.principals, decimalsForUI]);

  const variableStakedPrincipalsAmountFormatted = useMemo(() => {
    if (!variableStakedPrincipalsAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(variableStakedPrincipalsAmount, tokenPrecision.principals),
      decimalsForUI,
    );
  }, [variableStakedPrincipalsAmount, tokenPrecision.principals, decimalsForUI]);

  const variableStakedYieldsAmountFormatted = useMemo(() => {
    if (!variableStakedYieldsAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(variableStakedYieldsAmount, tokenPrecision.yields),
      decimalsForUI,
    );
  }, [variableStakedYieldsAmount, tokenPrecision.yields, decimalsForUI]);

  const balanceFormatted = useMemo(() => {
    let currentBalance = getSelectedTokenBalance();
    if (!currentBalance) {
      return null;
    }

    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(currentBalance, selectedTokenPrecision),
      decimalsForUI,
    );
  }, [decimalsForUI, getSelectedTokenBalance, selectedTokenPrecision]);

  const usdValueFormatted = useMemo(() => {
    if (!usdRate || !amount) {
      return null;
    }

    let usdValue = mul18f(
      usdRate,
      ethers.utils.parseUnits(amount, tokenPrecision.backingToken),
      tokenPrecision.backingToken,
    );

    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(usdValue, tokenPrecision.backingToken), 2, '$');
  }, [tokenPrecision.backingToken, usdRate, amount]);

  const variableAPRFormatted = useMemo(() => {
    return NumberUtils.formatPercentage(variableAPR, 2);
  }, [variableAPR]);

  const fixedAPRFormatted = useMemo(() => NumberUtils.formatPercentage(fixedAPR, 2), [fixedAPR]);

  const estimatedFixedAPRFormatted = useMemo(() => {
    if (estimatedFixedApr) {
      if (estimatedFixedApr.gt(ZERO)) {
        setExecuteDisabledText(undefined);
        return NumberUtils.formatPercentage(ethers.utils.formatEther(estimatedFixedApr));
      } else {
        setExecuteDisabledText(getText('insufficientLiquidity', language));
        return ZERO;
      }
    }
    return null;
  }, [estimatedFixedApr, language]);

  const fixedYieldAtMaturityFormatted = useMemo(() => {
    if (!fixedPrincipalsAmount || !amount || isZeroString(amount)) {
      return null;
    }

    const value = fixedPrincipalsAmount.sub(ethers.utils.parseUnits(amount, tokenPrecision.principals));

    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(value, tokenPrecision.principals), decimalsForUI);
  }, [amount, fixedPrincipalsAmount, decimalsForUI, tokenPrecision.principals]);

  const fixedYieldAtMaturityUSDFormatted = useMemo(() => {
    if (!fixedPrincipalsAmount || !backingTokenRate || !amount || isZeroString(amount)) {
      return null;
    }

    const value = fixedPrincipalsAmount.sub(ethers.utils.parseUnits(amount, tokenPrecision.principals));

    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(mul18f(value, backingTokenRate, tokenPrecision.principals), tokenPrecision.principals),
      2,
      '$',
    );
  }, [amount, fixedPrincipalsAmount, tokenPrecision.principals, backingTokenRate]);

  const fixedTotalAvailableAtMaturityFormatted = useMemo(() => {
    if (!fixedPrincipalsAmount) {
      return null;
    }

    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(fixedPrincipalsAmount, tokenPrecision.principals),
      decimalsForUI,
    );
  }, [fixedPrincipalsAmount, tokenPrecision.principals, decimalsForUI]);

  const fixedTotalAvailableAtMaturityUSDFormatted = useMemo(() => {
    if (!fixedPrincipalsAmount || !backingTokenRate) {
      return null;
    }

    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(
        mul18f(fixedPrincipalsAmount, backingTokenRate, tokenPrecision.principals),
        tokenPrecision.principals,
      ),
      2,
      '$',
    );
  }, [fixedPrincipalsAmount, tokenPrecision.principals, backingTokenRate]);

  const estimatedYieldAtMaturity = useMemo(() => {
    if (!variableAPR || !amount) {
      return null;
    }

    const timeUntilMaturity = maturityDate - Date.now();

    const scaleFactor = ethers.utils.parseEther((timeUntilMaturity / MILLISECONDS_IN_A_YEAR).toString());

    const amountParsed = ethers.utils.parseUnits(amount, selectedTokenPrecision);
    const variableAPRParsed = ethers.utils.parseEther(variableAPR.toString() || '1');

    const estimatedYieldForPool = mul18f(amountParsed, variableAPRParsed);

    return mul18f(estimatedYieldForPool, scaleFactor);
  }, [amount, maturityDate, selectedTokenPrecision, variableAPR]);

  const estimatedYieldAtMaturityFormatted = useMemo(() => {
    if (!estimatedYieldAtMaturity) {
      return null;
    }

    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(estimatedYieldAtMaturity, selectedTokenPrecision),
      decimalsForUI,
    );
  }, [decimalsForUI, estimatedYieldAtMaturity, selectedTokenPrecision]);

  const variableTotalAvailableAtMaturity = useMemo(() => {
    if (!estimatedYieldAtMaturity) {
      return null;
    }

    const amountParsed = ethers.utils.parseUnits(amount, selectedTokenPrecision);

    return amountParsed.add(estimatedYieldAtMaturity);
  }, [amount, estimatedYieldAtMaturity, selectedTokenPrecision]);

  const variableTotalAvailableAtMaturityFormatted = useMemo(() => {
    if (!variableTotalAvailableAtMaturity) {
      return null;
    }

    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(variableTotalAvailableAtMaturity, selectedTokenPrecision),
      decimalsForUI,
    );
  }, [decimalsForUI, selectedTokenPrecision, variableTotalAvailableAtMaturity]);

  const estimatedYieldAtMaturityUSDFormatted = useMemo(() => {
    if (!estimatedYieldAtMaturity || !backingTokenRate || !backingTokenRate) {
      return;
    }

    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(
        mul18f(estimatedYieldAtMaturity, backingTokenRate, tokenPrecision.backingToken),
        selectedTokenPrecision,
      ),
      2,
      '$',
    );
  }, [estimatedYieldAtMaturity, backingTokenRate, tokenPrecision.backingToken, selectedTokenPrecision]);

  const variableTotalAvailableAtMaturityUSDFormatted = useMemo(() => {
    if (!variableTotalAvailableAtMaturity || !backingTokenRate || !backingTokenRate) {
      return;
    }

    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(
        mul18f(variableTotalAvailableAtMaturity, backingTokenRate, tokenPrecision.backingToken),
        selectedTokenPrecision,
      ),
      2,
      '$',
    );
  }, [backingTokenRate, variableTotalAvailableAtMaturity, selectedTokenPrecision, tokenPrecision.backingToken]);

  const depositDisabled = useMemo((): boolean => {
    return isYieldNegative === null ? true : isYieldNegative;
  }, [isYieldNegative]);

  const approveDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);

    return zeroAmount || depositDisabled;
  }, [amount, depositDisabled]);

  const amountToApprove = useMemo(() => {
    if (amount) {
      return ethers.utils.parseUnits(amount, selectedTokenPrecision);
    }

    return ZERO;
  }, [amount, selectedTokenPrecision]);

  const executeDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsBalance = ethers.utils
      .parseUnits(amount || '0', selectedTokenPrecision)
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
    selectedTokenPrecision,
    getSelectedTokenBalance,
    estimatedFixedApr,
    rateEstimateInProgress,
    tokenEstimateInProgress,
    tokensApproved,
    depositDisabled,
  ]);

  const ethAllowanceForGasExceeded = useMemo(() => {
    const currentBalance = getSelectedTokenBalance();

    if (!amount || !currentBalance) {
      return false;
    }

    const amountParsed = ethers.utils.parseUnits(amount, selectedTokenPrecision);

    const ethSelected = selectedToken === 'ETH';
    const gasAllowanceExceeded = amountParsed.add(ETH_ALLOWANCE_FOR_GAS).gt(currentBalance);

    return ethSelected && gasAllowanceExceeded;
  }, [amount, getSelectedTokenBalance, selectedToken, selectedTokenPrecision]);

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
              precision={selectedTokenPrecision}
              disabled={!selectedToken || depositDisabled}
              // TODO - Update text in case input is disabled because of negative yield
              disabledTooltip={getText('selectTokenFirst', language)}
            />
            {ethAllowanceForGasExceeded && (
              <div className="tf__input__label">
                <Typography variant="disclaimer-text" color="error">
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
        </div>
        <Spacer size={20} />
      </SectionContainer>
      <Spacer size={15} />
      <SectionContainer title="to">
        <div className="tc__deposit__to__body">
          <SectionContainer id="Fixed" selectable selected={selectedYield === 'Fixed'} onSelected={onSelectYield}>
            <div className="tf__flex-row-space-between-v">
              <div className="tf__flex-row-center-v">
                <SelectIcon selected={selectedYield === 'Fixed'} />
                <Spacer size={10} />
                <Typography variant="yield-card-header">{getText('fixYourFutureYield', language)}</Typography>
                <Spacer size={10} />
                <InfoTooltip text={getText('interestRateProtectionTooltipText', language)} />
              </div>
              <div className="tc__deposit__yield-name-card">
                <Typography variant="yield-card-type" color="primary">
                  {getText('fixedYield', language)}
                </Typography>
              </div>
            </div>
            <Spacer size={15} />
            {(tokenEstimateInProgress || (fixedYieldAtMaturityFormatted && fixedYieldAtMaturityUSDFormatted)) && (
              <div className="tc__deposit__yield-body__row__underline">
                <div className="tc__deposit__card-row-title">
                  <Typography variant="body-text" color="title">
                    {getText('yieldAtMaturity', language)}
                  </Typography>
                </div>
                <div className="tc__deposit__card-row-change">
                  <Typography variant="body-text" color="success">
                    {fixedYieldAtMaturityFormatted ? (
                      `+${fixedYieldAtMaturityFormatted} ${
                        showEstimatesInBackingToken ? backingToken : yieldBearingToken
                      }`
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
              (fixedTotalAvailableAtMaturityFormatted && fixedTotalAvailableAtMaturityUSDFormatted)) && (
              <div className="tc__deposit__yield-body__row">
                <div className="tc__deposit__card-row-title">
                  <Typography variant="body-text" color="title">
                    {getText('totalAvailableAtMaturity', language)}
                  </Typography>
                </div>
                <div className="tc__deposit__card-row-change">
                  <Typography variant="body-text">
                    {fixedTotalAvailableAtMaturityFormatted ? (
                      `${fixedTotalAvailableAtMaturityFormatted} ${
                        showEstimatesInBackingToken ? backingToken : yieldBearingToken
                      }`
                    ) : (
                      <CircularProgress size={14} />
                    )}
                  </Typography>
                </div>
                <div className="tc__deposit__card-row-value">
                  <Typography variant="body-text">
                    {fixedTotalAvailableAtMaturityUSDFormatted || <CircularProgress size={14} />}
                  </Typography>
                </div>
              </div>
            )}
            {(tokenEstimateInProgress ||
              (fixedYieldAtMaturityFormatted && fixedYieldAtMaturityUSDFormatted) ||
              (fixedTotalAvailableAtMaturityFormatted && fixedTotalAvailableAtMaturityUSDFormatted)) && (
              <Spacer size={44} />
            )}
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
                <SelectIcon selected={selectedYield === 'Variable'} />
                <Spacer size={10} />
                <Typography variant="yield-card-header">{getText('provideLiquidity', language)}</Typography>
                <Spacer size={10} />
                <InfoTooltip text={getText('liquidityProvisionTooltipText', language)} />
              </div>
              <div className="tc__deposit__yield-name-card">
                <Typography variant="yield-card-type" color="accent">
                  {getText('variableYield', language)}
                </Typography>
              </div>
            </div>
            <Spacer size={15} />
            {(tokenEstimateInProgress ||
              (estimatedYieldAtMaturityFormatted && estimatedYieldAtMaturityUSDFormatted)) && (
              <div className="tc__deposit__yield-body__row__underline">
                <div className="tc__deposit__card-row-title">
                  <Typography variant="body-text" color="title">
                    {getText('estimatedYieldAtMaturity', language)}
                  </Typography>
                </div>
                <div className="tc__deposit__card-row-change">
                  <Typography variant="body-text" color="success">
                    {estimatedYieldAtMaturityFormatted ? (
                      `+${estimatedYieldAtMaturityFormatted} ${
                        showEstimatesInBackingToken ? backingToken : yieldBearingToken
                      }`
                    ) : (
                      <CircularProgress size={14} />
                    )}
                  </Typography>
                </div>
                <div className="tc__deposit__card-row-value">
                  <Typography variant="body-text" color="success">
                    {estimatedYieldAtMaturityUSDFormatted ? (
                      `+${estimatedYieldAtMaturityUSDFormatted}`
                    ) : (
                      <CircularProgress size={14} />
                    )}
                  </Typography>
                </div>
              </div>
            )}
            {(tokenEstimateInProgress ||
              (variableTotalAvailableAtMaturityFormatted && variableTotalAvailableAtMaturityUSDFormatted)) && (
              <div className="tc__deposit__yield-body__row">
                <div className="tc__deposit__card-row-title">
                  <Typography variant="body-text" color="title">
                    {getText('totalAvailableAtMaturity', language)}
                  </Typography>
                </div>
                <div className="tc__deposit__card-row-change">
                  <Typography variant="body-text">
                    {variableTotalAvailableAtMaturityFormatted ? (
                      `${variableTotalAvailableAtMaturityFormatted} ${
                        showEstimatesInBackingToken ? backingToken : yieldBearingToken
                      }`
                    ) : (
                      <CircularProgress size={14} />
                    )}
                  </Typography>
                </div>
                <div className="tc__deposit__card-row-value">
                  <Typography variant="body-text">
                    {variableTotalAvailableAtMaturityUSDFormatted || <CircularProgress size={14} />}
                  </Typography>
                </div>
              </div>
            )}
            {(tokenEstimateInProgress ||
              (estimatedYieldAtMaturityFormatted && estimatedYieldAtMaturityUSDFormatted) ||
              (variableTotalAvailableAtMaturityFormatted && variableTotalAvailableAtMaturityUSDFormatted)) && (
              <Spacer size={24} />
            )}

            {
              <>
                {variableUnstakedPrincipalsAmountFormatted && (
                  <div className="tf__flex-row-space-between-v">
                    <Typography variant="button-text">
                      {' '}
                      {variableUnstakedPrincipalsAmountFormatted} {getText('principals', language)}
                    </Typography>
                  </div>
                )}
                {
                  <div className="tf__flex-row-space-between-v">
                    <div>
                      {variableStakedPrincipalsAmountFormatted && variableStakedYieldsAmountFormatted && (
                        <div className="tf__flex-row-center-v">
                          <Typography variant="button-text">
                            {`${variableStakedPrincipalsAmountFormatted} ${getText('stakedPrincipals', language)}`}
                          </Typography>
                          <Typography variant="button-text">&nbsp;&#38;&nbsp;</Typography> {/* -Space- -&- -Space- */}
                          <Typography variant="button-text">
                            {`${variableStakedYieldsAmountFormatted} ${getText('stakedYields', language)}`}
                          </Typography>
                        </div>
                      )}
                    </div>

                    {tokenEstimateInProgress && <Spacer size={20} />}

                    {!tokenEstimateInProgress && (
                      <Typography variant="button-text" color="accent">
                        {getText('apr', language)} {variableAPRFormatted}
                      </Typography>
                    )}
                  </div>
                }
              </>
            }
            {tokenEstimateInProgress && <CircularProgress size={14} />}
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
