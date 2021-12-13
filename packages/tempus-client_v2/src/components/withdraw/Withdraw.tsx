import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { combineLatest } from 'rxjs';
import { SLIPPAGE_PRECISION } from '../../constants';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import getUserShareTokenBalanceProvider from '../../providers/getUserShareTokenBalanceProvider';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { WalletContext } from '../../context/walletContext';
import { LanguageContext } from '../../context/languageContext';
import { UserSettingsContext } from '../../context/userSettingsContext';
import getText from '../../localisation/getText';
import { Ticker } from '../../interfaces/Token';
import NumberUtils from '../../services/NumberUtils';
import getConfig from '../../utils/getConfig';
import { mul18f } from '../../utils/weiMath';
import { isZeroString } from '../../utils/isZeroString';
import getTokenPrecision from '../../utils/getTokenPrecision';
import Approve from '../buttons/Approve';
import Execute from '../buttons/Execute';
import PlusIconContainer from '../plusIconContainer/PlusIconContainer';
import SectionContainer from '../sectionContainer/SectionContainer';
import Spacer from '../spacer/spacer';
import TokenSelector from '../tokenSelector/tokenSelector';
import Typography from '../typography/Typography';
import CurrencyInput from '../currencyInput/currencyInput';

import './Withdraw.scss';

type WithdrawOutProps = {
  onWithdraw: () => void;
};

