import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { dynamicPoolDataState, selectedPoolState } from '../../state/PoolDataState';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import { getDataForPool, PoolDataContext } from '../../context/poolDataContext';
import { WalletContext } from '../../context/walletContext';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import { Ticker } from '../../interfaces/Token';
import NumberUtils from '../../services/NumberUtils';
import getConfig from '../../utils/getConfig';
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

  const { poolData } = useContext(PoolDataContext);
  const { userWalletSigner } = useContext(WalletContext);
  const { language } = useContext(LanguageContext);

  const selectedPoolData = useMemo(() => {
    return getDataForPool(selectedPool.get(), poolData);
  }, [poolData, selectedPool]);

  const supportedTokens = [selectedPoolData.backingToken, selectedPoolData.yieldBearingToken].filter(
    token => token !== 'ETH',
  );

  const [selectedToken, setSelectedToken] = useState<Ticker>(selectedPoolData.yieldBearingToken);
  const [estimatedWithdrawAmount, setEstimatedWithdrawAmount] = useState<BigNumber | null>(null);

  const [principalsApproved, setPrincipalsApproved] = useState<boolean>(false);
  const [yieldsApproved, setYieldsApproved] = useState<boolean>(false);
  const [lpApproved, setLpApproved] = useState<boolean>(false);

  const [tokenPrecision, setTokenPrecision] = useState<number | undefined>();

  const userPrincipalsBalance = dynamicPoolData[selectedPool.get()].userPrincipalsBalance.attach(Downgraded).get();
  const userYieldsBalance = dynamicPoolData[selectedPool.get()].userYieldsBalance.attach(Downgraded).get();
  const userLPTokenBalance = dynamicPoolData[selectedPool.get()].userLPTokenBalance.attach(Downgraded).get();
  const userBalanceUSD = dynamicPoolDataState[selectedPool.get()].userBalanceUSD.attach(Downgraded).get();

  const onTokenChange = useCallback(
    (token: Ticker | undefined) => {
      if (token) {
        if (selectedPoolData.backingToken === token) {
          setTokenPrecision(getTokenPrecision(selectedPoolData.address, 'backingToken'));
        } else {
          setTokenPrecision(getTokenPrecision(selectedPoolData.address, 'yieldBearingToken'));
        }

        setSelectedToken(token);
      }
    },
    [selectedPoolData],
  );

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    const { ammAddress, backingToken } = selectedPoolData;

    if (userWalletSigner && userPrincipalsBalance && userLPTokenBalance) {
      const poolDataAdapter = getPoolDataAdapter(userWalletSigner);

      const isBackingToken = backingToken === selectedToken;
      return poolDataAdapter.executeWithdraw(ammAddress, userPrincipalsBalance, userLPTokenBalance, isBackingToken);
    } else {
      return Promise.resolve(undefined);
    }
  }, [selectedPoolData, userWalletSigner, userPrincipalsBalance, userLPTokenBalance, selectedToken]);

  // Fetch estimated withdraw amount of tokens
  useEffect(() => {
    const { ammAddress, backingToken } = selectedPoolData;

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
            setEstimatedWithdrawAmount(amount);
          });

        return () => stream$.unsubscribe();
      } catch (error) {
        console.log('Withdraw - retrieveWithdrawAmount() - Failed to fetch estimated withdraw amount!', error);
      }
    }
  }, [selectedToken, selectedPoolData, userWalletSigner, userPrincipalsBalance, userYieldsBalance, userLPTokenBalance]);

  const principalsBalanceFormatted = useMemo(() => {
    if (!userPrincipalsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userPrincipalsBalance, getTokenPrecision(selectedPoolData.address, 'principals')),
      selectedPoolData.decimalsForUI,
    );
  }, [selectedPoolData.address, selectedPoolData.decimalsForUI, userPrincipalsBalance]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!userYieldsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userYieldsBalance, getTokenPrecision(selectedPoolData.address, 'yields')),
      selectedPoolData.decimalsForUI,
    );
  }, [selectedPoolData.address, selectedPoolData.decimalsForUI, userYieldsBalance]);

  const lpBalanceFormatted = useMemo(() => {
    if (!userLPTokenBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userLPTokenBalance, getTokenPrecision(selectedPoolData.address, 'lpTokens')),
      selectedPoolData.decimalsForUI,
    );
  }, [selectedPoolData.address, selectedPoolData.decimalsForUI, userLPTokenBalance]);

  const estimatedWithdrawAmountFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(estimatedWithdrawAmount, tokenPrecision),
      selectedPoolData.decimalsForUI,
    );
  }, [estimatedWithdrawAmount, tokenPrecision, selectedPoolData.decimalsForUI]);

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
                  tokenToApproveAddress={selectedPoolData.principalsAddress}
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
                    tokenToApproveAddress={selectedPoolData.yieldsAddress}
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
                    tokenToApproveAddress={selectedPoolData.ammAddress}
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
          <Execute
            actionName="Withdraw"
            tempusPool={selectedPoolData}
            disabled={executeDisabled}
            onExecute={onExecute}
            onExecuted={onWithdraw}
          />
        </div>
      </SectionContainer>
    </div>
  );
};
export default Withdraw;
