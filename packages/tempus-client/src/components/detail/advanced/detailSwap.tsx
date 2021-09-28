import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import Button from '@material-ui/core/Button';
import { DashboardRowChild } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import NumberUtils from '../../../services/NumberUtils';
import { SwapKind } from '../../../services/VaultService';
import getConfig from '../../../utils/get-config';
import SwapIcon from '../../icons/SwapIcon';
import Typography from '../../typography/Typography';
import CurrencyInput from '../../currencyInput';
import Spacer from '../../spacer/spacer';
import Execute from '../shared/execute';
import SectionContainer from '../shared/sectionContainer';
import FloatingButton from '../shared/floatingButton';

interface TokenDetail {
  tokenName: 'Principals' | 'Yields';
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
        // TODO - Do not convert BigNumber to Number - possible overflow issue. Update currency input to work with string numbers.
        setAmount(Number(ethers.utils.formatEther(balance)) * Number(percentage));
      }
    },
    [balance],
  );

  const onSwitchTokens = () => {
    const tokenFromOld: TokenDetail = { ...tokenFrom };
    const tokenToOld: TokenDetail = { ...tokenTo };

    setTokenFrom(tokenToOld);
    setTokenTo(tokenFromOld);
  };

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
            setApproveDisabled(true);
          }
        } catch (error) {
          console.log(
            `DetailSwap - onApprove() - Failed to approve token '${tokenFrom.tokenAddress}' - ${tokenFrom.tokenName}`,
            error,
          );
          setApproveDisabled(false);
        }
      }
    };
    setApproveDisabled(true);
    approve();
  }, [balance, poolDataAdapter, signer, tokenFrom]);

  const onExecute = useCallback(() => {
    const execute = async () => {
      if (!poolDataAdapter) {
        return;
      }

      const amountParsed = ethers.utils.parseEther(amount.toString());

      await poolDataAdapter.swapShareTokens(
        tempusPool.ammAddress,
        SwapKind.GIVEN_IN,
        tokenFrom.tokenAddress,
        tokenTo.tokenAddress,
        amountParsed,
        userWalletAddress,
      );
      setExecuteDisabled(false);
    };
    setExecuteDisabled(true);
    execute();
  }, [amount, poolDataAdapter, tempusPool.ammAddress, tokenFrom.tokenAddress, tokenTo.tokenAddress, userWalletAddress]);

  // Fetch token from balance
  useEffect(() => {
    if (!poolDataAdapter || !signer) {
      return;
    }
    const getBalance = async () => {
      setBalance(await poolDataAdapter.getTokenBalance(tokenFrom.tokenAddress, userWalletAddress, signer));
    };
    getBalance();
  }, [poolDataAdapter, signer, tokenFrom, userWalletAddress]);

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

      setReceiveAmount(
        await poolDataAdapter.getExpectedReturnForShareToken(tempusPool.ammAddress, amountParsed, yieldShareIn),
      );
    };
    getReceiveAmount();
  }, [poolDataAdapter, amount, tempusPool, tokenFrom]);

  const balanceFormatted = useMemo(() => {
    if (!balance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(balance), 4);
  }, [balance]);

  const receiveAmountFormatted = useMemo(() => {
    if (!receiveAmount) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(receiveAmount), 4);
  }, [receiveAmount]);

  return (
    <div role="tabpanel">
      <div className="tf__dialog__content-tab">
        <Spacer size={25} />
        <SectionContainer>
          <Typography variant="h4">{tokenFrom.tokenName}</Typography> <Spacer size={16} />
          <div className="tf__dialog__flex-row">
            <Typography variant="body-text">Amount</Typography>
            <Spacer size={10} />
            <CurrencyInput defaultValue={amount} onChange={onAmountChange} />
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
          <Spacer size={14} />
          <div className="tf__dialog__flex-row">
            <Typography variant="body-text">Balance: {balanceFormatted}</Typography>
          </div>
          <Spacer size={30} />
        </SectionContainer>
        <FloatingButton startOffset={20} onClick={onSwitchTokens}>
          <SwapIcon />
          <Spacer size={10} />
          <Typography variant="body-text">Switch tokens</Typography>
        </FloatingButton>
        <SectionContainer>
          <Spacer size={20} />
          <Typography variant="h4">{tokenTo.tokenName}</Typography>
          <Spacer size={15} />
          <div className="tf__dialog__flex-row">
            <Typography variant="body-text">Estimated amount received:&nbsp;</Typography>
            <Typography variant="body-text">{receiveAmountFormatted}</Typography>
          </div>
        </SectionContainer>

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
