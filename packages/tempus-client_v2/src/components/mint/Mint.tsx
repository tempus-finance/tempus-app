import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { ethers, BigNumber } from 'ethers';
import { catchError, of } from 'rxjs';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { refreshBalances } from '../../providers/balanceProviderHelper';
import { LanguageContext } from '../../context/languageContext';
import { WalletContext } from '../../context/walletContext';
import { Ticker } from '../../interfaces/Token';
import { Chain } from '../../interfaces/Chain';
import getText from '../../localisation/getText';
import { getChainConfig } from '../../utils/getConfig';
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

type MintInProps = {
  narrow: boolean;
  chain: Chain;
};

const Mint: FC<MintInProps> = ({ narrow, chain }) => {
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
  const disabledOperations = staticPoolData[selectedPool.get()].disabledOperations.attach(Downgraded).get();
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

  const amountToApprove = useMemo(() => {
    if (!amount) {
      return null;
    }

    if (selectedToken === backingToken) {
      return ethers.utils.parseUnits(amount, getTokenPrecision(selectedPoolAddress, 'backingToken'));
    } else {
      return ethers.utils.parseUnits(amount, getTokenPrecision(selectedPoolAddress, 'yieldBearingToken'));
    }
  }, [selectedPoolAddress, selectedToken, backingToken, amount]);

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

  const mintDisabled = useMemo((): boolean => {
    if (isYieldNegative === null) {
      return true;
    }

    return isYieldNegative || disabledOperations.mint || false;
  }, [isYieldNegative, disabledOperations.mint]);

  const getSelectedTokenAddress = useCallback((): string | null => {
    if (!selectedToken) {
      return null;
    }
    return selectedToken === backingToken ? backingTokenAddress : yieldBearingTokenAddress;
  }, [backingTokenAddress, yieldBearingTokenAddress, backingToken, selectedToken]);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (userWalletSigner && amount) {
      const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);
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
    chain,
  ]);

  const onExecuted = useCallback(
    (successful: boolean, txBlockNumber?: number) => {
      setAmount('');

      if (!userWalletSigner) {
        return;
      }

      refreshBalances(
        {
          chain,
          userWalletAddress,
          userWalletSigner,
        },
        selectedPoolAddress,
        txBlockNumber,
      );
    },
    [selectedPoolAddress, userWalletAddress, userWalletSigner, chain],
  );

  const onApproveChange = useCallback(approved => {
    setTokensApproved(approved);
  }, []);

  useEffect(() => {
    if (userWalletSigner && selectedPoolAddress && ammAddress) {
      const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);
      const stream$ = poolDataAdapter
        .retrieveBalances(
          chain,
          selectedPoolAddress,
          ammAddress,
          tokenPrecision.backingToken,
          tokenPrecision.yieldBearingToken,
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
    tokenPrecision.yieldBearingToken,
    selectedPoolAddress,
    userWalletSigner,
    userWalletAddress,
    selectedToken,
    setBackingTokenRate,
    setYieldBearingTokenRate,
    ammAddress,
    chain,
  ]);

  useEffect(() => {
    if (!amount || !userWalletSigner) {
      return;
    }

    const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);
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
  }, [selectedTokenPrecision, amount, userWalletSigner, selectedToken, backingToken, selectedPoolAddress, chain]);

  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }

    const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);

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
  }, [selectedPoolAddress, userWalletSigner, chain]);

  const executeDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsBalance = ethers.utils
      .parseUnits(amount || '0', selectedTokenPrecision)
      .gt(getSelectedTokenBalance() || BigNumber.from('0'));

    return !tokensApproved || zeroAmount || amountExceedsBalance || mintDisabled || estimateInProgress;
  }, [amount, selectedTokenPrecision, getSelectedTokenBalance, tokensApproved, estimateInProgress, mintDisabled]);

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
      {disabledOperations.mint && (
        <>
          <SectionContainer title="poolActionDisabledTitle">
            <Typography variant="card-body-text">{getText('operationDisabledByConfig', language)}</Typography>
            <br />
            <Typography variant="card-body-text" html={getText('askUsOnDiscord', language)} />
          </SectionContainer>
          <Spacer size={15} />
        </>
      )}
      <Descriptor>{getText('mintDescription', language)}</Descriptor>
      <SectionContainer
        title={
          selectedToken && balanceFormatted ? (
            <div className="tc__title-and-balance">
              <Typography variant="card-title">{getText('from', language)}</Typography>
              <Typography variant="body-text">
                {getText('balance', language)} {balanceFormatted}
              </Typography>
            </div>
          ) : (
            'from'
          )
        }
      >
        <div className="tf__flex-row-flex-start-v">
          <TokenSelector
            value={selectedToken}
            tickers={[backingToken, yieldBearingToken]}
            disabled={disabledOperations.mint}
            onTokenChange={onTokenChange}
          />
          <Spacer size={15} />
          <div>
            <CurrencyInput
              defaultValue={amount}
              precision={selectedTokenPrecision}
              onChange={onAmountChange}
              onMaxClick={onClickMax}
              disabled={!selectedToken || mintDisabled}
              // TODO - Update text in case input is disabled because of negative yield
              disabledTooltip={
                disabledOperations.mint ? getText('mintDisabledByConfig') : getText('selectTokenFirst', language)
              }
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
                  <Typography variant="h4">
                    {backingToken} {getText('principals', language)}
                  </Typography>
                  <Spacer size={10} />
                  <Typography variant="card-body-text">
                    {estimatedTokensFormatted &&
                      `${getText('amountReceived', language)} ${estimatedTokensFormatted} ${getText(
                        'principalTokens',
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
                  <Typography variant="h4">
                    {backingToken} {getText('yields', language)}
                  </Typography>
                  <Spacer size={10} />
                  <Typography variant="card-body-text">
                    {estimatedTokensFormatted &&
                      `${getText('amountReceived', language)} ${estimatedTokensFormatted} ${getText(
                        'yieldTokens',
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
            spenderAddress={getChainConfig(chain).tempusControllerContract}
            amountToApprove={amountToApprove}
            userBalance={getSelectedTokenBalance()}
            tokenToApproveTicker={selectedToken}
            disabled={mintDisabled}
            marginRight={20}
            chain={chain}
            onApproveChange={onApproveChange}
          />
          <Execute
            actionName="Mint"
            disabled={executeDisabled}
            chain={chain}
            onExecute={onExecute}
            onExecuted={onExecuted}
          />
        </div>
      </SectionContainer>
    </div>
  );
};

export default Mint;
