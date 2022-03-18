import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { combineLatest } from 'rxjs';
import { CONSTANTS, getTokenPrecision, isZeroString, mul18f } from 'tempus-core-services';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import { refreshBalances } from '../../providers/balanceProviderHelper';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { WalletContext } from '../../context/walletContext';
import { LocaleContext } from '../../context/localeContext';
import { UserSettingsContext } from '../../context/userSettingsContext';
import getText from '../../localisation/getText';
import { Ticker } from '../../interfaces/Token';
import { Chain } from '../../interfaces/Chain';
import NumberUtils from '../../services/NumberUtils';
import { getChainConfig, getConfig } from '../../utils/getConfig';
import Approve from '../buttons/Approve';
import Execute from '../buttons/Execute';
import PlusIconContainer from '../plusIconContainer/PlusIconContainer';
import SectionContainer from '../sectionContainer/SectionContainer';
import Spacer from '../spacer/spacer';
import TokenSelector from '../tokenSelector/tokenSelector';
import Typography from '../typography/Typography';
import CurrencyInput from '../currencyInput/currencyInput';

import './Withdraw.scss';

const { SLIPPAGE_PRECISION } = CONSTANTS;

type WithdrawInProps = {
  chain: Chain;
};

type WithdrawOutProps = {
  onWithdraw: () => void;
};

type WithdrawProps = WithdrawInProps & WithdrawOutProps;

