import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { catchError } from 'rxjs';
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
  const { language } = useContext(LanguageContext);
  const { userWalletSigner } = useContext(WalletContext);
  const { userWalletAddress } = useContext(WalletContext);
  const { poolData, selectedPool } = useContext(PoolDataContext);

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

  const getSelectedTokenBalance = useCallback((): BigNumber | null => {
    if (!selectedToken) {
      return null;
    }
    const data = getDataForPool(activePoolData.address, poolData);

    return selectedToken === activePoolData.backingToken
      ? data.userBackingTokenBalance
      : data.userYieldBearingTokenBalance;
  }, [activePoolData, poolData, selectedToken]);

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

  const estimatedTokensFormatted = useMemo(() => {
    if (!estimatedTokens) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(estimatedTokens, tokenPrecision),
      activePoolData.decimalsForUI,
    );
  }, [activePoolData, estimatedTokens, tokenPrecision]);

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
    return selectedToken === activePoolData.backingToken
      ? activePoolData.backingTokenAddress
      : activePoolData.yieldBearingTokenAddress;
  }, [activePoolData, selectedToken]);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (userWalletSigner && amount) {
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);
      const tokenAmount = ethers.utils.parseUnits(amount, tokenPrecision);
      const isBackingToken = activePoolData.backingToken === selectedToken;
      const isEthDeposit = selectedToken === 'ETH';

      return poolDataAdapter.deposit(
        activePoolData.ammAddress,
        tokenAmount,
        userWalletAddress,
        isBackingToken,
        isEthDeposit,
      );
    } else {
      return Promise.resolve(undefined);
    }
  }, [activePoolData, userWalletSigner, userWalletAddress, tokenPrecision, selectedToken, amount]);

  const onExecuted = useCallback(() => {
    setAmount('');
  }, []);

  const onApproveChange = useCallback(approved => {
    setTokensApproved(approved);
  }, []);

  useEffect(() => {
    if (userWalletSigner && activePoolData.address && activePoolData.ammAddress) {
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);
      const stream$ = poolDataAdapter
        .retrieveBalances(activePoolData.address, activePoolData.ammAddress, userWalletAddress, userWalletSigner)
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
    activePoolData,
    userWalletSigner,
    userWalletAddress,
    selectedToken,
    setBackingTokenRate,
    setYieldBearingTokenRate,
  ]);

  useEffect(() => {
    if (!amount || !userWalletSigner) {
      return;
    }

    const poolDataAdapter = getPoolDataAdapter(userWalletSigner);
    const isBackingToken = selectedToken === activePoolData.backingToken;
    const amountParsed = ethers.utils.parseUnits(amount, tokenPrecision);

    try {
      setEstimateInProgress(true);
      const stream$ = poolDataAdapter
        .estimatedMintedShares(activePoolData.address, amountParsed, isBackingToken)
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
  }, [activePoolData, tokenPrecision, amount, userWalletSigner, selectedToken]);

  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

    const stream$ = poolDataAdapter
      .isCurrentYieldNegativeForPool(activePoolData.address)
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
  }, [activePoolData, userWalletSigner]);

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

export default Mint;
