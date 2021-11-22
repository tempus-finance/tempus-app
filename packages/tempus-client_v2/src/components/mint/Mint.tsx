import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { ethers, BigNumber } from 'ethers';
import { catchError } from 'rxjs';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { LanguageContext } from '../../context/languageContext';
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
import PlusIconContainer from '../plusIconContainer/PlusIconContainer';
import SectionContainer from '../sectionContainer/SectionContainer';
import Spacer from '../spacer/spacer';
import TokenSelector from '../tokenSelector/tokenSelector';
import Typography from '../typography/Typography';
import TokenIcon from '../tokenIcon';
import './Mint.scss';

type MintInProps = {
  narrow: boolean;
};

const Mint: FC<MintInProps> = ({ narrow }) => {
  const selectedPool = useHookState(selectedPoolState);
  const staticPoolData = useHookState(staticPoolDataState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);

  const { language } = useContext(LanguageContext);
  const { userWalletSigner } = useContext(WalletContext);
  const { userWalletAddress } = useContext(WalletContext);

  const [isYieldNegative, setIsYieldNegative] = useState<boolean | null>(null);
  const [selectedToken, setSelectedToken] = useState<Ticker | null>(null);
  const [amount, setAmount] = useState<string>('');

  const [estimatedTokens, setEstimatedTokens] = useState<BigNumber | null>(null);

  const [usdRate, setUsdRate] = useState<BigNumber | null>(null);

  const [backingTokenRate, setBackingTokenRate] = useState<BigNumber | null>(null);
  const [yieldBearingTokenRate, setYieldBearingTokenRate] = useState<BigNumber | null>(null);

  const [estimateInProgress, setEstimateInProgress] = useState<boolean>(false);

  const [tokensApproved, setTokensApproved] = useState<boolean>(false);

  const [tokenPrecision, setTokenPrecision] = useState<number>(0);

  const selectedPoolAddress = selectedPool.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const backingToken = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
  const yieldBearingToken = staticPoolData[selectedPool.get()].yieldBearingToken.attach(Downgraded).get();
  const backingTokenAddress = staticPoolData[selectedPool.get()].backingTokenAddress.attach(Downgraded).get();
  const yieldBearingTokenAddress = staticPoolData[selectedPool.get()].yieldBearingTokenAddress.attach(Downgraded).get();
  const decimalsForUI = staticPoolData[selectedPool.get()].decimalsForUI.attach(Downgraded).get();
  const userBalanceInBackingToken = dynamicPoolData[selectedPool.get()].userBalanceInBackingToken
    .attach(Downgraded)
    .get();
  const userYieldBearingTokenBalance = dynamicPoolData[selectedPool.get()].userYieldBearingTokenBalance
    .attach(Downgraded)
    .get();

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
      } else {
        setAmount('');
      }
    },
    [setAmount],
  );

  const onClickMax = useCallback(() => {
    let currentBalance: BigNumber;
    if (selectedToken === backingToken) {
      if (!userBalanceInBackingToken) {
        return;
      }
      currentBalance = userBalanceInBackingToken;
    } else {
      if (!userYieldBearingTokenBalance) {
        return;
      }
      currentBalance = userYieldBearingTokenBalance;
    }

    setAmount(ethers.utils.formatUnits(currentBalance, tokenPrecision));
  }, [backingToken, selectedToken, tokenPrecision, userBalanceInBackingToken, userYieldBearingTokenBalance]);

  const getSelectedTokenBalance = useCallback((): BigNumber | null => {
    if (!selectedToken) {
      return null;
    }

    return selectedToken === backingToken ? userBalanceInBackingToken : userYieldBearingTokenBalance;
  }, [backingToken, selectedToken, userBalanceInBackingToken, userYieldBearingTokenBalance]);

  const balanceFormatted = useMemo(() => {
    let currentBalance = getSelectedTokenBalance();
    if (!currentBalance) {
      return null;
    }

    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(currentBalance, tokenPrecision), decimalsForUI);
  }, [decimalsForUI, getSelectedTokenBalance, tokenPrecision]);

  const estimatedTokensFormatted = useMemo(() => {
    if (!estimatedTokens) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(estimatedTokens, tokenPrecision), decimalsForUI);
  }, [decimalsForUI, estimatedTokens, tokenPrecision]);

  const usdValueFormatted = useMemo(() => {
    if (!usdRate || !amount) {
      return null;
    }

    let usdValue = mul18f(usdRate, ethers.utils.parseUnits(amount, tokenPrecision), tokenPrecision);

    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(usdValue, tokenPrecision), 2, '$');
  }, [tokenPrecision, usdRate, amount]);

  const depositDisabled = useMemo((): boolean => {
    return isYieldNegative === null ? true : isYieldNegative;
  }, [isYieldNegative]);

  const getSelectedTokenAddress = useCallback((): string | null => {
    if (!selectedToken) {
      return null;
    }
    return selectedToken === backingToken ? backingTokenAddress : yieldBearingTokenAddress;
  }, [backingTokenAddress, yieldBearingTokenAddress, backingToken, selectedToken]);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (userWalletSigner && amount) {
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);
      const tokenAmount = ethers.utils.parseUnits(amount, tokenPrecision);
      const isBackingToken = backingToken === selectedToken;
      const isEthDeposit = selectedToken === 'ETH';

      return poolDataAdapter.deposit(selectedPoolAddress, tokenAmount, userWalletAddress, isBackingToken, isEthDeposit);
    } else {
      return Promise.resolve(undefined);
    }
  }, [userWalletSigner, amount, tokenPrecision, backingToken, selectedToken, selectedPoolAddress, userWalletAddress]);

  const onExecuted = useCallback(() => {
    setAmount('');
  }, []);

  const onApproveChange = useCallback(approved => {
    setTokensApproved(approved);
  }, []);

  useEffect(() => {
    if (userWalletSigner && selectedPoolAddress && ammAddress) {
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);
      const stream$ = poolDataAdapter
        .retrieveBalances(selectedPoolAddress, ammAddress, userWalletAddress, userWalletSigner)
        .pipe(
          catchError((error, caught) => {
            console.log('Mint - retrieveTokenRates - Failed to retrieve token rates!', error);
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
    setBackingTokenRate,
    setYieldBearingTokenRate,
    ammAddress,
  ]);

  useEffect(() => {
    if (!amount || !userWalletSigner) {
      return;
    }

    const poolDataAdapter = getPoolDataAdapter(userWalletSigner);
    const isBackingToken = selectedToken === backingToken;
    const amountParsed = ethers.utils.parseUnits(amount, tokenPrecision);

    try {
      setEstimateInProgress(true);
      const stream$ = poolDataAdapter
        .estimatedMintedShares(selectedPoolAddress, amountParsed, isBackingToken)
        .pipe(
          catchError((error, caught) => {
            console.log('Mint - estimatedMintedShares - Failed to retrieve estimated minted shares!', error);
            return caught;
          }),
        )
        .subscribe(estimatedMintedShares => {
          setEstimatedTokens(estimatedMintedShares);
          setEstimateInProgress(false);
        });

      return () => stream$.unsubscribe();
    } catch (error) {
      console.error('Mint - getEstimates() - Failed to get estimates for selected token!', error);
      setEstimateInProgress(false);
    }
  }, [tokenPrecision, amount, userWalletSigner, selectedToken, backingToken, selectedPoolAddress]);

  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

    const stream$ = poolDataAdapter
      .isCurrentYieldNegativeForPool(selectedPoolAddress)
      .pipe(
        catchError((error, caught) => {
          console.log('Mint - isCurrentYieldNegativeForPool - Failed to retrieve current yield!', error);
          return caught;
        }),
      )
      .subscribe(isYieldNegative => {
        setIsYieldNegative(isYieldNegative);
      });

    return () => stream$.unsubscribe();
  }, [selectedPoolAddress, userWalletSigner]);

  const approveDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);

    return zeroAmount || depositDisabled;
  }, [amount, depositDisabled]);

  const executeDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsBalance = ethers.utils
      .parseUnits(amount || '0', tokenPrecision)
      .gt(getSelectedTokenBalance() || BigNumber.from('0'));

    return !tokensApproved || zeroAmount || amountExceedsBalance || depositDisabled || estimateInProgress;
  }, [amount, tokenPrecision, getSelectedTokenBalance, tokensApproved, estimateInProgress, depositDisabled]);

  return (
    <div className="tc__mint">
      <SectionContainer title="from">
        <div className="tf__flex-row-center-v">
          <TokenSelector
            value={selectedToken}
            tickers={[backingToken, yieldBearingToken]}
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
              disabledTooltip={getText('selectTokenFirst', language)}
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
              {getText('balance', language)}{' '}
              {selectedToken && balanceFormatted ? `${balanceFormatted} ${selectedToken}` : ''}
            </Typography>
          )}
          <Spacer size={10} />
          {selectedToken && <TokenIcon ticker={selectedToken} width={20} height={20} />}
        </div>
        <Spacer size={20} />
      </SectionContainer>
      <Spacer size={15} />
      <SectionContainer title="to">
        <div className={narrow ? '' : 'tf__flex-row-center-v'}>
          <>
            <SectionContainer elevation={2}>
              <div className="tf__flex-row-space-between">
                <div className="tf__flex-column-space-between">
                  <Typography variant="h4">{getText('principals', language)}</Typography>
                  <Spacer size={10} />
                  <Typography variant="card-body-text">
                    {estimatedTokensFormatted &&
                      `${getText('amountReceived', language)} ${estimatedTokensFormatted} ${getText(
                        'principals',
                        language,
                      )}`}
                  </Typography>
                </div>
                <div className="tf__flex-column-center-end"></div>
              </div>
            </SectionContainer>
            {!narrow && <PlusIconContainer orientation="vertical" />}
          </>
          <>
            {narrow && <PlusIconContainer orientation="horizontal" />}
            <SectionContainer elevation={2}>
              <div className="tf__flex-row-space-between">
                <div className="tf__flex-column-space-between">
                  <Typography variant="h4">{getText('yields', language)}</Typography>
                  <Spacer size={10} />
                  <Typography variant="card-body-text">
                    {estimatedTokensFormatted &&
                      `${getText('amountReceived', language)} ${estimatedTokensFormatted} ${getText(
                        'yields',
                        language,
                      )}`}
                  </Typography>
                </div>
                <div className="tf__flex-column-center-end"></div>
              </div>
            </SectionContainer>
          </>
        </div>
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
          <Execute actionName="Mint" disabled={executeDisabled} onExecute={onExecute} onExecuted={onExecuted} />
        </div>
      </SectionContainer>
    </div>
  );
};

export default Mint;
