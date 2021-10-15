import React, { FC, useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { ethers, BigNumber } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import Button from '@material-ui/core/Button';
import { Context } from '../../../context';
import { DashboardRowChild, PoolShares, Ticker } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import NumberUtils from '../../../services/NumberUtils';
import { SwapKind } from '../../../services/VaultService';
import getConfig from '../../../utils/get-config';
import { mul18f } from '../../../utils/wei-math';
import { isZeroString } from '../../../utils/isZeroString';
import Typography from '../../typography/Typography';
import CurrencyInput from '../../currencyInput/currencyInput';
import Spacer from '../../spacer/spacer';
import SectionContainer from '../shared/sectionContainer';
import ActionContainer from '../shared/actionContainer';
import TokenSelector from '../../tokenSelector';
import ApproveButton from '../shared/approveButton';
import ExecuteButton from '../shared/executeButton';

interface TokenDetail {
  tokenName: PoolShares;
  tokenAddress: string;
}

type DetailSwapInProps = {
  content: DashboardRowChild;
  poolDataAdapter: PoolDataAdapter | null;
  userWalletAddress: string;
  tempusPool: TempusPool;
  signer: JsonRpcSigner | null;
};

type DetailSwapOutProps = {};

type DetailSwapProps = DetailSwapInProps & DetailSwapOutProps;

const DetailSwap: FC<DetailSwapProps> = props => {
  const { content, userWalletAddress, poolDataAdapter, tempusPool } = props;
  const { principalTokenAddress, yieldTokenAddress } = content;

  const {
    data: { userPrincipalsBalance, userYieldsBalance },
  } = useContext(Context);

  const [tokenFrom, setTokenFrom] = useState<TokenDetail>({
    tokenName: 'Principals',
    tokenAddress: principalTokenAddress,
  });
  const [tokenTo, setTokenTo] = useState<TokenDetail>({
    tokenName: 'Yields',
    tokenAddress: yieldTokenAddress,
  });
  const [selectedToken, setSelectedToken] = useState<Ticker>();
  const [amount, setAmount] = useState<string>('');
  const [receiveAmount, setReceiveAmount] = useState<BigNumber | null>(null);
  const [tokensApproved, setTokensApproved] = useState<boolean>(false);
  const [estimateInProgress, setEstimateInProgress] = useState<boolean>(false);

  const getSelectedTokenBalance = useCallback((): BigNumber | null => {
    if (!selectedToken) {
      return null;
    }
    return selectedToken === 'Principals' ? userPrincipalsBalance : userYieldsBalance;
  }, [selectedToken, userPrincipalsBalance, userYieldsBalance]);

  const getSelectedTokenAddress = useCallback((): string | null => {
    if (!selectedToken) {
      return null;
    }
    return selectedToken === 'Principals' ? content.principalTokenAddress : content.yieldTokenAddress;
  }, [content.principalTokenAddress, content.yieldTokenAddress, selectedToken]);

  const onAmountChange = useCallback(
    (amount: string) => {
      if (amount) {
        setAmount(amount);
      } else {
        setAmount('');
      }
    },
    [setAmount],
  );

  /**
   * Update amount field when user clicks on percentage buttons.
   * - Requires token balance to be loaded so we can calculate percentage of that.
   */
  const onPercentageChange = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const currentBalance = getSelectedTokenBalance();
      if (!currentBalance) {
        return;
      }
      const percentage = ethers.utils.parseEther(event.currentTarget.value);
      setAmount(ethers.utils.formatEther(mul18f(currentBalance, percentage)));
    },
    [getSelectedTokenBalance],
  );

  const switchTokens = useCallback(() => {
    const tokenFromOld: TokenDetail = { ...tokenFrom };
    const tokenToOld: TokenDetail = { ...tokenTo };

    setTokenFrom(tokenToOld);
    setTokenTo(tokenFromOld);
  }, [tokenFrom, tokenTo]);

  const onTokenChange = useCallback(
    (token: Ticker | undefined) => {
      if (!token) {
        return;
      }
      setSelectedToken(token);

      if (token !== tokenFrom.tokenName) {
        switchTokens();
      }
    },
    [switchTokens, tokenFrom.tokenName],
  );

  const onApproveChange = useCallback(approved => {
    setTokensApproved(approved);
  }, []);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (!poolDataAdapter) {
      return Promise.resolve(undefined);
    }

    const amountParsed = ethers.utils.parseEther(amount);
    return poolDataAdapter.swapShareTokens(
      tempusPool.ammAddress,
      SwapKind.GIVEN_IN,
      tokenFrom.tokenAddress,
      tokenTo.tokenAddress,
      amountParsed,
      userWalletAddress,
    );
  }, [poolDataAdapter, amount, tempusPool.ammAddress, tokenFrom.tokenAddress, tokenTo.tokenAddress, userWalletAddress]);

  const onExecuted = useCallback(() => {
    setAmount('');
  }, []);

  // Fetch receive amount
  useEffect(() => {
    const getReceiveAmount = async () => {
      if (!poolDataAdapter || !amount) {
        return;
      }
      const amountParsed = ethers.utils.parseEther(amount);
      const yieldShareIn = tokenFrom.tokenName === 'Yields';

      if (amountParsed.isZero()) {
        setReceiveAmount(BigNumber.from('0'));
        return;
      }

      try {
        setEstimateInProgress(true);
        const estimatedReceiveAmount = await poolDataAdapter.getExpectedReturnForShareToken(
          tempusPool.ammAddress,
          amountParsed,
          yieldShareIn,
        );
        setReceiveAmount(estimatedReceiveAmount);
        setEstimateInProgress(false);
      } catch (error) {
        console.error('DetailSwap - getReceiveAmount() - Failed to fetch expected amount of returned tokens!', error);
        setEstimateInProgress(false);
      }
    };
    getReceiveAmount();
  }, [poolDataAdapter, amount, tempusPool, tokenFrom, setReceiveAmount]);

  const balanceFormatted = useMemo(() => {
    const currentBalance = getSelectedTokenBalance();
    if (!currentBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(currentBalance), tempusPool.decimalsForUI);
  }, [getSelectedTokenBalance, tempusPool.decimalsForUI]);

  const receiveAmountFormatted = useMemo(() => {
    if (!receiveAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(receiveAmount), tempusPool.decimalsForUI);
  }, [receiveAmount, tempusPool.decimalsForUI]);

  const approveDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);

    return zeroAmount;
  }, [amount]);

  const executeDisabled = useMemo((): boolean => {
    const zeroAmount = isZeroString(amount);
    const amountExceedsBalance = ethers.utils
      .parseEther(amount || '0')
      .gt(getSelectedTokenBalance() || BigNumber.from('0'));

    return !tokensApproved || zeroAmount || amountExceedsBalance || estimateInProgress;
  }, [amount, getSelectedTokenBalance, tokensApproved, estimateInProgress]);

  return (
    <div role="tabpanel">
      <div className="tf__dialog__content-tab">
        <ActionContainer label="From">
          <Spacer size={18} />
          <SectionContainer>
            <div className="tf__dialog__flex-row">
              <div className="tf__dialog__label-align-right">
                <Typography variant="body-text">Token</Typography>
              </div>
              <TokenSelector tickers={['Principals', 'Yields']} onTokenChange={onTokenChange} />
              <Spacer size={20} />
              <Typography variant="body-text">
                {selectedToken && balanceFormatted && `Balance: ${balanceFormatted} ${selectedToken}`}
              </Typography>
            </div>
            <Spacer size={14} />
            <div className="tf__dialog__flex-row">
              <div className="tf__dialog__label-align-right">
                <Typography variant="body-text">Amount</Typography>
              </div>
              <CurrencyInput defaultValue={amount} onChange={onAmountChange} disabled={!selectedToken} />
              {selectedToken && (
                <>
                  <Spacer size={20} />
                  <Button variant="contained" size="small" value="0.25" onClick={onPercentageChange}>
                    25%
                  </Button>
                  <Spacer size={10} />
                  <Button variant="contained" size="small" value="0.5" onClick={onPercentageChange}>
                    50%
                  </Button>
                  <Spacer size={10} />
                  <Button variant="contained" size="small" value="0.75" onClick={onPercentageChange}>
                    75%
                  </Button>
                  <Spacer size={10} />
                  <Button variant="contained" size="small" value="1" onClick={onPercentageChange}>
                    Max
                  </Button>
                </>
              )}
            </div>
          </SectionContainer>
        </ActionContainer>
        <Spacer size={20} />
        <ActionContainer label="To">
          <Spacer size={20} />
          <div className="tf__dialog__flex-row">
            <SectionContainer>
              <Typography variant="h4">{tokenTo.tokenName}</Typography>
              <Spacer size={14} />
              <div className="tf__dialog__flex-row">
                <Typography variant="body-text">Estimated amount received:&nbsp;</Typography>
                <Typography variant="h5">
                  {receiveAmountFormatted}&nbsp;{tokenTo.tokenName}
                </Typography>
              </div>
            </SectionContainer>
          </div>
        </ActionContainer>
        <Spacer size={20} />
        <div className="tf__flex-row-center-vh">
          <ApproveButton
            amountToApprove={getSelectedTokenBalance()}
            onApproveChange={onApproveChange}
            poolDataAdapter={poolDataAdapter}
            spenderAddress={getConfig().vaultContract}
            tokenToApproveTicker={tokenFrom.tokenName}
            tokenToApproveAddress={getSelectedTokenAddress()}
            marginRight={20}
            disabled={approveDisabled}
          />
          <ExecuteButton
            actionName="Swap"
            tempusPool={tempusPool}
            disabled={executeDisabled}
            onExecute={onExecute}
            onExecuted={onExecuted}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailSwap;
