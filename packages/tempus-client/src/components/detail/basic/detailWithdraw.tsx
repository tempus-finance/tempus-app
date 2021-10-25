import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { Context, getDataForPool } from '../../../context';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
import getConfig from '../../../utils/get-config';
import getTokenPrecision from '../../../utils/getTokenPrecision';
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

  const {
    data: { userPrincipalsBalance, userYieldsBalance, userLPBalance, poolData },
  } = useContext(Context);

  const [selectedToken, setSelectedToken] = useState<Ticker>(yieldBearingToken);
  const [estimatedWithdrawAmount, setEstimatedWithdrawAmount] = useState<BigNumber | null>(null);

  const [principalsApproved, setPrincipalsApproved] = useState<boolean>(false);
  const [yieldsApproved, setYieldsApproved] = useState<boolean>(false);
  const [lpApproved, setLpApproved] = useState<boolean>(false);

  const [tokenPrecision, setTokenPrecision] = useState<number>(0);

  const onTokenChange = useCallback(
    (token: Ticker | undefined) => {
      if (token) {
        if (backingToken === token) {
          setTokenPrecision(getTokenPrecision(address, 'backingToken'));
        } else {
          setTokenPrecision(getTokenPrecision(address, 'yieldBearingToken'));
        }

        setSelectedToken(token);
      }
    },
    [address, backingToken],
  );

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (signer && poolDataAdapter && userPrincipalsBalance && userLPBalance) {
      const isBackingToken = backingToken === selectedToken;

      return poolDataAdapter.executeWithdraw(ammAddress, userPrincipalsBalance, userLPBalance, isBackingToken);
    } else {
      return Promise.resolve(undefined);
    }
  }, [signer, poolDataAdapter, backingToken, selectedToken, ammAddress, userPrincipalsBalance, userLPBalance]);

  // Fetch estimated withdraw amount of tokens
  useEffect(() => {
    if (poolDataAdapter && userPrincipalsBalance && userYieldsBalance && userLPBalance) {
      try {
        const isBackingToken = backingToken === selectedToken;
        const stream$ = poolDataAdapter
          .getEstimatedWithdrawAmount(
            ammAddress,
            userLPBalance,
            userPrincipalsBalance,
            userYieldsBalance,
            isBackingToken,
          )
          .subscribe(amount => {
            setEstimatedWithdrawAmount(amount);
          });

        return () => stream$.unsubscribe();
      } catch (error) {
        console.log('DetailWithdraw - retrieveWithdrawAmount() - Failed to fetch estimated withdraw amount!', error);
      }
    }
  }, [
    ammAddress,
    selectedToken,
    backingToken,
    poolDataAdapter,
    userPrincipalsBalance,
    userYieldsBalance,
    userLPBalance,
  ]);

  const principalsBalanceFormatted = useMemo(() => {
    if (!userPrincipalsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userPrincipalsBalance, getTokenPrecision(address, 'principals')),
      tempusPool.decimalsForUI,
    );
  }, [userPrincipalsBalance, address, tempusPool.decimalsForUI]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!userYieldsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userYieldsBalance, getTokenPrecision(address, 'yields')),
      tempusPool.decimalsForUI,
    );
  }, [userYieldsBalance, address, tempusPool.decimalsForUI]);

  const lpBalanceFormatted = useMemo(() => {
    if (!userLPBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(userLPBalance, getTokenPrecision(address, 'lpTokens')),
      tempusPool.decimalsForUI,
    );
  }, [userLPBalance, address, tempusPool.decimalsForUI]);

  const estimatedWithdrawAmountFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatUnits(estimatedWithdrawAmount, tokenPrecision),
      tempusPool.decimalsForUI,
    );
  }, [estimatedWithdrawAmount, tokenPrecision, tempusPool.decimalsForUI]);

  const estimatedWithdrawAmountUsdFormatted = useMemo(() => {
    const data = getDataForPool(content.tempusPool.address, poolData);

    if (!data.userBalanceUSD) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatUnits(data.userBalanceUSD, tokenPrecision), 2, '$');
  }, [content.tempusPool.address, poolData, tokenPrecision]);

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
            actionName="Withdraw"
            tempusPool={tempusPool}
            disabled={executeDisabled}
            onExecute={onExecute}
            onExecuted={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailWithdraw;