const Withdraw: FC<WithdrawProps> = ({ chain, onWithdraw }) => {
  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { userWalletSigner, userWalletAddress } = useContext(WalletContext);
  const { locale } = useContext(LocaleContext);
  const { slippage, autoSlippage } = useContext(UserSettingsContext);

  const backingToken = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
  const yieldBearingToken = staticPoolData[selectedPool.get()].yieldBearingToken.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const principalsAddress = staticPoolData[selectedPool.get()].principalsAddress.attach(Downgraded).get();
  const yieldsAddress = staticPoolData[selectedPool.get()].yieldsAddress.attach(Downgraded).get();
  const decimalsForUI = staticPoolData[selectedPool.get()].decimalsForUI.attach(Downgraded).get();
  const tokenPrecision = staticPoolData[selectedPool.get()].tokenPrecision.attach(Downgraded).get();

  const supportedTokens = [backingToken, yieldBearingToken].filter(token => token !== 'ETH');

  const [principalsAmount, setPrincipalsAmount] = useState<string>('');
  const [yieldsAmount, setYieldsAmount] = useState<string>('');
  const [lpTokenAmount, setLpTokenAmount] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<Ticker>(yieldBearingToken);
  const [tokenRate, setTokenRate] = useState<BigNumber | null>(null);
  const [estimateInProgress, setEstimateInProgress] = useState<boolean>(true);
  const [estimatedWithdrawData, setEstimatedWithdrawData] = useState<{
    tokenAmount: BigNumber;
    principalsStaked: BigNumber;
    yieldsStaked: BigNumber;
    principalsRate: BigNumber;
    yieldsRate: BigNumber;
  } | null>(null);

  const [principalsApproved, setPrincipalsApproved] = useState<boolean>(false);
  const [yieldsApproved, setYieldsApproved] = useState<boolean>(false);
  const [lpTokenApproved, setLpTokenApproved] = useState<boolean>(false);

  const selectedPoolAddress = selectedPool.attach(Downgraded).get();
  const userPrincipalsBalance = dynamicPoolData[selectedPool.get()].userPrincipalsBalance.attach(Downgraded).get();
  const userYieldsBalance = dynamicPoolData[selectedPool.get()].userYieldsBalance.attach(Downgraded).get();
  const userLPTokenBalance = dynamicPoolData[selectedPool.get()].userLPTokenBalance.attach(Downgraded).get();

  const [selectedTokenPrecision, setSelectedTokenPrecision] = useState<number | undefined>(
    getTokenPrecision(selectedPoolAddress, 'yieldBearingToken', getConfig()),
  );

  const onPrincipalsAmountChange = useCallback((amount: string) => {
    if (amount) {
      setPrincipalsAmount(amount);
    } else {
      setPrincipalsAmount('');
    }
  }, []);

  const onYieldsAmountChange = useCallback((amount: string) => {
    if (amount) {
      setYieldsAmount(amount);
    } else {
      setYieldsAmount('');
    }
  }, []);

  const onLpTokenAmountChange = useCallback((amount: string) => {
    if (amount) {
      setLpTokenAmount(amount);
    } else {
      setLpTokenAmount('');
    }
  }, []);

  const onPrincipalsMaxClick = useCallback(() => {
    if (userPrincipalsBalance) {
      setPrincipalsAmount(ethers.utils.formatUnits(userPrincipalsBalance, tokenPrecision.principals));
    }
  }, [userPrincipalsBalance, tokenPrecision.principals]);

  const onYieldsMaxClick = useCallback(() => {
    if (userYieldsBalance) {
      setYieldsAmount(ethers.utils.formatUnits(userYieldsBalance, tokenPrecision.yields));
    }
  }, [userYieldsBalance, tokenPrecision.yields]);

  const onLpTokensMaxClick = useCallback(() => {
    if (userLPTokenBalance) {
      setLpTokenAmount(ethers.utils.formatUnits(userLPTokenBalance, tokenPrecision.lpTokens));
    }
  }, [userLPTokenBalance, tokenPrecision.lpTokens]);

  const onTokenChange = useCallback(
    (token: Ticker | undefined) => {
      if (token) {
        const config = getConfig();

        if (backingToken === token) {
          setSelectedTokenPrecision(getTokenPrecision(selectedPoolAddress, 'backingToken', config));
        } else {
          setSelectedTokenPrecision(getTokenPrecision(selectedPoolAddress, 'yieldBearingToken', config));
        }

        setSelectedToken(token);
      }
    },
    [backingToken, selectedPoolAddress],
  );

  useEffect(() => {
    if (!userWalletSigner) {
      return;
    }
    setEstimateInProgress(true);

    const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);

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
    chain,
  ]);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (userWalletSigner && estimatedWithdrawData) {
      const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);

      const config = getConfig();

      const principalsPrecision = getTokenPrecision(selectedPoolAddress, 'principals', config);
      const yieldsPrecision = getTokenPrecision(selectedPoolAddress, 'yields', config);
      const lpTokensPrecision = getTokenPrecision(selectedPoolAddress, 'lpTokens', config);

      const principalsAmountParsed = ethers.utils.parseUnits(principalsAmount || '0', principalsPrecision);
      const yieldsAmountParsed = ethers.utils.parseUnits(yieldsAmount || '0', yieldsPrecision);
      const lpTokenAmountParsed = ethers.utils.parseUnits(lpTokenAmount || '0', lpTokensPrecision);

      const actualSlippage = (autoSlippage ? 1 : slippage / 100).toString();

      const minPrincipalsStaked = estimatedWithdrawData.principalsStaked.sub(
        mul18f(
          estimatedWithdrawData.principalsStaked,
          ethers.utils.parseUnits(actualSlippage, principalsPrecision),
          principalsPrecision,
        ),
      );
      const minYieldsStaked = estimatedWithdrawData.yieldsStaked.sub(
        mul18f(
          estimatedWithdrawData.yieldsStaked,
          ethers.utils.parseUnits(actualSlippage, yieldsPrecision),
          yieldsPrecision,
        ),
      );

      const totalPrincipals = principalsAmountParsed.add(estimatedWithdrawData.principalsStaked);
      const totalYields = yieldsAmountParsed.add(estimatedWithdrawData.yieldsStaked);

      const isBackingToken = backingToken === selectedToken;
      return poolDataAdapter.executeWithdraw(
        ammAddress,
        principalsAmountParsed,
        yieldsAmountParsed,
        lpTokenAmountParsed,
        minPrincipalsStaked,
        minYieldsStaked,
        totalPrincipals,
        totalYields,
        ethers.utils.parseUnits(actualSlippage, SLIPPAGE_PRECISION),
        isBackingToken,
        tokenPrecision.principals,
        tokenPrecision.lpTokens,
      );
    } else {
      return Promise.resolve(undefined);
    }
  }, [
    userWalletSigner,
    estimatedWithdrawData,
    slippage,
    autoSlippage,
    selectedPoolAddress,
    principalsAmount,
    yieldsAmount,
    lpTokenAmount,
    backingToken,
    selectedToken,
    ammAddress,
    chain,
    tokenPrecision.principals,
    tokenPrecision.lpTokens,
  ]);

  // Fetch estimated withdraw amount of tokens
  useEffect(() => {
    if (userWalletSigner) {
      setEstimateInProgress(true);

      const poolDataAdapter = getPoolDataAdapter(chain, userWalletSigner);
      try {
        const config = getConfig();

        const principalsAmountParsed = ethers.utils.parseUnits(
          principalsAmount || '0',
          getTokenPrecision(selectedPoolAddress, 'principals', config),
        );
        const yieldsAmountParsed = ethers.utils.parseUnits(
          yieldsAmount || '0',
          getTokenPrecision(selectedPoolAddress, 'yields', config),
        );
        const lpTokenAmountParsed = ethers.utils.parseUnits(
          lpTokenAmount || '0',
          getTokenPrecision(selectedPoolAddress, 'lpTokens', config),
        );

        const isBackingToken = backingToken === selectedToken;
        const stream$ = poolDataAdapter
          .getEstimatedWithdrawAmount(
            selectedPoolAddress,
            ammAddress,
            lpTokenAmountParsed,
            principalsAmountParsed,
            yieldsAmountParsed,
            isBackingToken,
          )
          .subscribe(amount => {
            setEstimatedWithdrawData(amount);
          });

        return () => stream$.unsubscribe();
      } catch (error) {
        console.log('Withdraw - retrieveWithdrawAmount() - Failed to fetch estimated withdraw amount!', error);
      }
    }
  }, [
    selectedPoolAddress,
    selectedToken,
    userWalletSigner,
    backingToken,
    ammAddress,
    principalsAmount,
    yieldsAmount,
    lpTokenAmount,
    chain,
  ]);

  const onExecuted = useCallback(
    (successful: boolean, txBlockNumber?: number) => {
      onWithdraw();

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
    [onWithdraw, selectedPoolAddress, userWalletAddress, userWalletSigner, chain],
  );

  useEffect(() => {
    if (!tokenRate || !estimatedWithdrawData) {
      setEstimateInProgress(true);
    } else {
      setEstimateInProgress(false);
    }
  }, [tokenRate, estimatedWithdrawData]);

  const principalsBalanceFormatted = useMemo(() => {
    if (!userPrincipalsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userPrincipalsBalance, getTokenPrecision(selectedPoolAddress, 'principals', getConfig())),
      decimalsForUI,
    );
  }, [selectedPoolAddress, decimalsForUI, userPrincipalsBalance]);

  const principalsAmountToApprove = useMemo(() => {
    if (!principalsAmount) {
      return null;
    }

    return ethers.utils.parseUnits(principalsAmount, getTokenPrecision(selectedPoolAddress, 'principals', getConfig()));
  }, [selectedPoolAddress, principalsAmount]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!userYieldsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userYieldsBalance, getTokenPrecision(selectedPoolAddress, 'yields', getConfig())),
      decimalsForUI,
    );
  }, [selectedPoolAddress, decimalsForUI, userYieldsBalance]);

  const yieldsAmountToApprove = useMemo(() => {
    if (!yieldsAmount) {
      return null;
    }

    return ethers.utils.parseUnits(yieldsAmount, getTokenPrecision(selectedPoolAddress, 'yields', getConfig()));
  }, [selectedPoolAddress, yieldsAmount]);

  const lpTokenBalanceFormatted = useMemo(() => {
    if (!userLPTokenBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userLPTokenBalance, getTokenPrecision(selectedPoolAddress, 'lpTokens', getConfig())),
      decimalsForUI,
    );
  }, [selectedPoolAddress, decimalsForUI, userLPTokenBalance]);

  const lpTokensAmountToApprove = useMemo(() => {
    if (!lpTokenAmount) {
      return null;
    }

    return ethers.utils.parseUnits(lpTokenAmount, getTokenPrecision(selectedPoolAddress, 'lpTokens', getConfig()));
  }, [selectedPoolAddress, lpTokenAmount]);

  const estimatedWithdrawAmountFormatted = useMemo(() => {
    if (!estimatedWithdrawData) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(estimatedWithdrawData.tokenAmount, selectedTokenPrecision),
      decimalsForUI,
    );
  }, [estimatedWithdrawData, selectedTokenPrecision, decimalsForUI]);

  const estimatedWithdrawAmountUsdFormatted = useMemo(() => {
    if (!estimatedWithdrawData || !tokenRate) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(
        mul18f(estimatedWithdrawData.tokenAmount, tokenRate, selectedTokenPrecision),
        selectedTokenPrecision,
      ),
      2,
      '$',
    );
  }, [estimatedWithdrawData, selectedTokenPrecision, tokenRate]);

  const executeDisabled = useMemo(() => {
    const principalAmountZero = !principalsAmount || isZeroString(principalsAmount);
    const yieldsAmountZero = !yieldsAmount || isZeroString(yieldsAmount);
    const lpTokenAmountZero = !lpTokenAmount || isZeroString(lpTokenAmount);

    const principalsExceedsBalance = ethers.utils
      .parseUnits(principalsAmount || '0', tokenPrecision.principals)
      .gt(userPrincipalsBalance || BigNumber.from('0'));
    const yieldsExceedsBalance = ethers.utils
      .parseUnits(yieldsAmount || '0', tokenPrecision.yields)
      .gt(userYieldsBalance || BigNumber.from('0'));
    const lpTokensExceedsBalance = ethers.utils
      .parseUnits(lpTokenAmount || '0', tokenPrecision.lpTokens)
      .gt(userLPTokenBalance || BigNumber.from('0'));

    return (
      (!principalsApproved && !principalAmountZero) ||
      (!yieldsApproved && !yieldsAmountZero) ||
      (!lpTokenApproved && !lpTokenAmountZero) ||
      (principalAmountZero && yieldsAmountZero && lpTokenAmountZero) ||
      principalsExceedsBalance ||
      yieldsExceedsBalance ||
      lpTokensExceedsBalance ||
      estimateInProgress
    );
  }, [
    principalsApproved,
    yieldsApproved,
    lpTokenApproved,
    principalsAmount,
    yieldsAmount,
    lpTokenAmount,
    tokenPrecision.principals,
    tokenPrecision.yields,
    tokenPrecision.lpTokens,
    userPrincipalsBalance,
    userYieldsBalance,
    userLPTokenBalance,
    estimateInProgress,
  ]);

  return (
    <div className="tc__withdraw">
      <SectionContainer title="from" elevation={1}>
        {userPrincipalsBalance && !userPrincipalsBalance.isZero() && (
          <SectionContainer elevation={2}>
            <div className="tc__title-and-balance">
              <Typography variant="h4">{getText('xxxPrincipals', locale, { token: backingToken })}</Typography>
              {principalsBalanceFormatted && (
                <div>
                  <Typography variant="card-body-text">{getText('balance', locale)}</Typography>
                  <Spacer size={15} />
                  <Typography variant="card-body-text">{principalsBalanceFormatted}</Typography>
                </div>
              )}
            </div>
            <Spacer size={10} />
            <div className="tf__flex-row-space-between">
              <div className="tf__flex-row-center-v">
                <CurrencyInput
                  defaultValue={principalsAmount}
                  precision={tokenPrecision.principals}
                  onChange={onPrincipalsAmountChange}
                  onMaxClick={onPrincipalsMaxClick}
                />
              </div>
              <Spacer size={15} />
              <div className="tf__flex-row-center-v-end">
                <Approve
                  tokenToApproveTicker="Principals"
                  amountToApprove={principalsAmountToApprove}
                  userBalance={userPrincipalsBalance}
                  onApproveChange={approved => {
                    setPrincipalsApproved(approved);
                  }}
                  spenderAddress={getChainConfig(chain).tempusControllerContract}
                  tokenToApproveAddress={principalsAddress}
                  chain={chain}
                />
              </div>
            </div>
          </SectionContainer>
        )}
        {userYieldsBalance && !userYieldsBalance.isZero() && (
          <>
            {userPrincipalsBalance && !userPrincipalsBalance.isZero() && <PlusIconContainer orientation="horizontal" />}
            <SectionContainer elevation={2}>
              <div className="tc__title-and-balance">
                <Typography variant="h4">{getText('xxxYields', locale, { token: backingToken })}</Typography>
                {yieldsBalanceFormatted && (
                  <div>
                    <Typography variant="card-body-text">{getText('balance', locale)}</Typography>
                    <Spacer size={15} />

                    <Typography variant="card-body-text">{yieldsBalanceFormatted}</Typography>
                  </div>
                )}
              </div>
              <Spacer size={10} />
              <div className="tf__flex-row-space-between">
                <div className="tf__flex-row-center-v">
                  <CurrencyInput
                    defaultValue={yieldsAmount}
                    precision={tokenPrecision.yields}
                    onChange={onYieldsAmountChange}
                    onMaxClick={onYieldsMaxClick}
                  />

                  <Spacer size={10} />
                </div>
                <Spacer size={15} />
                <div className="tf__flex-row-center-v-end">
                  <Approve
                    tokenToApproveTicker="Yields"
                    amountToApprove={yieldsAmountToApprove}
                    userBalance={userYieldsBalance}
                    onApproveChange={approved => {
                      setYieldsApproved(approved);
                    }}
                    spenderAddress={getChainConfig(chain).tempusControllerContract}
                    tokenToApproveAddress={yieldsAddress}
                    chain={chain}
                  />
                </div>
              </div>
            </SectionContainer>
          </>
        )}
        {userLPTokenBalance && !userLPTokenBalance.isZero() && (
          <>
            {((userPrincipalsBalance && !userPrincipalsBalance.isZero()) ||
              (userYieldsBalance && !userYieldsBalance.isZero())) && <PlusIconContainer orientation="horizontal" />}
            <SectionContainer elevation={2}>
              <div className="tc__title-and-balance">
                <Typography variant="h4">{getText('xxxLpTokens', locale, { token: backingToken })}</Typography>
                {lpTokenBalanceFormatted && (
                  <div>
                    <Typography variant="card-body-text">{getText('balance', locale)}</Typography>
                    <Spacer size={10} />
                    <Typography variant="card-body-text">{lpTokenBalanceFormatted}</Typography>
                  </div>
                )}
              </div>
              <Spacer size={10} />
              <div className="tf__flex-row-space-between">
                <div className="tf__flex-row-center-v">
                  <CurrencyInput
                    defaultValue={lpTokenAmount}
                    precision={tokenPrecision.lpTokens}
                    onChange={onLpTokenAmountChange}
                    onMaxClick={onLpTokensMaxClick}
                  />
                  <Spacer size={15} />
                </div>
                <Spacer size={15} />
                <div className="tf__flex-row-center-v-end">
                  <Approve
                    tokenToApproveTicker="LP Token"
                    amountToApprove={lpTokensAmountToApprove}
                    userBalance={userLPTokenBalance}
                    onApproveChange={approved => {
                      setLpTokenApproved(approved);
                    }}
                    spenderAddress={getChainConfig(chain).tempusControllerContract}
                    tokenToApproveAddress={ammAddress}
                    chain={chain}
                  />
                </div>
              </div>
            </SectionContainer>
          </>
        )}
      </SectionContainer>
      <Spacer size={20} />
      <SectionContainer title="to">
        <SectionContainer elevation={2}>
          <div className="tf__flex-row-center-v">
            <TokenSelector tickers={supportedTokens} value={selectedToken} onTokenChange={onTokenChange} />
            <Spacer size={15} />
            <Typography variant="card-body-text">{getText('estimatedAmountReceived', locale)}</Typography>
            <Spacer size={15} />
            <Typography variant="card-body-text">
              {estimatedWithdrawAmountFormatted} {selectedToken}
            </Typography>
            <Spacer size={15} />
            <Typography variant="card-body-text">({estimatedWithdrawAmountUsdFormatted})</Typography>
          </div>
        </SectionContainer>
        <Spacer size={20} />
        <div className="tf__flex-row-center-vh">
          <Execute
            actionName="Withdraw"
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
export default Withdraw;