const Withdraw: FC<WithdrawOutProps> = ({ onWithdraw }) => {
  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { userWalletSigner, userWalletAddress } = useContext(WalletContext);
  const { language } = useContext(LanguageContext);
  const { slippage, autoSlippage } = useContext(UserSettingsContext);

  const backingToken = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
  const yieldBearingToken = staticPoolData[selectedPool.get()].yieldBearingToken.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const principalsAddress = staticPoolData[selectedPool.get()].principalsAddress.attach(Downgraded).get();
  const yieldsAddress = staticPoolData[selectedPool.get()].yieldsAddress.attach(Downgraded).get();
  const decimalsForUI = staticPoolData[selectedPool.get()].decimalsForUI.attach(Downgraded).get();
  const principalsPrecision = staticPoolData[selectedPool.get()].tokenPrecision.principals.attach(Downgraded).get();
  const yieldsPrecision = staticPoolData[selectedPool.get()].tokenPrecision.yields.attach(Downgraded).get();
  const lpTokenPrecision = staticPoolData[selectedPool.get()].tokenPrecision.lpTokens.attach(Downgraded).get();

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
  const [tokenPrecision, setTokenPrecision] = useState<number | undefined>();

  const selectedPoolAddress = selectedPool.attach(Downgraded).get();
  const userPrincipalsBalance = dynamicPoolData[selectedPool.get()].userPrincipalsBalance.attach(Downgraded).get();
  const userYieldsBalance = dynamicPoolData[selectedPool.get()].userYieldsBalance.attach(Downgraded).get();
  const userLPTokenBalance = dynamicPoolData[selectedPool.get()].userLPTokenBalance.attach(Downgraded).get();

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
      setPrincipalsAmount(ethers.utils.formatEther(userPrincipalsBalance));
    }
  }, [userPrincipalsBalance]);

  const onYieldsMaxClick = useCallback(() => {
    if (userYieldsBalance) {
      setYieldsAmount(ethers.utils.formatEther(userYieldsBalance));
    }
  }, [userYieldsBalance]);

  const onLpTokensMaxClick = useCallback(() => {
    if (userLPTokenBalance) {
      setLpTokenAmount(ethers.utils.formatEther(userLPTokenBalance));
    }
  }, [userLPTokenBalance]);

  const onTokenChange = useCallback(
    (token: Ticker | undefined) => {
      if (token) {
        if (backingToken === token) {
          setTokenPrecision(getTokenPrecision(selectedPoolAddress, 'backingToken'));
        } else {
          setTokenPrecision(getTokenPrecision(selectedPoolAddress, 'yieldBearingToken'));
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

    const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

    const getBackingTokenRate$ = poolDataAdapter.getBackingTokenRate(backingToken);
    const getYieldBearingTokenRate$ = poolDataAdapter.getYieldBearingTokenRate(selectedPoolAddress, backingToken);

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
  }, [selectedPoolAddress, userWalletSigner, selectedToken, backingToken, yieldBearingToken]);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (userWalletSigner && estimatedWithdrawData) {
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      const principalsAmountParsed = ethers.utils.parseUnits(
        principalsAmount || '0',
        getTokenPrecision(selectedPoolAddress, 'principals'),
      );
      const yieldsAmountParsed = ethers.utils.parseUnits(
        yieldsAmount || '0',
        getTokenPrecision(selectedPoolAddress, 'yields'),
      );
      const lpTokenAmountParsed = ethers.utils.parseUnits(
        lpTokenAmount || '0',
        getTokenPrecision(selectedPoolAddress, 'lpTokens'),
      );

      const actualSlippage = (autoSlippage ? 1 : slippage / 100).toString();

      const minPrincipalsStaked = estimatedWithdrawData.principalsStaked.sub(
        mul18f(
          estimatedWithdrawData.principalsStaked,
          ethers.utils.parseUnits(actualSlippage, getTokenPrecision(selectedPoolAddress, 'principals')),
        ),
      );
      const minYieldsStaked = estimatedWithdrawData.yieldsStaked.sub(
        mul18f(
          estimatedWithdrawData.yieldsStaked,
          ethers.utils.parseUnits(actualSlippage, getTokenPrecision(selectedPoolAddress, 'yields')),
        ),
      );

      const isBackingToken = backingToken === selectedToken;
      return poolDataAdapter.executeWithdraw(
        ammAddress,
        principalsAmountParsed,
        yieldsAmountParsed,
        lpTokenAmountParsed,
        minPrincipalsStaked,
        minYieldsStaked,
        estimatedWithdrawData.yieldsRate,
        ethers.utils.parseUnits(actualSlippage, SLIPPAGE_PRECISION),
        isBackingToken,
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
  ]);

  // Fetch estimated withdraw amount of tokens
  useEffect(() => {
    if (userWalletSigner) {
      setEstimateInProgress(true);

      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);
      try {
        const principalsAmountParsed = ethers.utils.parseUnits(
          principalsAmount || '0',
          getTokenPrecision(selectedPoolAddress, 'principals'),
        );
        const yieldsAmountParsed = ethers.utils.parseUnits(
          yieldsAmount || '0',
          getTokenPrecision(selectedPoolAddress, 'yields'),
        );
        const lpTokenAmountParsed = ethers.utils.parseUnits(
          lpTokenAmount || '0',
          getTokenPrecision(selectedPoolAddress, 'lpTokens'),
        );

        const isBackingToken = backingToken === selectedToken;
        const stream$ = poolDataAdapter
          .getEstimatedWithdrawAmount(
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
  ]);

  const onExecuted = useCallback(() => {
    onWithdraw();

    // Trigger user pool share balance update when execute is finished
    getUserShareTokenBalanceProvider({
      userWalletAddress,
    }).fetchForPool(selectedPoolAddress);
  }, [onWithdraw, selectedPoolAddress, userWalletAddress]);

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
      ethers.utils.formatUnits(userPrincipalsBalance, getTokenPrecision(selectedPoolAddress, 'principals')),
      decimalsForUI,
    );
  }, [selectedPoolAddress, decimalsForUI, userPrincipalsBalance]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!userYieldsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userYieldsBalance, getTokenPrecision(selectedPoolAddress, 'yields')),
      decimalsForUI,
    );
  }, [selectedPoolAddress, decimalsForUI, userYieldsBalance]);

  const lpTokenBalanceFormatted = useMemo(() => {
    if (!userLPTokenBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userLPTokenBalance, getTokenPrecision(selectedPoolAddress, 'lpTokens')),
      decimalsForUI,
    );
  }, [selectedPoolAddress, decimalsForUI, userLPTokenBalance]);

  const estimatedWithdrawAmountFormatted = useMemo(() => {
    if (!estimatedWithdrawData) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(estimatedWithdrawData.tokenAmount, tokenPrecision),
      decimalsForUI,
    );
  }, [estimatedWithdrawData, tokenPrecision, decimalsForUI]);

  const estimatedWithdrawAmountUsdFormatted = useMemo(() => {
    if (!estimatedWithdrawData || !tokenRate) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(mul18f(estimatedWithdrawData.tokenAmount, tokenRate, tokenPrecision), tokenPrecision),
      2,
      '$',
    );
  }, [estimatedWithdrawData, tokenPrecision, tokenRate]);

  const executeDisabled = useMemo(() => {
    const principalAmountZero = !principalsAmount || isZeroString(principalsAmount);
    const yieldsAmountZero = !yieldsAmount || isZeroString(yieldsAmount);
    const lpTokenAmountZero = !lpTokenAmount || isZeroString(lpTokenAmount);

    const principalsExceedsBalance = ethers.utils
      .parseUnits(principalsAmount || '0', principalsPrecision)
      .gt(userPrincipalsBalance || BigNumber.from('0'));
    const yieldsExceedsBalance = ethers.utils
      .parseUnits(yieldsAmount || '0', yieldsPrecision)
      .gt(userYieldsBalance || BigNumber.from('0'));
    const lpTokensExceedsBalance = ethers.utils
      .parseUnits(lpTokenAmount || '0', lpTokenPrecision)
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
    principalsPrecision,
    yieldsPrecision,
    lpTokenPrecision,
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
            <Typography variant="h4">{getText('principals', language)}</Typography>
            <Spacer size={10} />
            <div className="tf__flex-row-space-between">
              <div className="tf__flex-row-center-v">
                <CurrencyInput
                  defaultValue={principalsAmount}
                  onChange={onPrincipalsAmountChange}
                  onMaxClick={onPrincipalsMaxClick}
                />
                <Spacer size={15} />
                <Typography variant="card-body-text">{getText('balance', language)}</Typography>
                <Spacer size={10} />
                <Typography variant="card-body-text">{principalsBalanceFormatted}</Typography>
              </div>
              <Spacer size={15} />
              <div className="tf__flex-row-center-v-end">
                <Approve
                  tokenToApproveTicker="Principals"
                  amountToApprove={userPrincipalsBalance}
                  onApproveChange={approved => {
                    setPrincipalsApproved(approved);
                  }}
                  spenderAddress={getConfig().tempusControllerContract}
                  tokenToApproveAddress={principalsAddress}
                />
              </div>
            </div>
          </SectionContainer>
        )}
        {userYieldsBalance && !userYieldsBalance.isZero() && (
          <>
            <PlusIconContainer orientation="horizontal" />
            <SectionContainer elevation={2}>
              <Typography variant="h4">{getText('yields', language)}</Typography>
              <Spacer size={10} />
              <div className="tf__flex-row-space-between">
                <div className="tf__flex-row-center-v">
                  <CurrencyInput
                    defaultValue={yieldsAmount}
                    onChange={onYieldsAmountChange}
                    onMaxClick={onYieldsMaxClick}
                  />
                  <Spacer size={15} />
                  <Typography variant="card-body-text">{getText('balance', language)}</Typography>
                  <Spacer size={10} />
                  <Typography variant="card-body-text">{yieldsBalanceFormatted}</Typography>
                </div>
                <Spacer size={15} />
                <div className="tf__flex-row-center-v-end">
                  <Approve
                    tokenToApproveTicker="Yields"
                    amountToApprove={userYieldsBalance}
                    onApproveChange={approved => {
                      setYieldsApproved(approved);
                    }}
                    spenderAddress={getConfig().tempusControllerContract}
                    tokenToApproveAddress={yieldsAddress}
                  />
                </div>
              </div>
            </SectionContainer>
          </>
        )}
        {userLPTokenBalance && !userLPTokenBalance.isZero() && (
          <>
            <PlusIconContainer orientation="horizontal" />
            <SectionContainer elevation={2}>
              <Typography variant="h4">{getText('lpTokens', language)}</Typography>
              <Spacer size={10} />
              <div className="tf__flex-row-space-between">
                <div className="tf__flex-row-center-v">
                  <CurrencyInput
                    defaultValue={lpTokenAmount}
                    onChange={onLpTokenAmountChange}
                    onMaxClick={onLpTokensMaxClick}
                  />
                  <Spacer size={15} />
                  <Typography variant="card-body-text">{getText('balance', language)}</Typography>
                  <Spacer size={10} />
                  <Typography variant="card-body-text">{lpTokenBalanceFormatted}</Typography>
                </div>
                <Spacer size={15} />
                <div className="tf__flex-row-center-v-end">
                  <Approve
                    tokenToApproveTicker="LP Token"
                    amountToApprove={userLPTokenBalance}
                    onApproveChange={approved => {
                      setLpTokenApproved(approved);
                    }}
                    spenderAddress={getConfig().tempusControllerContract}
                    tokenToApproveAddress={ammAddress}
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
            <Typography variant="card-body-text">{getText('estimatedAmountReceived', language)}</Typography>
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
          <Execute actionName="Withdraw" disabled={executeDisabled} onExecute={onExecute} onExecuted={onExecuted} />
        </div>
      </SectionContainer>
    </div>
  );
};
export default Withdraw;
