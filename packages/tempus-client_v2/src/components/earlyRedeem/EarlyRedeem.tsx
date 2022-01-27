import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { ethers, BigNumber } from 'ethers';
import { catchError, combineLatest } from 'rxjs';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import { selectedChainState } from '../../state/ChainState';
import getUserShareTokenBalanceProvider from '../../providers/getUserShareTokenBalanceProvider';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { LanguageContext } from '../../context/languageContext';
import { WalletContext } from '../../context/walletContext';
import { Ticker } from '../../interfaces/Token';
import getText from '../../localisation/getText';
import getTokenPrecision from '../../utils/getTokenPrecision';
import { isZeroString } from '../../utils/isZeroString';
import { mul18f } from '../../utils/weiMath';
import NumberUtils from '../../services/NumberUtils';
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
  const staticPoolData = useHookState(staticPoolDataState);
  const selectedNetwork = useHookState(selectedChainState);

  const yieldBearingToken = staticPoolData[selectedPool.get()].yieldBearingToken.attach(Downgraded).get();

  const { language } = useContext(LanguageContext);
  const { userWalletSigner } = useContext(WalletContext);
  const { userWalletAddress } = useContext(WalletContext);

  const [isYieldNegative, setIsYieldNegative] = useState<boolean | null>(null);
  const [selectedToken, setSelectedToken] = useState<Ticker | null>(yieldBearingToken);
  const [amount, setAmount] = useState<string>('');

  const [estimatedWithdrawAmount, setEstimatedWithdrawAmount] = useState<BigNumber | null>(null);
  const [estimateInProgress, setEstimateInProgress] = useState<boolean>(false);
  const [tokenRate, setTokenRate] = useState<BigNumber | null>(null);

  const [selectedTokenPrecision, setSelectedTokenPrecision] = useState<number>(0);

  const selectedNetworkName = selectedNetwork.attach(Downgraded).get();
  const selectedPoolAddress = selectedPool.attach(Downgraded).get();
  const userPrincipalsBalance = dynamicPoolData[selectedPool.get()].userPrincipalsBalance.attach(Downgraded).get();
  const userYieldsBalance = dynamicPoolData[selectedPool.get()].userYieldsBalance.attach(Downgraded).get();
  const backingToken = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
  const decimalsForUI = staticPoolData[selectedPool.get()].decimalsForUI.attach(Downgraded).get();
  const tokenPrecision = staticPoolData[selectedPool.get()].tokenPrecision.attach(Downgraded).get();

  const supportedTokens = useMemo(() => {
    return [backingToken, yieldBearingToken].filter(token => token !== 'ETH');
  }, [backingToken, yieldBearingToken]);

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
    if (!userPrincipalsBalance || !userYieldsBalance) {
      return;
    }

    if (userPrincipalsBalance.gte(userYieldsBalance)) {
      setAmount(ethers.utils.formatUnits(userYieldsBalance, selectedTokenPrecision));
    } else if (userYieldsBalance.gt(userPrincipalsBalance)) {
      setAmount(ethers.utils.formatUnits(userPrincipalsBalance, selectedTokenPrecision));
    }
  }, [selectedTokenPrecision, userPrincipalsBalance, userYieldsBalance]);

  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    const poolDataAdapter = getPoolDataAdapter(selectedNetworkName, userWalletSigner);

    const stream$ = poolDataAdapter
      .isCurrentYieldNegativeForPool(selectedPoolAddress)
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
  }, [selectedPoolAddress, userWalletSigner, selectedNetworkName]);

  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    const poolDataAdapter = getPoolDataAdapter(selectedNetworkName, userWalletSigner);

    setSelectedTokenPrecision(getTokenPrecision(selectedPoolAddress, 'principals'));

    const getBackingTokenRate$ = poolDataAdapter.getBackingTokenRate(backingToken);
    const getYieldBearingTokenRate$ = poolDataAdapter.getYieldBearingTokenRate(
      selectedPoolAddress,
      backingToken,
      tokenPrecision.backingToken,
      tokenPrecision.yieldBearingToken,
    );

    const stream$ = combineLatest([getBackingTokenRate$, getYieldBearingTokenRate$]).subscribe(
      ([backingTokenRate, yieldBearingTokenRate]) => {
        if (selectedToken === backingToken) {
          setTokenRate(backingTokenRate);
        }

        if (selectedToken === yieldBearingToken) {
          setTokenRate(yieldBearingTokenRate);
        }
      },
    );

    return () => stream$.unsubscribe();
  }, [
    selectedPoolAddress,
    userWalletSigner,
    selectedToken,
    backingToken,
    yieldBearingToken,
    tokenPrecision.backingToken,
    tokenPrecision.yieldBearingToken,
    selectedNetworkName,
  ]);

  // Fetch estimated withdraw amount of tokens
  useEffect(() => {
    const retrieveEstimatedWithdrawAmount = async () => {
      if (userWalletSigner && amount) {
        const poolDataAdapter = getPoolDataAdapter(selectedNetworkName, userWalletSigner);

        try {
          const amountFormatted = ethers.utils.parseUnits(amount, selectedTokenPrecision);
          const toBackingToken = selectedToken === backingToken;

          setEstimateInProgress(true);
          setEstimatedWithdrawAmount(
            await poolDataAdapter.estimatedRedeem(
              selectedPoolAddress,
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
  }, [
    userWalletSigner,
    selectedPoolAddress,
    selectedTokenPrecision,
    selectedToken,
    amount,
    backingToken,
    selectedNetworkName,
  ]);

  const depositDisabled = useMemo((): boolean => {
    return isYieldNegative === null ? true : isYieldNegative;
  }, [isYieldNegative]);

  const estimatedWithdrawAmountFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(estimatedWithdrawAmount, selectedTokenPrecision),
      decimalsForUI,
    );
  }, [decimalsForUI, estimatedWithdrawAmount, selectedTokenPrecision]);

  const estimatedWithdrawAmountUsdFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount || !tokenRate) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(
        mul18f(estimatedWithdrawAmount, tokenRate, selectedTokenPrecision),
        selectedTokenPrecision,
      ),
      2,
      '$',
    );
  }, [estimatedWithdrawAmount, tokenRate, selectedTokenPrecision]);

  const executeDisabled = useMemo(() => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsPrincipalsBalance = ethers.utils
      .parseUnits(amount || '0', selectedTokenPrecision)
      .gt(userPrincipalsBalance || BigNumber.from('0'));
    const amountExceedsYieldsBalance = ethers.utils
      .parseUnits(amount || '0', selectedTokenPrecision)
      .gt(userYieldsBalance || BigNumber.from('0'));
    const principalBalanceZero = userPrincipalsBalance && userPrincipalsBalance.isZero();
    const yieldsBalanceZero = userYieldsBalance && userYieldsBalance.isZero();

    return (
      principalBalanceZero ||
      yieldsBalanceZero ||
      zeroAmount ||
      amountExceedsPrincipalsBalance ||
      amountExceedsYieldsBalance ||
      estimateInProgress
    );
  }, [amount, selectedTokenPrecision, userPrincipalsBalance, userYieldsBalance, estimateInProgress]);

  const onExecute = useCallback(() => {
    if (!userWalletSigner) {
      return Promise.resolve(undefined);
    }

    const poolDataAdapter = getPoolDataAdapter(selectedNetworkName, userWalletSigner);
    const amountFormatted = ethers.utils.parseUnits(amount, selectedTokenPrecision);
    const toBackingToken = selectedToken === backingToken;

    return poolDataAdapter.executeRedeem(selectedPoolAddress, userWalletAddress, amountFormatted, toBackingToken);
  }, [
    userWalletSigner,
    amount,
    selectedTokenPrecision,
    selectedToken,
    backingToken,
    selectedPoolAddress,
    userWalletAddress,
    selectedNetworkName,
  ]);

  const onExecuted = useCallback(() => {
    setAmount('');

    if (!userWalletSigner) {
      return;
    }

    // Trigger user pool share balance update when execute is finished
    getUserShareTokenBalanceProvider({
      chain: selectedNetworkName,
      userWalletAddress,
      userWalletSigner,
    }).fetchForPool(selectedPoolAddress);
  }, [selectedPoolAddress, userWalletAddress, userWalletSigner, selectedNetworkName]);

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
          <Execute actionName="Redeem" disabled={executeDisabled} onExecute={onExecute} onExecuted={onExecuted} />
        </div>
      </SectionContainer>
    </div>
  );
};

export default EarlyRedeem;
