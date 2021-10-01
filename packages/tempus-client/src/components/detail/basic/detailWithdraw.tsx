import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { Button } from '@material-ui/core';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
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

import '../shared/style.scss';

const DetailWithdraw: FC<PoolDetailProps> = ({ tempusPool, content, signer, userWalletAddress, poolDataAdapter }) => {
  const { address, ammAddress } = tempusPool;
  const { supportedTokens } = content;
  const [backingToken, yieldBearingToken] = supportedTokens;

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

  const onExecute = useCallback(() => {
    const execute = async () => {
      if (signer && poolDataAdapter) {
        try {
          const isBackingToken = backingToken === selectedToken;

          const depositTransaction = await poolDataAdapter.executeWithdraw(ammAddress, isBackingToken);
          if (depositTransaction) {
            await depositTransaction.wait();
          }
        } catch (error) {
          console.log('DetailWithdraw - onExecute() - Failed to execute the transaction!', error);
        }
      }
    };

    execute();
  }, [signer, ammAddress, backingToken, selectedToken, poolDataAdapter]);

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
            principalsBalance,
            yieldsBalance,
            lpBalance,
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
  }, [ammAddress, selectedToken, backingToken, principalsBalance, yieldsBalance, lpBalance, poolDataAdapter]);

  const principalsBalanceFormatted = useMemo(() => {
    if (!principalsBalance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(principalsBalance), 3);
  }, [principalsBalance]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!yieldsBalance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(yieldsBalance), 3);
  }, [yieldsBalance]);

  const lpBalanceFormatted = useMemo(() => {
    if (!lpBalance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(lpBalance), 3);
  }, [lpBalance]);

  const estimatedWithdrawAmountFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(estimatedWithdrawAmount), 3);
  }, [estimatedWithdrawAmount]);

  const estimatedWithdrawAmountUsdFormatted = useMemo(() => {
    if (!estimatedWithdrawAmount || !tokenRate) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(mul18f(estimatedWithdrawAmount, tokenRate)), 3);
  }, [estimatedWithdrawAmount, tokenRate]);

  return (
    <div role="tabpanel">
      <div className="tf__dialog__content-tab">
        <Spacer size={20} />
        <Typography variant="body-text">
          In order to withdraw from the Pool you have to approve withdrawal from all token balances and execute the
          transaction.
        </Typography>
        <Spacer size={14} />
        <ActionContainer label="From">
          <Spacer size={10} />
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
                  signer={signer}
                  amountToApprove={principalsBalance || BigNumber.from('0')}
                  tokenToApprove={content.principalTokenAddress}
                  spenderAddress={getConfig().tempusControllerContract}
                  userWalletAddress={userWalletAddress}
                  onApproved={() => {
                    setPrincipalsApproved(true);
                  }}
                />
              </div>
            </div>
          </SectionContainer>
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
                  signer={signer}
                  amountToApprove={yieldsBalance || BigNumber.from('0')}
                  tokenToApprove={content.yieldTokenAddress}
                  spenderAddress={getConfig().tempusControllerContract}
                  userWalletAddress={userWalletAddress}
                  onApproved={() => {
                    setYieldsApproved(true);
                  }}
                />
              </div>
            </div>
          </SectionContainer>
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
                  signer={signer}
                  amountToApprove={lpBalance || BigNumber.from('0')}
                  // TempusAMM address is used as LP token address
                  tokenToApprove={tempusPool.ammAddress}
                  spenderAddress={getConfig().tempusControllerContract}
                  userWalletAddress={userWalletAddress}
                  onApproved={() => {
                    setLpApproved(true);
                  }}
                />
              </div>
            </div>
          </SectionContainer>
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
                <Typography variant="disclaimer-text">~${estimatedWithdrawAmountUsdFormatted}</Typography>
              </div>
            </div>
          </SectionContainer>
        </ActionContainer>
        <Spacer size={20} />
        <div className="tf__flex-row-center-v">
          <Button
            color="secondary"
            variant="contained"
            onClick={onExecute}
            disabled={!principalsApproved || !yieldsApproved || !lpApproved}
          >
            <Typography variant="h5" color="inverted">
              Execute
            </Typography>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DetailWithdraw;
