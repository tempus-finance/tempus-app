import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { WalletContext } from '../../context/walletContext';
import { LanguageContext } from '../../context/languageContext';
import { UserSettingsContext } from '../../context/userSettingsContext';
import getText from '../../localisation/getText';
import { Ticker } from '../../interfaces/Token';
import NumberUtils from '../../services/NumberUtils';
import getConfig from '../../utils/getConfig';
import { mul18f } from '../../utils/weiMath';
import getTokenPrecision from '../../utils/getTokenPrecision';
import Approve from '../buttons/Approve';
import Execute from '../buttons/Execute';
import PlusIconContainer from '../plusIconContainer/PlusIconContainer';
import SectionContainer from '../sectionContainer/SectionContainer';
import Spacer from '../spacer/spacer';
import TokenSelector from '../tokenSelector/tokenSelector';
import Typography from '../typography/Typography';

import './Withdraw.scss';

type WithdrawOutProps = {
  onWithdraw: () => void;
};

const Withdraw: FC<WithdrawOutProps> = ({ onWithdraw }) => {
  const selectedPool = useHookState(selectedPoolState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { userWalletSigner } = useContext(WalletContext);
  const { language } = useContext(LanguageContext);
  const { slippage } = useContext(UserSettingsContext);

  const backingToken = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
  const yieldBearingToken = staticPoolData[selectedPool.get()].yieldBearingToken.attach(Downgraded).get();
  const ammAddress = staticPoolData[selectedPool.get()].ammAddress.attach(Downgraded).get();
  const principalsAddress = staticPoolData[selectedPool.get()].principalsAddress.attach(Downgraded).get();
  const yieldsAddress = staticPoolData[selectedPool.get()].yieldsAddress.attach(Downgraded).get();
  const decimalsForUI = staticPoolData[selectedPool.get()].decimalsForUI.attach(Downgraded).get();

  const supportedTokens = [backingToken, yieldBearingToken].filter(token => token !== 'ETH');

  const [selectedToken, setSelectedToken] = useState<Ticker>(yieldBearingToken);
  const [estimatedWithdrawData, setEstimatedWithdrawData] = useState<{
    tokenAmount: BigNumber;
    principalsStaked: BigNumber;
    yieldsStaked: BigNumber;
    principalsRate: BigNumber;
    yieldsRate: BigNumber;
  } | null>(null);

  const [principalsApproved, setPrincipalsApproved] = useState<boolean>(false);
  const [yieldsApproved, setYieldsApproved] = useState<boolean>(false);
  const [lpApproved, setLpApproved] = useState<boolean>(false);

  const [tokenPrecision, setTokenPrecision] = useState<number | undefined>();

  const selectedPoolAddress = selectedPool.attach(Downgraded).get();
  const userPrincipalsBalance = dynamicPoolData[selectedPool.get()].userPrincipalsBalance.attach(Downgraded).get();
  const userYieldsBalance = dynamicPoolData[selectedPool.get()].userYieldsBalance.attach(Downgraded).get();
  const userLPTokenBalance = dynamicPoolData[selectedPool.get()].userLPTokenBalance.attach(Downgraded).get();
  const userBalanceUSD = dynamicPoolDataState[selectedPool.get()].userBalanceUSD.attach(Downgraded).get();

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

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (userWalletSigner && userPrincipalsBalance && userYieldsBalance && userLPTokenBalance && estimatedWithdrawData) {
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      const minPrincipalsStaked = mul18f(
        estimatedWithdrawData.principalsStaked,
        ethers.utils.parseUnits((slippage / 100).toString(), getTokenPrecision(selectedPoolAddress, 'principals')),
      );
      const minYieldsStaked = mul18f(
        estimatedWithdrawData.yieldsStaked,
        ethers.utils.parseUnits((slippage / 100).toString(), getTokenPrecision(selectedPoolAddress, 'yields')),
      );

      let minRate = BigNumber.from('0');
      if (userPrincipalsBalance.gt(userYieldsBalance)) {
        minRate = mul18f(
          estimatedWithdrawData.principalsRate,
          ethers.utils.parseUnits((slippage / 100).toString(), getTokenPrecision(selectedPoolAddress, 'principals')),
        );
      } else if (userYieldsBalance.gt(userPrincipalsBalance)) {
        minRate = mul18f(
          estimatedWithdrawData.yieldsRate,
          ethers.utils.parseUnits((slippage / 100).toString(), getTokenPrecision(selectedPoolAddress, 'principals')),
        );
      }

      const isBackingToken = backingToken === selectedToken;
      return poolDataAdapter.executeWithdraw(
        ammAddress,
        userPrincipalsBalance,
        userYieldsBalance,
        userLPTokenBalance,
        minPrincipalsStaked,
        minYieldsStaked,
        minRate,
        isBackingToken,
      );
    } else {
      return Promise.resolve(undefined);
    }
  }, [
    userWalletSigner,
    userPrincipalsBalance,
    userYieldsBalance,
    userLPTokenBalance,
    estimatedWithdrawData,
    slippage,
    selectedPoolAddress,
    backingToken,
    selectedToken,
    ammAddress,
  ]);

  // Fetch estimated withdraw amount of tokens
  useEffect(() => {
    if (userWalletSigner && userPrincipalsBalance && userYieldsBalance && userLPTokenBalance) {
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);
      try {
        const isBackingToken = backingToken === selectedToken;
        const stream$ = poolDataAdapter
          .getEstimatedWithdrawAmount(
            ammAddress,
            userLPTokenBalance,
            userPrincipalsBalance,
            userYieldsBalance,
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
    selectedToken,
    userWalletSigner,
    userPrincipalsBalance,
    userYieldsBalance,
    userLPTokenBalance,
    backingToken,
    ammAddress,
  ]);

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

  const lpBalanceFormatted = useMemo(() => {
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
    if (!userBalanceUSD) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(userBalanceUSD, tokenPrecision), 2, '$');
  }, [userBalanceUSD, tokenPrecision]);

  const executeDisabled = useMemo(() => {
    const principalBalanceZero = userPrincipalsBalance && userPrincipalsBalance.isZero();
    const yieldsBalanceZero = userYieldsBalance && userYieldsBalance.isZero();
    const lpBalanceZero = userLPTokenBalance && userLPTokenBalance.isZero();

    return (
      (!principalBalanceZero && !principalsApproved) ||
      (!yieldsBalanceZero && !yieldsApproved) ||
      (!lpBalanceZero && !lpApproved)
    );
  }, [userPrincipalsBalance, userYieldsBalance, userLPTokenBalance, principalsApproved, yieldsApproved, lpApproved]);

  return (
    <div className="tc__withdraw">
      <SectionContainer title="from" elevation={1}>
        {userPrincipalsBalance && !userPrincipalsBalance.isZero() && (
          <SectionContainer elevation={2}>
            <div className="tf__flex-row-space-between">
              <div className="tf__flex-column-space-between">
                <Typography variant="h4">{getText('principals', language)}</Typography>
                <Spacer size={10} />
                <Typography variant="card-body-text">
                  {getText('balance', language)} {principalsBalanceFormatted} {getText('principals', language)}
                </Typography>
              </div>
              <div className="tf__flex-column-center-end">
                <Approve
                  tokenToApproveAddress={principalsAddress}
                  tokenToApproveTicker="Principals"
                  amountToApprove={userPrincipalsBalance}
                  spenderAddress={getConfig().tempusControllerContract}
                  onApproveChange={approved => {
                    setPrincipalsApproved(approved);
                  }}
                />
              </div>
            </div>
          </SectionContainer>
        )}
        {userYieldsBalance && !userYieldsBalance.isZero() && (
          <>
            <PlusIconContainer orientation="horizontal" />
            <SectionContainer elevation={2}>
              <div className="tf__flex-row-space-between">
                <div className="tf__flex-column-space-between">
                  <Typography variant="h4">{getText('yields', language)}</Typography>
                  <Spacer size={10} />
                  <Typography variant="card-body-text">
                    {getText('balance', language)} {yieldsBalanceFormatted} {getText('yields', language)}
                  </Typography>
                </div>
                <div className="tf__flex-column-center-end">
                  <Approve
                    tokenToApproveAddress={yieldsAddress}
                    tokenToApproveTicker="Yields"
                    amountToApprove={userYieldsBalance}
                    spenderAddress={getConfig().tempusControllerContract}
                    onApproveChange={approved => {
                      setYieldsApproved(approved);
                    }}
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
              <div className="tf__flex-row-space-between">
                <div className="tf__flex-column-space-between">
                  <Typography variant="h4">{getText('lpTokens', language)}</Typography>
                  <Spacer size={10} />
                  <Typography variant="card-body-text">
                    {getText('balance', language)} {lpBalanceFormatted} {getText('lpTokens', language)}
                  </Typography>
                </div>
                <div className="tf__flex-column-center-end">
                  <Approve
                    tokenToApproveAddress={ammAddress}
                    tokenToApproveTicker="LP Token"
                    spenderAddress={getConfig().tempusControllerContract}
                    amountToApprove={userLPTokenBalance}
                    // TempusAMM address is used as LP token address
                    onApproveChange={approved => {
                      setLpApproved(approved);
                    }}
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
          <div className="tf__flex-row-center-vh">
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
          <Execute actionName="Withdraw" disabled={executeDisabled} onExecute={onExecute} onExecuted={onWithdraw} />
        </div>
      </SectionContainer>
    </div>
  );
};
export default Withdraw;
