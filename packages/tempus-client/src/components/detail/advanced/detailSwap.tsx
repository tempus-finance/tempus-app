import React, { FC, useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { ethers, BigNumber } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import Button from '@material-ui/core/Button';
import { Context } from '../../../context';
import { DashboardRowChild, PoolShares, Ticker } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import NumberUtils from '../../../services/NumberUtils';
import { getSwapNotification } from '../../../services/NotificationService';
import { SwapKind } from '../../../services/VaultService';
import getConfig from '../../../utils/get-config';
import { mul18f } from '../../../utils/wei-math';
import Typography from '../../typography/Typography';
import CurrencyInput from '../../currencyInput';
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
  const [amount, setAmount] = useState<string>('0');
  const [receiveAmount, setReceiveAmount] = useState<BigNumber | null>(null);

  const [executeDisabled, setExecuteDisabled] = useState<boolean>(true);

  const onAmountChange = useCallback(
    (amount: string) => {
      if (amount) {
        setAmount(amount);
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
      const currentBalance = tokenFrom.tokenName === 'Principals' ? userPrincipalsBalance : userYieldsBalance;
      if (!currentBalance) {
        return;
      }
      const percentage = ethers.utils.parseEther(event.currentTarget.value);
      setAmount(ethers.utils.formatEther(mul18f(currentBalance, percentage)));
    },
    [tokenFrom.tokenName, userPrincipalsBalance, userYieldsBalance],
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

  const onApproved = useCallback(() => {
    setExecuteDisabled(false);
  }, []);

  const onExecuted = useCallback(() => {
    setExecuteDisabled(false);
  }, []);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (!poolDataAdapter) {
      return Promise.resolve(undefined);
    }
    setExecuteDisabled(true);

    const amountParsed = ethers.utils.parseEther(amount.toString());
    return poolDataAdapter.swapShareTokens(
      tempusPool.ammAddress,
      SwapKind.GIVEN_IN,
      tokenFrom.tokenAddress,
      tokenTo.tokenAddress,
      amountParsed,
      userWalletAddress,
    );
  }, [poolDataAdapter, amount, tempusPool.ammAddress, tokenFrom.tokenAddress, tokenTo.tokenAddress, userWalletAddress]);

  // Fetch receive amount
  useEffect(() => {
    const getReceiveAmount = async () => {
      if (!poolDataAdapter) {
        return;
      }
      const amountParsed = ethers.utils.parseEther(amount.toString());
      const yieldShareIn = tokenFrom.tokenName === 'Yields';

      if (amountParsed.isZero()) {
        setReceiveAmount(BigNumber.from('0'));
        return;
      }

      try {
        setReceiveAmount(
          await poolDataAdapter.getExpectedReturnForShareToken(tempusPool.ammAddress, amountParsed, yieldShareIn),
        );
      } catch (error) {
        console.error('DetailSwap - getReceiveAmount() - Failed to fetch expected amount of returned tokens!', error);
        return Promise.reject(error);
      }
    };
    getReceiveAmount();
  }, [poolDataAdapter, amount, tempusPool, tokenFrom, setReceiveAmount]);

  const balanceFormatted = useMemo(() => {
    const currentBalance = tokenFrom.tokenName === 'Principals' ? userPrincipalsBalance : userYieldsBalance;
    if (!currentBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(currentBalance), tempusPool.decimalsForUI);
  }, [tempusPool.decimalsForUI, tokenFrom.tokenName, userPrincipalsBalance, userYieldsBalance]);

  const receiveAmountFormatted = useMemo(() => {
    if (!receiveAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(receiveAmount), tempusPool.decimalsForUI);
  }, [receiveAmount, tempusPool.decimalsForUI]);

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
            amountToApprove={tokenFrom.tokenName === 'Principals' ? userPrincipalsBalance : userYieldsBalance}
            onApproved={onApproved}
            poolDataAdapter={poolDataAdapter}
            spenderAddress={getConfig().vaultContract}
            tokenTicker={tokenFrom.tokenName}
            tokenToApprove={selectedToken ? tokenFrom.tokenAddress : ''}
          />
          <Spacer size={20} />
          <ExecuteButton
            actionName="Swap"
            notificationText={getSwapNotification(
              selectedToken || '',
              Number(amount).toFixed(2),
              tokenTo.tokenName,
              receiveAmountFormatted || '',
              content.backingTokenTicker,
              content.protocol,
              content.maturityDate,
            )}
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
