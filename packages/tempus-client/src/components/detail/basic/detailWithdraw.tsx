import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { Button } from '@material-ui/core';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
import { mul18f } from '../../../utils/wei-math';
import Typography from '../../typography/Typography';
import Spacer from '../../spacer/spacer';
import TokenSelector from '../../tokenSelector';
import ActionContainer from '../shared/actionContainer';
import PoolDetailProps from '../shared/PoolDetailProps';
import SectionContainer from '../shared/sectionContainer';
import PlusIconContainer from '../shared/plusIconContainer';
import ApproveButton from '../shared/approveButton';

import '../shared/style.scss';

const DetailWithdraw: FC<PoolDetailProps> = ({
  selectedTab,
  tempusPool,
  content,
  signer,
  userWalletAddress,
  poolDataAdapter,
}) => {
  const { address, ammAddress } = tempusPool;
  const { supportedTokens } = content;
  const [backingToken, yieldBearingToken] = supportedTokens;

  const [selectedToken, setSelectedToken] = useState<string>(yieldBearingToken);
  const [withdrawAmount, setWithdrawAmount] = useState<BigNumber | null>(null);
  const [usdRate, setUsdRate] = useState<BigNumber | null>(null);

  const [principalsBalance, setPrincipalsBalance] = useState<BigNumber | null>(null);
  const [yieldsBalance, setYieldsBalance] = useState<BigNumber | null>(null);
  const [lpBalance, setLpBalance] = useState<BigNumber | null>(null);

  const [backingTokenRate, setBackingTokenRate] = useState<BigNumber | null>(null);
  const [yieldBearingTokenRate, setYieldBearingTokenRate] = useState<BigNumber | null>(null);

  const [principalsBalanceFormatted, setPrincipalsBalanceFormatted] = useState<string>('');
  const [yieldsBalanceFormatted, setYieldsBalanceFormatted] = useState<string>('');
  const [lpBalanceFormatted, setLpBalanceFormatted] = useState<string>('');
  const [withdrawAmountFormatted, setWithdrawAmountFormatted] = useState<string>('');
  const [withdrawAmountUsdFormatted, setWithdrawAmountUsdFormatted] = useState<string>('');

  const [principalsApproved, setPrincipalsApproved] = useState<boolean>(false);
  const [yieldsApproved, setYieldsApproved] = useState<boolean>(false);
  const [lpApproved, setLpApproved] = useState<boolean>(false);

  const onTokenChange = useCallback(
    (token: string | undefined) => {
      if (!!token) {
        setSelectedToken(token);

        if (backingToken === token) {
          if (backingTokenRate !== null) {
            setUsdRate(backingTokenRate);
          }
        }

        if (backingToken !== token) {
          if (yieldBearingTokenRate !== null) {
            setUsdRate(yieldBearingTokenRate);
          }
        }
      }
    },
    [backingToken, backingTokenRate, yieldBearingTokenRate, setSelectedToken, setUsdRate],
  );

  const onExecute = useCallback(() => {
    const execute = async () => {
      if (signer && poolDataAdapter) {
        try {
          const isBackingToken = backingToken === selectedToken;
          const depositTransaction = await poolDataAdapter.executeWithdraw(ammAddress, isBackingToken);
          if (depositTransaction) {
            await depositTransaction.wait();
          }
        } catch (err) {
          // TODO handle errors
          console.log('onExecute err', err);
        }
      }
    };

    execute();
  }, [signer, ammAddress, backingToken, selectedToken, poolDataAdapter]);

  useMemo(() => {
    if (!principalsBalance || !yieldsBalance || !lpBalance || !withdrawAmount || !usdRate) {
      return;
    }

    setPrincipalsBalanceFormatted(NumberUtils.formatWithMultiplier(ethers.utils.formatEther(principalsBalance)));
    setYieldsBalanceFormatted(NumberUtils.formatWithMultiplier(ethers.utils.formatEther(yieldsBalance)));
    setLpBalanceFormatted(NumberUtils.formatWithMultiplier(ethers.utils.formatEther(lpBalance)));
    setWithdrawAmountFormatted(NumberUtils.formatWithMultiplier(ethers.utils.formatEther(withdrawAmount)));
    setWithdrawAmountUsdFormatted(
      NumberUtils.formatWithMultiplier(ethers.utils.formatEther(mul18f(withdrawAmount, usdRate))),
    );
  }, [principalsBalance, yieldsBalance, lpBalance, withdrawAmount, usdRate]);

  useEffect(() => {
    const retrieveBalances = async () => {
      if (signer && address && ammAddress && poolDataAdapter) {
        try {
          const {
            backingTokenRate,
            yieldBearingTokenRate,
            principalsTokenBalance,
            yieldsTokenBalance,
            lpTokensBalance,
          } = (await poolDataAdapter.retrieveBalances(address, ammAddress, userWalletAddress, signer)) || {};

          setBackingTokenRate(backingTokenRate);
          setYieldBearingTokenRate(yieldBearingTokenRate);
          setPrincipalsBalance(principalsTokenBalance);
          setYieldsBalance(yieldsTokenBalance);
          setLpBalance(lpTokensBalance);
        } catch (err) {
          // TODO handle errors
          console.log('err', err);
        }
      }
    };

    retrieveBalances();
  }, [
    signer,
    address,
    ammAddress,
    backingToken,
    selectedToken,
    userWalletAddress,
    poolDataAdapter,
    setBackingTokenRate,
    setYieldBearingTokenRate,
    setPrincipalsBalance,
    setYieldsBalance,
    setLpBalance,
  ]);

  useEffect(() => {
    const retrieveWithdrawAmount = async () => {
      if (selectedToken && ammAddress && poolDataAdapter && principalsBalance && yieldsBalance && lpBalance) {
        try {
          const isBackingToken = backingToken === selectedToken;

          const amount = await poolDataAdapter.getEstimatedWithdrawAmount(
            ammAddress,
            principalsBalance,
            yieldsBalance,
            lpBalance,
            isBackingToken,
          );
          setWithdrawAmount(amount);
        } catch (error) {
          console.log('DetailWithdraw - retrieveWithdrawAmount() -', error);
          return Promise.reject(error);
        }
      }
    };

    retrieveWithdrawAmount();
  }, [
    ammAddress,
    selectedToken,
    backingToken,
    principalsBalance,
    yieldsBalance,
    lpBalance,
    poolDataAdapter,
    setWithdrawAmount,
  ]);

  return (
    <div role="tabpanel" hidden={selectedTab !== 1}>
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
                  approved={principalsApproved}
                  onApproved={() => {
                    setPrincipalsApproved(true);
                  }}
                />
              </div>
            </div>
          </SectionContainer>
          <PlusIconContainer />
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
                  approved={yieldsApproved}
                  onApproved={() => {
                    setYieldsApproved(true);
                  }}
                />
              </div>
            </div>
          </SectionContainer>
          <PlusIconContainer />
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
                  approved={lpApproved}
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
              <div className="tf__flex-row-center">
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
                  Estimate: {withdrawAmountFormatted} {selectedToken}
                </Typography>
                <Typography variant="disclaimer-text">~${withdrawAmountUsdFormatted}</Typography>
              </div>
            </div>
          </SectionContainer>
        </ActionContainer>
        <Spacer size={20} />
        <div className="tf__flex-row-center">
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
