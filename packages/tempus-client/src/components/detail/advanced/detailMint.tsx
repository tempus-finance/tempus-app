import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import Button from '@material-ui/core/Button';
import { DashboardRowChild, Ticker } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import NumberUtils from '../../../services/NumberUtils';
import getConfig from '../../../utils/get-config';
import Typography from '../../typography/Typography';
import Spacer from '../../spacer/spacer';
import TokenSelector from '../../tokenSelector';
import CurrencyInput from '../../currencyInput';
import ActionContainer from '../shared/actionContainer';
import Execute from '../shared/execute';
import SectionContainer from '../shared/sectionContainer';
import PlusIconContainer from '../shared/plusIconContainer';

import './detailMint.scss';

type DetailMintInProps = {
  content: DashboardRowChild;
  tempusPool: TempusPool;
  userWalletAddress: string;
  signer: JsonRpcSigner | null;
  poolDataAdapter: PoolDataAdapter | null;
};

type DetailMintOutProps = {};

type DetailMintProps = DetailMintInProps & DetailMintOutProps;

const DetailMint: FC<DetailMintProps> = props => {
  const { content, tempusPool, userWalletAddress, signer, poolDataAdapter } = props;
  const { supportedTokens, backingTokenAddress, yieldBearingTokenAddress } = content;
  const [backingToken, yieldBearingToken] = supportedTokens;

  const [selectedToken, setSelectedToken] = useState<Ticker | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [balance, setBalance] = useState<BigNumber | null>(null);
  const [estimatedTokens, setEstimatedTokens] = useState<BigNumber | null>(null);
  const [approvedAllowance, setApprovedAllowance] = useState<number | null>(null);

  const onTokenChange = useCallback(
    (token: Ticker | undefined) => {
      if (!token) {
        return;
      }
      setSelectedToken(token);
    },
    [setSelectedToken],
  );

  const onAmountChange = useCallback(
    (amount: number | undefined) => {
      if (amount === 0 || amount) {
        setAmount(amount);
      } else {
        setAmount(0);
      }
    },
    [setAmount],
  );

  const onPercentageChange = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const percentage = event.currentTarget.value;
      if (balance) {
        setAmount(Number(ethers.utils.formatEther(balance)) * Number(percentage));
      }
    },
    [balance, setAmount],
  );

  useEffect(() => {
    const retrieveBalances = async () => {
      if (signer && tempusPool.address && tempusPool.ammAddress && poolDataAdapter) {
        try {
          let balance: BigNumber | null = null;
          if (selectedToken === backingToken) {
            balance = await poolDataAdapter.getTokenBalance(backingTokenAddress, userWalletAddress, signer);
          } else if (selectedToken === yieldBearingToken) {
            balance = await poolDataAdapter.getTokenBalance(yieldBearingTokenAddress, userWalletAddress, signer);
          }

          setBalance(balance);
        } catch (error) {
          console.error('DetailMint - retrieveBalances() - Failed to retrieve balance for selected token!', error);
          return Promise.reject(error);
        }
      }
    };
    retrieveBalances();
  }, [
    tempusPool,
    userWalletAddress,
    signer,
    poolDataAdapter,
    selectedToken,
    backingToken,
    yieldBearingToken,
    backingTokenAddress,
    yieldBearingTokenAddress,
  ]);

  const onApprove = useCallback(() => {
    const approve = async () => {
      if (signer && balance && poolDataAdapter) {
        try {
          const approveTransaction = await poolDataAdapter.approveToken(
            selectedToken === backingToken ? backingTokenAddress : yieldBearingTokenAddress,
            getConfig().tempusControllerContract,
            balance,
            signer,
          );
          if (approveTransaction) {
            await approveTransaction.wait();
          }
        } catch (error) {
          console.log(`DetailMint - onApprove() - Failed to approve token!`, error);
        }
      }
    };
    approve();
  }, [backingToken, backingTokenAddress, balance, poolDataAdapter, selectedToken, signer, yieldBearingTokenAddress]);

  const onExecute = useCallback(() => {
    const execute = async () => {
      if (!poolDataAdapter) {
        return;
      }

      const amountParsed = ethers.utils.parseEther(amount.toString());

      try {
        await poolDataAdapter.deposit(
          tempusPool.address,
          amountParsed,
          userWalletAddress,
          selectedToken === backingToken,
          selectedToken === 'ETH',
        );
      } catch (error) {
        console.error('DetailMint - execute() - Failed to execute mint transaction!', error);
        return Promise.reject(error);
      }
    };
    execute();
  }, [amount, backingToken, poolDataAdapter, selectedToken, tempusPool.address, userWalletAddress]);

  // Fetch estimated tokens returned
  useEffect(() => {
    const getEstimates = async () => {
      if (!poolDataAdapter) {
        return;
      }
      const isBackingToken = selectedToken === backingToken;
      const amountParsed = ethers.utils.parseEther(amount.toString());

      try {
        setEstimatedTokens(
          await poolDataAdapter.estimatedMintedShares(tempusPool.address, amountParsed, isBackingToken),
        );
      } catch (error) {
        console.error('DetailMint - getEstimates() - Failed to get estimate for selected token!', error);
      }
    };
    getEstimates();
  }, [amount, backingToken, poolDataAdapter, selectedToken, tempusPool]);

  // Fetch allowance for currently selected token
  useEffect(() => {
    const getApprovedAllowance = async () => {
      if (!signer || !poolDataAdapter || !selectedToken) {
        return;
      }
      const poolAddress = tempusPool.address;
      const isBacking = selectedToken === backingToken;

      try {
        setApprovedAllowance(
          await poolDataAdapter.getApprovedAllowance(userWalletAddress, poolAddress, isBacking, signer),
        );
      } catch (error) {
        console.error(
          'DetailMint - getApprovedAllowance() - Failed to get approved allowance for selected token!',
          error,
        );
      }
    };
    getApprovedAllowance();
  }, [backingToken, poolDataAdapter, selectedToken, signer, tempusPool.address, userWalletAddress]);

  const balanceFormatted = useMemo(() => {
    if (!balance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(balance), 2);
  }, [balance]);

  const estimatedTokensFormatted = useMemo(() => {
    if (!estimatedTokens) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(estimatedTokens), 2);
  }, [estimatedTokens]);

  const approveDisabled = useMemo(() => {
    const alreadyApproved = !!approvedAllowance && amount < approvedAllowance;
    const amountHigherThenBalance = !!balance && ethers.utils.parseEther(amount.toString()).gt(balance);

    return !selectedToken || alreadyApproved || amountHigherThenBalance;
  }, [selectedToken, balance, amount, approvedAllowance]);

  const executeDisabled = useMemo(() => {
    const tokensApproved = !!approvedAllowance && amount < approvedAllowance;
    const amountHigherThenBalance = !!balance && ethers.utils.parseEther(amount.toString()).gt(balance);

    return !selectedToken || !amount || !tokensApproved || amountHigherThenBalance;
  }, [amount, approvedAllowance, balance, selectedToken]);

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
              <TokenSelector tickers={supportedTokens} onTokenChange={onTokenChange} />
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
            <div className="tf__dialog__flex-row-half-width">
              <SectionContainer>
                <Typography variant="h4">Principals</Typography>
                <Spacer size={14} />
                <Typography variant="body-text">est. {estimatedTokensFormatted} Principals</Typography>
              </SectionContainer>
            </div>
            <PlusIconContainer orientation="vertical" />
            <div className="tf__dialog__flex-row-half-width">
              <SectionContainer>
                <Typography variant="h4">Yields</Typography>
                <Spacer size={14} />
                <Typography variant="body-text">est. {estimatedTokensFormatted} Yields</Typography>
              </SectionContainer>
            </div>
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

export default DetailMint;
