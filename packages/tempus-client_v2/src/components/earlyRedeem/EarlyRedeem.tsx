import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { ethers, BigNumber } from 'ethers';
import { catchError, combineLatest } from 'rxjs';
import { dynamicPoolDataState, selectedPoolState } from '../../state/PoolDataState';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { LanguageContext } from '../../context/languageContext';
import { getDataForPool, PoolDataContext } from '../../context/poolDataContext';
import { WalletContext } from '../../context/walletContext';
import { Ticker } from '../../interfaces/Token';
import getText from '../../localisation/getText';
import getConfig from '../../utils/getConfig';
import getTokenPrecision from '../../utils/getTokenPrecision';
import { isZeroString } from '../../utils/isZeroString';
import { mul18f } from '../../utils/weiMath';
import NumberUtils from '../../services/NumberUtils';
import Approve from '../buttons/Approve';
import Execute from '../buttons/Execute';
import CurrencyInput from '../currencyInput/currencyInput';
import SectionContainer from '../sectionContainer/SectionContainer';
import Spacer from '../spacer/spacer';
import TokenSelector from '../tokenSelector/tokenSelector';
import Typography from '../typography/Typography';
import './EarlyRedeem.scss';

const EarlyRedeem: FC = () => {
  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);

  const { language } = useContext(LanguageContext);
  const { userWalletSigner } = useContext(WalletContext);
  const { userWalletAddress } = useContext(WalletContext);
  const { poolData } = useContext(PoolDataContext);

  const activePoolData = useMemo(() => {
    return getDataForPool(selectedPool.get(), poolData);
  }, [poolData, selectedPool]);

  const [isYieldNegative, setIsYieldNegative] = useState<boolean | null>(null);
  const [selectedToken, setSelectedToken] = useState<Ticker | null>(activePoolData.yieldBearingToken);
  const [principalsApproved, setPrincipalsApproved] = useState<boolean>(false);
  const [yieldsApproved, setYieldsApproved] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');

  const [estimatedWithdrawAmount, setEstimatedWithdrawAmount] = useState<BigNumber | null>(null);
  const [estimateInProgress, setEstimateInProgress] = useState<boolean>(false);
  const [tokenRate, setTokenRate] = useState<BigNumber | null>(null);

  const [tokenPrecision, setTokenPrecision] = useState<number>(0);

  const userPrincipalsBalance = dynamicPoolData[selectedPool.get()].userPrincipalsBalance.attach(Downgraded).get();
  const userYieldsBalance = dynamicPoolData[selectedPool.get()].userYieldsBalance.attach(Downgraded).get();

  const supportedTokens = useMemo(() => {
    return [activePoolData.backingToken, activePoolData.yieldBearingToken].filter(token => token !== 'ETH');
  }, [activePoolData]);

  const onTokenChange = useCallback((token: Ticker | undefined) => {
    if (token) {
      setSelectedToken(token);
    }
  }, []);

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

  const getSelectedTokenAddress = useCallback((): string | null => {
    if (!selectedToken) {
      return null;
    }
    return selectedToken === activePoolData.backingToken
      ? activePoolData.backingTokenAddress
      : activePoolData.yieldBearingTokenAddress;
  }, [activePoolData, selectedToken]);

  const getSelectedTokenBalance = useCallback((): BigNumber | null => {
    if (!selectedToken) {
      return null;
    }
    const data = getDataForPool(activePoolData.address, poolData);

    return selectedToken === activePoolData.backingToken
      ? data.userBackingTokenBalance
      : data.userYieldBearingTokenBalance;
  }, [activePoolData, poolData, selectedToken]);

  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

    const stream$ = poolDataAdapter
      .isCurrentYieldNegativeForPool(activePoolData.address)
      .pipe(
        catchError((error, caught) => {
          console.log('Early Redeem - isCurrentYieldNegativeForPool - Failed to retrieve current yield!', error);
          return caught;
        }),
      )
      .subscribe(isYieldNegative => {
        setIsYieldNegative(isYieldNegative);
      });

    return () => stream$.unsubscribe();
  }, [activePoolData, userWalletSigner]);

  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

    setTokenPrecision(getTokenPrecision(activePoolData.address, 'principals'));

    const getBackingTokenRate$ = poolDataAdapter.getBackingTokenRate(activePoolData.backingToken);
    const getYieldBearingTokenRate$ = poolDataAdapter.getYieldBearingTokenRate(
      activePoolData.address,
      activePoolData.backingToken,
    );

    const stream$ = combineLatest([getBackingTokenRate$, getYieldBearingTokenRate$]).subscribe(
      ([backingTokenRate, yieldBearingTokenRate]) => {
        if (selectedToken === activePoolData.backingToken) {
          setTokenRate(backingTokenRate);
        }

        if (selectedToken === activePoolData.yieldBearingToken) {
          setTokenRate(yieldBearingTokenRate);
        }
      },
    );

    return () => stream$.unsubscribe();
  }, [activePoolData, userWalletSigner, selectedToken]);

  // Fetch estimated withdraw amount of tokens
  useEffect(() => {
    const retrieveEstimatedWithdrawAmount = async () => {
      if (userWalletSigner && amount) {
        const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

        try {
          const amountFormatted = ethers.utils.parseUnits(amount, tokenPrecision);
          const toBackingToken = selectedToken === activePoolData.backingToken;

          setEstimateInProgress(true);
          setEstimatedWithdrawAmount(
            await poolDataAdapter.estimatedRedeem(
              activePoolData.address,
              amountFormatted,
              amountFormatted,
              toBackingToken,
            ),
          );
          setEstimateInProgress(false);
        } catch (error) {
          console.log(
            'Early Redeem - retrieveEstimatedWithdrawAmount() - Failed to fetch estimated withdraw amount!',
            error,
          );
          setEstimateInProgress(false);
        }
      }
    };
    retrieveEstimatedWithdrawAmount();
  }, [userWalletSigner, activePoolData, tokenPrecision, selectedToken, amount]);

  const depositDisabled = useMemo((): boolean => {
    return isYieldNegative === null ? true : isYieldNegative;
  }, [isYieldNegative]);

  const estimatedWithdrawAmountFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(estimatedWithdrawAmount, tokenPrecision),
      activePoolData.decimalsForUI,
    );
  }, [activePoolData, estimatedWithdrawAmount, tokenPrecision]);

  const estimatedWithdrawAmountUsdFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount || !tokenRate) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(mul18f(estimatedWithdrawAmount, tokenRate, tokenPrecision), tokenPrecision),
      2,
      '$',
    );
  }, [estimatedWithdrawAmount, tokenRate, tokenPrecision]);

  const approveDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);

    return zeroAmount || depositDisabled;
  }, [amount, depositDisabled]);

  const onApproveChange = useCallback(approved => {
    setPrincipalsApproved(approved);
    setYieldsApproved(approved);
  }, []);

  const executeDisabled = useMemo(() => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsPrincipalsBalance = ethers.utils
      .parseUnits(amount || '0', tokenPrecision)
      .gt(userPrincipalsBalance || BigNumber.from('0'));
    const amountExceedsYieldsBalance = ethers.utils
      .parseUnits(amount || '0', tokenPrecision)
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
  }, [
    amount,
    tokenPrecision,
    userPrincipalsBalance,
    userYieldsBalance,
    principalsApproved,
    yieldsApproved,
    estimateInProgress,
  ]);

  const onExecute = useCallback(() => {
    if (!userWalletSigner) {
      return Promise.resolve(undefined);
    }

    const poolDataAdapter = getPoolDataAdapter(userWalletSigner);
    const amountFormatted = ethers.utils.parseUnits(amount, tokenPrecision);
    const toBackingToken = selectedToken === activePoolData.backingToken;

    return poolDataAdapter.executeRedeem(activePoolData.address, userWalletAddress, amountFormatted, toBackingToken);
  }, [userWalletSigner, activePoolData, amount, selectedToken, userWalletAddress, tokenPrecision]);

  const onExecuted = useCallback(() => {
    setAmount('');
  }, []);

  return (
    <div className="tc__earlyRedeem">
      <SectionContainer title="from" elevation={1}>
        <SectionContainer elevation={2}>
          <div className="tf__flex-column-center-v">
            <Typography variant="h4">
              {getText('principals', language)} &#38; {getText('yields', language)}
            </Typography>
            <Spacer size={12} />
            <CurrencyInput
              defaultValue={amount}
              onChange={onAmountChange}
              onMaxClick={onClickMax}
              disabled={!selectedToken || depositDisabled}
              disabledTooltip={getText('selectTokenFirst', language)}
            />
          </div>
        </SectionContainer>
      </SectionContainer>
      <SectionContainer title="to">
        <SectionContainer elevation={2}>
          <div className="tf__flex-row-center-v">
            <TokenSelector tickers={supportedTokens} value={selectedToken} onTokenChange={onTokenChange} />
            <Spacer size={20} />
            <Typography variant="body-text">{getText('estimatedAmountReceived', language)}</Typography>
            <Spacer size={20} />
            <Typography variant="body-text">
              {estimatedWithdrawAmountFormatted} {estimatedWithdrawAmountFormatted && selectedToken}
            </Typography>
            <Typography variant="body-text">
              {estimatedWithdrawAmountUsdFormatted && `(${estimatedWithdrawAmountUsdFormatted})`}
            </Typography>
          </div>
        </SectionContainer>
        <Spacer size={20} />
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
            actionName="Mint"
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

export default EarlyRedeem;
