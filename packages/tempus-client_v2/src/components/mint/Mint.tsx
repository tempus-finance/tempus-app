import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { ethers, BigNumber } from 'ethers';
import { catchError, of } from 'rxjs';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import getUserShareTokenBalanceProvider from '../../providers/getUserShareTokenBalanceProvider';
import getUserBalanceProvider from '../../providers/getBalanceProvider';
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
import { ETH_ALLOWANCE_FOR_GAS, ZERO } from '../../constants';
import Descriptor from '../descriptor/Descriptor';
import CurrencyInput from '../currencyInput/currencyInput';
import PlusIconContainer from '../plusIconContainer/PlusIconContainer';
import SectionContainer from '../sectionContainer/SectionContainer';
import Spacer from '../spacer/spacer';
import TokenSelector from '../tokenSelector/tokenSelector';
import Typography from '../typography/Typography';

import './Mint.scss';
import { selectedChainState } from '../../state/ChainState';

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

  const [selectedTokenPrecision, setSelectedTokenPrecision] = useState<number>(0);

  const selectedPoolAddress = selectedPool.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const backingToken = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
  const yieldBearingToken = staticPoolData[selectedPool.get()].yieldBearingToken.attach(Downgraded).get();
  const backingTokenAddress = staticPoolData[selectedPool.get()].backingTokenAddress.attach(Downgraded).get();
  const yieldBearingTokenAddress = staticPoolData[selectedPool.get()].yieldBearingTokenAddress.attach(Downgraded).get();
  const decimalsForUI = staticPoolData[selectedPool.get()].decimalsForUI.attach(Downgraded).get();
  const tokenPrecision = staticPoolData[selectedPool.get()].tokenPrecision.attach(Downgraded).get();
  const userBackingTokenBalance = dynamicPoolData[selectedPool.get()].userBackingTokenBalance.attach(Downgraded).get();
  const userYieldBearingTokenBalance = dynamicPoolData[selectedPool.get()].userYieldBearingTokenBalance
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

  const getSelectedTokenBalance = useCallback((): BigNumber | null => {
    if (!selectedToken) {
      return null;
    }

    return selectedToken === backingToken ? userBackingTokenBalance : userYieldBearingTokenBalance;
  }, [backingToken, selectedToken, userBackingTokenBalance, userYieldBearingTokenBalance]);

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

  const estimatedTokensFormatted = useMemo(() => {
    if (!estimatedTokens) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      // TODO - In case principalsPrecision !== yieldsPrecision this is not going to work.
      ethers.utils.formatUnits(estimatedTokens, tokenPrecision.principals),
      decimalsForUI,
    );
  }, [decimalsForUI, estimatedTokens, tokenPrecision.principals]);

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
  }, [usdRate, amount, tokenPrecision.backingToken]);

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
      const tokenAmount = ethers.utils.parseUnits(amount, selectedTokenPrecision);
      const isBackingToken = backingToken === selectedToken;
      const isEthDeposit = selectedToken === 'ETH';

      return poolDataAdapter.deposit(selectedPoolAddress, tokenAmount, userWalletAddress, isBackingToken, isEthDeposit);
    } else {
      return Promise.resolve(undefined);
    }
  }, [
    userWalletSigner,
    amount,
    selectedTokenPrecision,
    backingToken,
    selectedToken,
    selectedPoolAddress,
    userWalletAddress,
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
            console.error('Mint - retrieveTokenRates - Failed to retrieve token rates!', error);
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
    tokenPrecision.backingToken,
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
    const amountParsed = ethers.utils.parseUnits(amount, selectedTokenPrecision);

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
  }, [selectedTokenPrecision, amount, userWalletSigner, selectedToken, backingToken, selectedPoolAddress]);

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
      .parseUnits(amount || '0', selectedTokenPrecision)
      .gt(getSelectedTokenBalance() || BigNumber.from('0'));

    return !tokensApproved || zeroAmount || amountExceedsBalance || depositDisabled || estimateInProgress;
  }, [amount, selectedTokenPrecision, getSelectedTokenBalance, tokensApproved, estimateInProgress, depositDisabled]);

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
    <div className="tc__mint">
      <Descriptor>{getText('mintDescription', language)}</Descriptor>
      <SectionContainer title="from">
        {selectedToken && balanceFormatted && (
          <div className="tc__title-and-balance bottom-padded">
            <div></div>
            <Typography variant="body-text">
              {getText('balance', language)}{' '}
              {selectedToken && balanceFormatted ? `${balanceFormatted} ${selectedToken}` : ''}
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
            spenderAddress={getConfig()[selectedChainState.get()].tempusControllerContract}
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
