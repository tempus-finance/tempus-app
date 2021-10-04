import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import Button from '@material-ui/core/Button';
import { DashboardRowChild, PoolShares, Ticker } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import NumberUtils from '../../../services/NumberUtils';
import getNotificationService from '../../../services/getNotificationService';
import { SwapKind } from '../../../services/VaultService';
import getConfig from '../../../utils/get-config';
import Typography from '../../typography/Typography';
import CurrencyInput from '../../currencyInput';
import Spacer from '../../spacer/spacer';
import Execute from '../shared/execute';
import SectionContainer from '../shared/sectionContainer';
import ActionContainer from '../shared/actionContainer';
import TokenSelector from '../../tokenSelector';

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
  const { content, userWalletAddress, poolDataAdapter, signer, tempusPool } = props;
  const { principalTokenAddress, yieldTokenAddress } = content;

  const [tokenFrom, setTokenFrom] = useState<TokenDetail>({
    tokenName: 'Principals',
    tokenAddress: principalTokenAddress,
  });
  const [tokenTo, setTokenTo] = useState<TokenDetail>({
    tokenName: 'Yields',
    tokenAddress: yieldTokenAddress,
  });
  const [selectedToken, setSelectedToken] = useState<Ticker>();
  const [amount, setAmount] = useState<number>(0);
  const [balance, setBalance] = useState<BigNumber | null>(null);
  const [receiveAmount, setReceiveAmount] = useState<BigNumber | null>(null);

  const [approveDisabled, setApproveDisabled] = useState<boolean>(false);
  const [executeDisabled, setExecuteDisabled] = useState<boolean>(false);

  const onAmountChange = useCallback(
    (amount: number | undefined) => {
      if (!!amount && !isNaN(amount)) {
        setAmount(amount);
      }
    },
    [setAmount],
  );

  const onPercentageChange = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const percentage = event.currentTarget.value;

      if (percentage && balance) {
        setAmount(Number(ethers.utils.formatEther(balance)) * Number(percentage));
      }
    },
    [balance, setAmount],
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

  const onApprove = useCallback(() => {
    const approve = async () => {
      if (signer && balance && poolDataAdapter) {
        try {
          const approveTransaction = await poolDataAdapter.approveToken(
            tokenFrom.tokenAddress,
            getConfig().vaultContract,
            balance,
            signer,
          );
          if (approveTransaction) {
            await approveTransaction.wait();
            getNotificationService().notify('Token Approval successful', `Successfully approved ${selectedToken}!`);
            setApproveDisabled(true);
          }
        } catch (error) {
          console.log(
            `DetailSwap - onApprove() - Failed to approve token '${tokenFrom.tokenAddress}' - ${tokenFrom.tokenName}`,
            error,
          );
          getNotificationService().warn('Token Approval failed', `Failed to approve ${selectedToken}!`);
          setApproveDisabled(false);
        }
      }
    };
    setApproveDisabled(true);
    approve();
  }, [signer, balance, poolDataAdapter, tokenFrom.tokenAddress, tokenFrom.tokenName, selectedToken]);

  const onExecute = useCallback(() => {
    const execute = async () => {
      if (!poolDataAdapter) {
        return;
      }

      const amountParsed = ethers.utils.parseEther(amount.toString());

      try {
        const transaction = await poolDataAdapter.swapShareTokens(
          tempusPool.ammAddress,
          SwapKind.GIVEN_IN,
          tokenFrom.tokenAddress,
          tokenTo.tokenAddress,
          amountParsed,
          userWalletAddress,
        );
        await transaction.wait();

        getNotificationService().notify(
          'Swap Successful',
          `Swap from ${tokenFrom.tokenName} to ${tokenTo.tokenName} successful!`,
        );
      } catch (error) {
        setExecuteDisabled(false);
        console.error('DetailSwap - execute() - Failed to execute swap transaction!', error);
        getNotificationService().warn(
          'Swap Failed',
          `Swap from ${tokenFrom.tokenName} to ${tokenTo.tokenName} failed!`,
        );
      }
      setExecuteDisabled(false);
    };
    setExecuteDisabled(true);
    execute();
  }, [
    poolDataAdapter,
    amount,
    tempusPool.ammAddress,
    tokenFrom.tokenAddress,
    tokenFrom.tokenName,
    tokenTo.tokenAddress,
    tokenTo.tokenName,
    userWalletAddress,
  ]);

  // Fetch token from balance
  useEffect(() => {
    if (!poolDataAdapter || !signer) {
      return;
    }
    const getBalance = async () => {
      try {
        setBalance(await poolDataAdapter.getTokenBalance(tokenFrom.tokenAddress, userWalletAddress, signer));
      } catch (error) {
        console.error('DetailSwap - getBalance() - Failed to get token balance!', error);
        return Promise.reject(error);
      }
    };
    getBalance();
  }, [poolDataAdapter, signer, tokenFrom, userWalletAddress, setBalance]);

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
    if (!balance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(balance), 2);
  }, [balance]);

  const receiveAmountFormatted = useMemo(() => {
    if (!receiveAmount) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(receiveAmount), 2);
  }, [receiveAmount]);

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

        <Execute
          onApprove={onApprove}
          approveDisabled={approveDisabled}
          onExecute={onExecute}
          executeDisabled={executeDisabled}
        />
      </div>
    </div>
  );
};

export default DetailSwap;
