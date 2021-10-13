import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { Context } from '../../../context';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
import { getWithdrawNotification } from '../../../services/NotificationService';
import getConfig from '../../../utils/get-config';
import Typography from '../../typography/Typography';
import Spacer from '../../spacer/spacer';
import TokenSelector from '../../tokenSelector';
import ActionContainer from '../shared/actionContainer';
import PoolDetailProps from '../shared/PoolDetailProps';
import SectionContainer from '../shared/sectionContainer';
import PlusIconContainer from '../shared/plusIconContainer';
import ApproveButton from '../shared/approveButton';
import ExecuteButton from '../shared/executeButton';

import '../shared/style.scss';

const DetailWithdraw: FC<PoolDetailProps> = ({ tempusPool, content, signer, userWalletAddress, poolDataAdapter }) => {
  const { ammAddress } = tempusPool;
  // We do not support withdraw to ETH
  const supportedTokens = content.supportedTokens.filter(token => token !== 'ETH');
  const backingToken = content.backingTokenTicker;
  const yieldBearingToken = content.yieldBearingTokenTicker;

  const {
    data: { userCurrentPoolPresentValue, userPrincipalsBalance, userYieldsBalance, userLPBalance },
  } = useContext(Context);

  const [selectedToken, setSelectedToken] = useState<Ticker>(yieldBearingToken);
  const [estimatedWithdrawAmount, setEstimatedWithdrawAmount] = useState<BigNumber | null>(null);

  const [principalsApproved, setPrincipalsApproved] = useState<boolean>(false);
  const [yieldsApproved, setYieldsApproved] = useState<boolean>(false);
  const [lpApproved, setLpApproved] = useState<boolean>(false);

  const onTokenChange = useCallback((token: Ticker | undefined) => {
    if (token) {
      setSelectedToken(token);
    }
  }, []);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (signer && poolDataAdapter) {
      const isBackingToken = backingToken === selectedToken;

      return poolDataAdapter.executeWithdraw(ammAddress, isBackingToken);
    } else {
      return Promise.resolve(undefined);
    }
  }, [signer, poolDataAdapter, backingToken, selectedToken, ammAddress]);

  // Fetch estimated withdraw amount of tokens
  useEffect(() => {
    const retrieveEstimatedWithdrawAmount = async () => {
      if (poolDataAdapter && userPrincipalsBalance && userYieldsBalance && userLPBalance) {
        try {
          const isBackingToken = backingToken === selectedToken;

          const amount = await poolDataAdapter.getEstimatedWithdrawAmount(
            ammAddress,
            userLPBalance,
            userPrincipalsBalance,
            userYieldsBalance,
            tempusPool.maxLeftoverShares,
            isBackingToken,
          );
          setEstimatedWithdrawAmount(amount);
        } catch (error) {
          console.log('DetailWithdraw - retrieveWithdrawAmount() - Failed to fetch estimated withdraw amount!', error);
          return Promise.reject(error);
        }
      }
    };

    retrieveEstimatedWithdrawAmount();
  }, [
    ammAddress,
    selectedToken,
    backingToken,
    poolDataAdapter,
    tempusPool.maxLeftoverShares,
    userPrincipalsBalance,
    userYieldsBalance,
    userLPBalance,
  ]);

  const principalsBalanceFormatted = useMemo(() => {
    if (!userPrincipalsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(userPrincipalsBalance), tempusPool.decimalsForUI);
  }, [userPrincipalsBalance, tempusPool.decimalsForUI]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!userYieldsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(userYieldsBalance), tempusPool.decimalsForUI);
  }, [userYieldsBalance, tempusPool.decimalsForUI]);

  const lpBalanceFormatted = useMemo(() => {
    if (!userLPBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(userLPBalance), tempusPool.decimalsForUI);
  }, [userLPBalance, tempusPool.decimalsForUI]);

  const estimatedWithdrawAmountFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(estimatedWithdrawAmount), tempusPool.decimalsForUI);
  }, [estimatedWithdrawAmount, tempusPool.decimalsForUI]);

  const estimatedWithdrawAmountUsdFormatted = useMemo(() => {
    if (!userCurrentPoolPresentValue) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(userCurrentPoolPresentValue), 2, '$');
  }, [userCurrentPoolPresentValue]);

  const executeDisabled = useMemo(() => {
    const principalBalanceZero = userPrincipalsBalance && userPrincipalsBalance.isZero();
    const yieldsBalanceZero = userYieldsBalance && userYieldsBalance.isZero();
    const lpBalanceZero = userLPBalance && userLPBalance.isZero();

    return (
      (!principalBalanceZero && !principalsApproved) ||
      (!yieldsBalanceZero && !yieldsApproved) ||
      (!lpBalanceZero && !lpApproved)
    );
  }, [lpApproved, principalsApproved, userLPBalance, userPrincipalsBalance, userYieldsBalance, yieldsApproved]);

  return (
    <div role="tabpanel">
      <div className="tf__dialog__content-tab">
        <Spacer size={25} />
        <ActionContainer label="From">
          <Spacer size={10} />
          {userPrincipalsBalance && !userPrincipalsBalance.isZero() && (
            <SectionContainer>
              <div className="tf__flex-row-space-between">
                <div className="tf__flex-column-space-between">
                  <Typography variant="h4">Principals</Typography>
                  <Spacer size={10} />
                  <Typography variant="body-text">Balance {principalsBalanceFormatted} Principals</Typography>
                </div>
                <div className="tf__flex-column-center-end">
                  <ApproveButton
                    poolDataAdapter={poolDataAdapter}
                    tokenToApproveAddress={content.principalTokenAddress}
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
              <SectionContainer>
                <div className="tf__flex-row-space-between">
                  <div className="tf__flex-column-space-between">
                    <Typography variant="h4">Yields</Typography>
                    <Spacer size={10} />
                    <Typography variant="body-text">Balance {yieldsBalanceFormatted} Yields</Typography>
                  </div>
                  <div className="tf__flex-column-center-end">
                    <ApproveButton
                      poolDataAdapter={poolDataAdapter}
                      tokenToApproveAddress={content.yieldTokenAddress}
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
          {userLPBalance && !userLPBalance.isZero() && (
            <>
              <PlusIconContainer orientation="horizontal" />
              <SectionContainer>
                <div className="tf__flex-row-space-between">
                  <div className="tf__flex-column-space-between">
                    <Typography variant="h4">LP Tokens</Typography>
                    <Spacer size={10} />
                    <Typography variant="body-text">Balance {lpBalanceFormatted} LP Tokens</Typography>
                  </div>
                  <div className="tf__flex-column-center-end">
                    <ApproveButton
                      poolDataAdapter={poolDataAdapter}
                      tokenToApproveAddress={tempusPool.ammAddress}
                      tokenToApproveTicker="LP Token"
                      spenderAddress={getConfig().tempusControllerContract}
                      amountToApprove={userLPBalance}
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
        </ActionContainer>
        <Spacer size={20} />
        <ActionContainer label="To">
          <Spacer size={20} />
          <SectionContainer>
            <div className="tf__flex-row-space-between">
              <div className="tf__flex-row-center-v">
                <Typography variant="body-text">Token</Typography>
                <Spacer size={10} />
                <TokenSelector
                  tickers={supportedTokens}
                  defaultTicker={selectedToken as Ticker}
                  onTokenChange={onTokenChange}
                />
              </div>
              <div className="tf__flex-column-center-end">
                <Typography variant="h5">
                  Estimate: {estimatedWithdrawAmountFormatted} {selectedToken}
                </Typography>
                <Typography variant="disclaimer-text">~{estimatedWithdrawAmountUsdFormatted}</Typography>
              </div>
            </div>
          </SectionContainer>
        </ActionContainer>
        <Spacer size={20} />
        <div className="tf__flex-row-center-v">
          <ExecuteButton
            notificationText={getWithdrawNotification(
              content.backingTokenTicker,
              content.protocol,
              content.maturityDate,
            )}
            actionName="Withdraw"
            disabled={executeDisabled}
            onExecute={onExecute}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailWithdraw;
