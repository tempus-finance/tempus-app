import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
import { getWithdrawNotification } from '../../../services/NotificationService';
import { mul18f } from '../../../utils/wei-math';
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
  const { address, ammAddress } = tempusPool;
  // We do not support withdraw to ETH
  const supportedTokens = content.supportedTokens.filter(token => token !== 'ETH');
  const backingToken = content.backingTokenTicker;
  const yieldBearingToken = content.yieldBearingTokenTicker;

  const [selectedToken, setSelectedToken] = useState<Ticker>(yieldBearingToken);
  const [estimatedWithdrawAmount, setEstimatedWithdrawAmount] = useState<BigNumber | null>(null);

  const [principalsBalance, setPrincipalsBalance] = useState<BigNumber | null>(null);
  const [yieldsBalance, setYieldsBalance] = useState<BigNumber | null>(null);
  const [lpBalance, setLpBalance] = useState<BigNumber | null>(null);

  const [tokenRate, setTokenRate] = useState<BigNumber | null>(null);

  const [principalsApproved, setPrincipalsApproved] = useState<boolean>(false);
  const [yieldsApproved, setYieldsApproved] = useState<boolean>(false);
  const [lpApproved, setLpApproved] = useState<boolean>(false);

  const onTokenChange = useCallback((token: Ticker | undefined) => {
    if (token) {
      setSelectedToken(token);
    }
  }, []);

  const onExecuted = useCallback(() => {}, []);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (signer && poolDataAdapter) {
      const isBackingToken = backingToken === selectedToken;

      return poolDataAdapter.executeWithdraw(ammAddress, isBackingToken);
    } else {
      return Promise.resolve(undefined);
    }
  }, [signer, poolDataAdapter, backingToken, selectedToken, ammAddress]);

  // Update token rate when selected token changes
  useEffect(() => {
    const getRate = async () => {
      if (!poolDataAdapter) {
        return;
      }

      if (selectedToken === backingToken) {
        setTokenRate(await poolDataAdapter.getBackingTokenRate(backingToken));
      }
      if (selectedToken === yieldBearingToken) {
        setTokenRate(await poolDataAdapter.getYieldBearingTokenRate(tempusPool.address, backingToken));
      }
    };
    getRate();
  }, [backingToken, poolDataAdapter, selectedToken, tempusPool.address, yieldBearingToken]);

  // Fetch token balances when component mounts
  useEffect(() => {
    const retrieveBalances = async () => {
      if (signer && address && ammAddress && poolDataAdapter) {
        try {
          const { principalsTokenBalance, yieldsTokenBalance, lpTokensBalance } =
            (await poolDataAdapter.retrieveBalances(address, ammAddress, userWalletAddress, signer)) || {};

          setPrincipalsBalance(principalsTokenBalance);
          setYieldsBalance(yieldsTokenBalance);
          setLpBalance(lpTokensBalance);
        } catch (error) {
          console.log('DetailWithdraw - retrieveBalances() - Failed to retrieve pool balances!', error);
        }
      }
    };

    retrieveBalances();
  }, [signer, address, ammAddress, userWalletAddress, poolDataAdapter]);

  // Fetch estimated withdraw amount of tokens
  useEffect(() => {
    const retrieveEstimatedWithdrawAmount = async () => {
      if (poolDataAdapter && principalsBalance && yieldsBalance && lpBalance) {
        try {
          const isBackingToken = backingToken === selectedToken;

          const amount = await poolDataAdapter.getEstimatedWithdrawAmount(
            ammAddress,
            lpBalance,
            principalsBalance,
            yieldsBalance,
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
    principalsBalance,
    yieldsBalance,
    lpBalance,
    poolDataAdapter,
    tempusPool.maxLeftoverShares,
  ]);

  const principalsBalanceFormatted = useMemo(() => {
    if (!principalsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(principalsBalance), tempusPool.decimalsForUI);
  }, [principalsBalance, tempusPool.decimalsForUI]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!yieldsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(yieldsBalance), tempusPool.decimalsForUI);
  }, [yieldsBalance, tempusPool.decimalsForUI]);

  const lpBalanceFormatted = useMemo(() => {
    if (!lpBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(lpBalance), tempusPool.decimalsForUI);
  }, [lpBalance, tempusPool.decimalsForUI]);

  const estimatedWithdrawAmountFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(estimatedWithdrawAmount), tempusPool.decimalsForUI);
  }, [estimatedWithdrawAmount, tempusPool.decimalsForUI]);

  const estimatedWithdrawAmountUsdFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount || !tokenRate) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(mul18f(estimatedWithdrawAmount, tokenRate)), 2, '$');
  }, [estimatedWithdrawAmount, tokenRate]);

  return (
    <div role="tabpanel">
      <div className="tf__dialog__content-tab">
        <Spacer size={25} />
        <ActionContainer label="From">
          <Spacer size={10} />
          {principalsBalance && !principalsBalance.isZero() && (
            <SectionContainer>
              <div className="tf__flex-row-space-between">
                <div className="tf__flex-column-space-between">
                  <Typography variant="h4">Principals</Typography>
                  <Spacer size={10} />
                  <Typography variant="body-text">Balance {principalsBalanceFormatted} Principals</Typography>
                </div>
                <div className="tf__flex-column-center-end">
                  <ApproveButton
                    tokenTicker="Principals"
                    poolDataAdapter={poolDataAdapter}
                    amountToApprove={principalsBalance || BigNumber.from('0')}
                    tokenToApprove={content.principalTokenAddress}
                    spenderAddress={getConfig().tempusControllerContract}
                    onApproved={() => {
                      setPrincipalsApproved(true);
                    }}
                  />
                </div>
              </div>
            </SectionContainer>
          )}
          {yieldsBalance && !yieldsBalance.isZero() && (
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
                      tokenTicker="Yields"
                      poolDataAdapter={poolDataAdapter}
                      amountToApprove={yieldsBalance || BigNumber.from('0')}
                      tokenToApprove={content.yieldTokenAddress}
                      spenderAddress={getConfig().tempusControllerContract}
                      onApproved={() => {
                        setYieldsApproved(true);
                      }}
                    />
                  </div>
                </div>
              </SectionContainer>
            </>
          )}
          {lpBalance && !lpBalance.isZero() && (
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
                      tokenToApprove={tempusPool.ammAddress}
                      spenderAddress={getConfig().tempusControllerContract}
                      amountToApprove={lpBalance || BigNumber.from('0')}
                      tokenTicker="LP Token"
                      // TempusAMM address is used as LP token address
                      onApproved={() => {
                        setLpApproved(true);
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
            disabled={
              (!principalsApproved && !principalsBalance?.isZero()) ||
              (!yieldsBalance?.isZero() && !yieldsApproved) ||
              (!lpBalance?.isZero() && !lpApproved)
            }
            onExecute={onExecute}
            onExecuted={onExecuted}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailWithdraw;
