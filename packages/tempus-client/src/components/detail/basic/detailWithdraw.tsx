import { FC, useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import { Ticker } from '../../../interfaces/Token';
import TokenSelector from '../../tokenSelector';
import ActionContainer from '../shared/actionContainer';
import ActionContainerGrid from '../shared/actionContainerGrid';
import ConnectingArrow from '../shared/connectingArrow';
import Execute from '../shared/execute';
import PoolDetailProps from '../shared/PoolDetailProps';

import '../shared/style.scss';

const DetailWithdraw: FC<PoolDetailProps> = ({
  selectedTab,
  tempusPool,
  content,
  signer,
  userWalletAddress,
  poolDataAdapter,
}) => {
  const { address, ammAddress } = tempusPool || {};
  const { supportedTokens = [] } = content || {};
  const [backingToken, yieldBearingToken] = supportedTokens;

  const [selectedToken, setSelectedToken] = useState<string | undefined>(undefined);
  const [withdrawAmount, setWithdrawAmount] = useState<number | undefined>(undefined);
  const [usdRate, setUsdRate] = useState<number>(0);

  const [principalsBalance, setPrincipalsBalance] = useState<number | undefined>(undefined);
  const [yieldsBalance, setYieldsBalance] = useState<number | undefined>(undefined);
  const [lpBalance, setLpBalance] = useState<number | undefined>(undefined);

  const [backingTokenRate, setBackingTokenRate] = useState<number | undefined>(undefined);
  const [yieldBearingTokenRate, setYieldBearingTokenRate] = useState<number | undefined>(undefined);

  const [approveDisabled, setApproveDisabled] = useState<boolean>(false);
  const [executeDisabled, setExecuteDisabled] = useState<boolean>(true);

  const onTokenChange = useCallback(
    (token: string | undefined) => {
      if (!!token) {
        setSelectedToken(token);

        if (backingToken === token) {
          if (backingTokenRate !== undefined && !isNaN(backingTokenRate)) {
            setUsdRate(backingTokenRate);
          }
        }

        if (backingToken !== token) {
          if (yieldBearingTokenRate !== undefined && !isNaN(yieldBearingTokenRate)) {
            setUsdRate(yieldBearingTokenRate);
          }
        }
      }
    },
    [backingToken, backingTokenRate, yieldBearingTokenRate, setSelectedToken, setUsdRate],
  );

  const onApprove = useCallback(() => {
    const approve = async () => {
      if (signer) {
        try {
          const isBackingToken = backingToken === selectedToken;
          // TODO check??
          const approveTransaction = await poolDataAdapter?.approve(address, isBackingToken, signer, principalsBalance);
          if (approveTransaction) {
            await approveTransaction.wait();
            setExecuteDisabled(false);
          }
        } catch (err) {
          // TODO handle errors
          console.log('onApprove err', err);
        }
      }
    };
    setApproveDisabled(true);
    approve();
  }, [
    address,
    signer,
    backingToken,
    selectedToken,
    principalsBalance,
    poolDataAdapter,
    setApproveDisabled,
    setExecuteDisabled,
  ]);

  const onExecute = useCallback(() => {
    const execute = async () => {
      if (signer) {
        try {
          const isBackingToken = backingToken === selectedToken;
          const depositTransaction = await poolDataAdapter?.executeWithdraw(ammAddress, isBackingToken);
          await depositTransaction?.wait();
          setExecuteDisabled(false);
        } catch (err) {
          // TODO handle errors
          console.log('onExecute err', err);
        }
      }
    };

    setExecuteDisabled(true);
    execute();
  }, [signer, ammAddress, backingToken, selectedToken, poolDataAdapter, setExecuteDisabled]);

  useEffect(() => {
    if (!!yieldBearingToken && !!yieldBearingTokenRate && !selectedToken) {
      setSelectedToken(yieldBearingToken);
      setUsdRate(yieldBearingTokenRate);
    }
  }, [selectedToken, yieldBearingTokenRate, yieldBearingToken, setSelectedToken, setUsdRate]);

  useEffect(() => {
    const retrieveBalances = async () => {
      if (signer && address && ammAddress) {
        try {
          const {
            backingTokenRate = '0',
            yieldBearingTokenRate = '0',
            principalsTokenBalance = '0',
            yieldsTokenBalance = '0',
            lpTokensBalance = '0',
          } = (await poolDataAdapter?.retrieveBalances(address, ammAddress, userWalletAddress, signer)) || {};

          setBackingTokenRate(Number(ethers.utils.formatEther(backingTokenRate)));
          setYieldBearingTokenRate(Number(ethers.utils.formatEther(yieldBearingTokenRate)));
          setPrincipalsBalance(Number(ethers.utils.formatEther(principalsTokenBalance)));
          setYieldsBalance(Number(ethers.utils.formatEther(yieldsTokenBalance)));
          setLpBalance(Number(ethers.utils.formatEther(lpTokensBalance)));
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
      console.log('retrieveWithdrawAmount');
      if (selectedToken && ammAddress) {
        try {
          const isBackingToken = backingToken === selectedToken;

          const amount = await poolDataAdapter?.getEstimatedWithdrawAmount(
            ammAddress,
            principalsBalance || 0,
            yieldsBalance || 0,
            lpBalance || 0,
            isBackingToken,
          );

          console.log('retrieveWithdrawAmount amount', amount);
          if (amount !== undefined) {
            setWithdrawAmount(amount);
          }
        } catch (err) {
          // TODO handle errors
          console.log('Detail Deposit - retrieveDepositAmount -', err);
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

  useEffect(() => {
    setApproveDisabled(!withdrawAmount);
  }, [withdrawAmount, setApproveDisabled]);

  return (
    <div role="tabpanel" hidden={selectedTab !== 1}>
      <div className="tf__dialog__content-tab">
        <ActionContainer label="From">
          <ActionContainerGrid className="tf__detail-withdraw__grid">
            <div className="tf__dialog__tab__action-container-grid__top-left element1">
              <div className="tf__tokens-returned__name">
                <div className="tf__tokens-returned__ticker">
                  <span>Principals</span>
                  <span className="tf__tokens-returned__description">Principal Share</span>
                </div>
              </div>

              <div className="add-icon-container">
                <AddIcon />
              </div>
            </div>
            <div className="tf__dialog__tab__action-container-grid__top-right element2">
              <div className="tf__dialog__tab__action-container__balance">
                <Typography variant="subtitle2" className="tf__dialog__tab__action-container__balance-title">
                  Balance
                </Typography>
                <div className="tf__dialog__tab__action-container__balance-value">
                  {new Intl.NumberFormat().format(principalsBalance || 0)}
                </div>
              </div>
            </div>

            <div className="tf__dialog__tab__action-container-grid__centre-left element1">
              <div className="tf__tokens-returned__name">
                <div className="tf__tokens-returned__ticker">
                  <span>Yields</span>
                  <span className="tf__tokens-returned__description">Yield Share</span>
                </div>
              </div>

              <div className="add-icon-container">
                <AddIcon />
              </div>
            </div>
            <div className="tf__dialog__tab__action-container-grid__centre-right element2">
              <div className="tf__dialog__tab__action-container__balance">
                <Typography variant="subtitle2" className="tf__dialog__tab__action-container__balance-title">
                  Balance
                </Typography>
                <div className="tf__dialog__tab__action-container__balance-value">
                  {new Intl.NumberFormat().format(yieldsBalance || 0)}
                </div>
              </div>
            </div>

            <div className="tf__dialog__tab__action-container-grid__bottom-left element1">
              <div className="tf__tokens-returned__name">
                <div className="tf__tokens-returned__ticker">
                  <span>LP Token</span>
                </div>
              </div>
            </div>
            <div className="tf__dialog__tab__action-container-grid__bottom-right element2">
              <div className="tf__dialog__tab__action-container__balance">
                <Typography variant="subtitle2" className="tf__dialog__tab__action-container__balance-title">
                  Balance
                </Typography>
                <div className="tf__dialog__tab__action-container__balance-value">
                  {new Intl.NumberFormat().format(lpBalance || 0)}
                </div>
              </div>
            </div>
          </ActionContainerGrid>
        </ActionContainer>
        <ConnectingArrow />
        <ActionContainer label="To">
          <ActionContainerGrid>
            <div className="tf__dialog__tab__action-container-grid__centre-left tf__dialog__tab__action-container__token-selector">
              <TokenSelector
                tickers={supportedTokens}
                defaultTicker={selectedToken as Ticker}
                onTokenChange={onTokenChange}
              />
            </div>

            <div className="tf__dialog__tab__action-container-grid__centre-right tf__dialog__tab__action-container__lp-tokens">
              <div>
                <span className="small-title">(est.)</span>{' '}
                {withdrawAmount ? new Intl.NumberFormat().format(withdrawAmount) : '-'}
              </div>
              <div className="tf__dialog__tab__action-container__token-amount-fiat">
                <div>{`~ ${withdrawAmount ? new Intl.NumberFormat().format(withdrawAmount * usdRate) : '-'} USD`}</div>
              </div>
            </div>
          </ActionContainerGrid>
        </ActionContainer>
        <Execute
          approveLabel="Approve Principals"
          approveDisabled={approveDisabled}
          executeDisabled={executeDisabled}
          onApprove={onApprove}
          onExecute={onExecute}
        />
      </div>
    </div>
  );
};

export default DetailWithdraw;
