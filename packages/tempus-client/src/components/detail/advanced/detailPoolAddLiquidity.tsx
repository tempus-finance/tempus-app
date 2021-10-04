import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Divider, Button } from '@material-ui/core';
import { BigNumber, ethers } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import NumberUtils from '../../../services/NumberUtils';
import getNotificationService from '../../../services/getNotificationService';
import { DashboardRowChild } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import getConfig from '../../../utils/get-config';
import { div18f } from '../../../utils/wei-math';
import Typography from '../../typography/Typography';
import Spacer from '../../spacer/spacer';
import CurrencyInput from '../../currencyInput';
import ActionContainer from '../shared/actionContainer';
import SectionContainer from '../shared/sectionContainer';
import ApproveButton from '../shared/approveButton';
import PlusIconContainer from '../shared/plusIconContainer';
import ScaleIcon from '../../icons/ScaleIcon';

import './detailPoolAddLiquidity.scss';

type DetailPoolAddLiquidityInProps = {
  content: DashboardRowChild;
  tempusPool: TempusPool;
  poolDataAdapter: PoolDataAdapter | null;
  signer: JsonRpcSigner | null;
  userWalletAddress: string;
};

type DetailPoolAddLiquidityOutProps = {};

type DetailPoolAddLiquidityProps = DetailPoolAddLiquidityInProps & DetailPoolAddLiquidityOutProps;

const DetailPoolAddLiquidity: FC<DetailPoolAddLiquidityProps> = props => {
  const { content, poolDataAdapter, signer, userWalletAddress, tempusPool } = props;

  const [principalsBalance, setPrincipalsBalance] = useState<BigNumber | null>(null);
  const [yieldsBalance, setYieldsBalance] = useState<BigNumber | null>(null);

  const [principalsPercentage, setPrincipalsPercentage] = useState<number | null>(null);
  const [yieldsPercentage, setYieldsPercentage] = useState<number | null>(null);

  const [principalsAmount, setPrincipalsAmount] = useState<number>(0);
  const [yieldsAmount, setYieldsAmount] = useState<number>(0);

  const [expectedLPTokens, setExpectedLPTokens] = useState<BigNumber | null>(null);
  const [expectedPoolShare, setExpectedPoolShare] = useState<number | null>(null);

  const onPrincipalsAmountChange = useCallback(
    (amount: number | undefined) => {
      if (!!amount && !isNaN(amount)) {
        setPrincipalsAmount(amount);
      }
    },
    [setPrincipalsAmount],
  );

  const onYieldsAmountChange = useCallback(
    (amount: number | undefined) => {
      if (!!amount && !isNaN(amount)) {
        setYieldsAmount(amount);
      }
    },
    [setYieldsAmount],
  );

  const onPrincipalsPercentageChange = useCallback(
    (event: any) => {
      const percentage = event.currentTarget.value;
      if (!!principalsBalance && !isNaN(percentage)) {
        const balanceAsNumber = Number(ethers.utils.formatEther(principalsBalance));
        setPrincipalsAmount(balanceAsNumber * Number(percentage));
      }
    },
    [principalsBalance, setPrincipalsAmount],
  );

  const onYieldsPercentageChange = useCallback(
    (event: any) => {
      const percentage = event.currentTarget.value;
      if (!!yieldsBalance && !isNaN(percentage)) {
        const balanceAsNumber = Number(ethers.utils.formatEther(yieldsBalance));
        setYieldsAmount(balanceAsNumber * Number(percentage));
      }
    },
    [yieldsBalance, setYieldsAmount],
  );

  // Fetch Principals and Yields balances
  useEffect(() => {
    const fetchTokenBalances = async () => {
      if (!poolDataAdapter || !signer) {
        return;
      }

      const [principalBalance, yieldBalance] = await Promise.all([
        poolDataAdapter.getTokenBalance(content.principalTokenAddress, userWalletAddress, signer),
        poolDataAdapter.getTokenBalance(content.yieldTokenAddress, userWalletAddress, signer),
      ]);

      setPrincipalsBalance(principalBalance);
      setYieldsBalance(yieldBalance);
    };
    fetchTokenBalances();
  }, [content.principalTokenAddress, content.yieldTokenAddress, poolDataAdapter, signer, userWalletAddress]);

  // Calculate pool ratios
  useEffect(() => {
    if (!principalsBalance || !yieldsBalance) {
      return;
    }

    if (principalsBalance.isZero() && yieldsBalance.isZero()) {
      setPrincipalsPercentage(0);
      setYieldsPercentage(0);
    } else if (principalsBalance.isZero() && !yieldsBalance.isZero()) {
      setPrincipalsPercentage(0);
      setYieldsPercentage(1);
    } else if (!principalsBalance.isZero() && yieldsBalance.isZero()) {
      setPrincipalsPercentage(1);
      setYieldsPercentage(0);
    } else {
      const totalTokens = principalsBalance.add(yieldsBalance);

      setPrincipalsPercentage(Number(ethers.utils.formatEther(div18f(principalsBalance, totalTokens))));
      setYieldsPercentage(Number(ethers.utils.formatEther(div18f(yieldsBalance, totalTokens))));
    }
  }, [principalsBalance, yieldsBalance, setPrincipalsPercentage, setYieldsPercentage]);

  // Fetch estimated LP Token amount
  useEffect(() => {
    const fetchEstimatedLPTokens = async () => {
      if (!poolDataAdapter) {
        return;
      }

      try {
        setExpectedLPTokens(
          await poolDataAdapter.getExpectedLPTokensForShares(
            tempusPool.ammAddress,
            content.principalTokenAddress,
            content.yieldTokenAddress,
            ethers.utils.parseEther(principalsAmount.toString()),
            ethers.utils.parseEther(yieldsAmount.toString()),
          ),
        );
      } catch (error) {
        console.error(
          'DetailPoolAddLiquidity - fetchEstimatedLPTokens() - Failed to fetch estimated LP Tokens!',
          error,
        );
      }
    };
    fetchEstimatedLPTokens();
  }, [
    tempusPool.ammAddress,
    content.principalTokenAddress,
    content.yieldTokenAddress,
    principalsAmount,
    yieldsAmount,
    poolDataAdapter,
  ]);

  // Fetch pool share for amount in
  useEffect(() => {
    const fetchExpectedPoolShare = async () => {
      if (!poolDataAdapter || !expectedLPTokens) {
        return;
      }

      try {
        setExpectedPoolShare(await poolDataAdapter.getPoolShareForLPTokensIn(tempusPool.ammAddress, expectedLPTokens));
      } catch (error) {
        console.error(
          'DetailPoolAddLiquidity - fetchExpectedPoolShare() - Failed to fetch expected pool share!',
          error,
        );
      }
    };
    fetchExpectedPoolShare();
  }, [expectedLPTokens, poolDataAdapter, tempusPool.ammAddress]);

  const onExecute = useCallback(() => {
    const provideLiquidity = async () => {
      if (!poolDataAdapter) {
        return;
      }
      try {
        const transaction = await poolDataAdapter.provideLiquidity(
          tempusPool.ammAddress,
          userWalletAddress,
          content.principalTokenAddress,
          content.yieldTokenAddress,
          ethers.utils.parseEther(principalsAmount.toString()),
          ethers.utils.parseEther(yieldsAmount.toString()),
        );
        await transaction.wait();

        getNotificationService().notify('Add Liquidity successful', `Add Liquidity successful!`);
      } catch (error) {
        console.error('DetailPoolAddLiquidity - provideLiquidity() - Failed to provide liquidity!', error);

        getNotificationService().warn('Add Liquidity failed', `Add Liquidity failed!`);
      }
    };
    provideLiquidity();
  }, [
    content.principalTokenAddress,
    content.yieldTokenAddress,
    tempusPool.ammAddress,
    principalsAmount,
    yieldsAmount,
    poolDataAdapter,
    userWalletAddress,
  ]);

  const principalsBalanceFormatted = useMemo(() => {
    if (!principalsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(principalsBalance), 2);
  }, [principalsBalance]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!yieldsBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(yieldsBalance), 2);
  }, [yieldsBalance]);

  const expectedLPTokensFormatted = useMemo(() => {
    if (!expectedLPTokens) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(expectedLPTokens), 2);
  }, [expectedLPTokens]);

  return (
    <>
      <SectionContainer>
        <Typography variant="h4">Pool rations</Typography>
        <div className="tf__flex-row-center-vh">
          <Typography variant="body-text">
            {principalsPercentage !== null && NumberUtils.formatPercentage(principalsPercentage, 3)}
          </Typography>
          <Spacer size={20} />
          <div className="tf__flex-column-center-vh">
            <Typography variant="body-text">Principal</Typography>
            <Divider orientation="horizontal" className="tf__full_width" />
            <Typography variant="body-text">Yield</Typography>
          </div>
          <Spacer size={40} />
          <div className="tf__detail__add__liquidity-icon-container">
            <ScaleIcon />
          </div>
          <Spacer size={40} />
          <div className="tf__flex-column-center-vh">
            <Typography variant="body-text">Yield</Typography>
            <Divider orientation="horizontal" className="tf__full_width" />
            <Typography variant="body-text">Principal</Typography>
          </div>
          <Spacer size={20} />
          <Typography variant="body-text">
            {yieldsPercentage !== null && NumberUtils.formatPercentage(yieldsPercentage, 3)}
          </Typography>
        </div>
      </SectionContainer>
      <Spacer size={15} />
      <ActionContainer label="From">
        <Spacer size={10} />
        <SectionContainer>
          <div className="tf__flex-row-center-v">
            <div className="tf__flex-column-space-between">
              <Typography variant="h4">Principals</Typography>
              <Spacer size={10} />
              <div className="tf__flex-row-center-v">
                <Typography variant="body-text">Amount</Typography>
                <Spacer size={10} />
                <CurrencyInput defaultValue={principalsAmount} onChange={onPrincipalsAmountChange} />
              </div>
            </div>
            <Spacer size={20} />
            <div className="tf__flex-column-space-between">
              {principalsBalanceFormatted && (
                <Typography variant="body-text">Balance {principalsBalanceFormatted}</Typography>
              )}
              <Spacer size={10} />
              <div className="tf__flex-row-center-v">
                <Button variant="contained" size="small" value="0.25" onClick={onPrincipalsPercentageChange}>
                  25%
                </Button>
                <Spacer size={10} />
                <Button variant="contained" size="small" value="0.5" onClick={onPrincipalsPercentageChange}>
                  50%
                </Button>
                <Spacer size={10} />
                <Button variant="contained" size="small" value="0.75" onClick={onPrincipalsPercentageChange}>
                  75%
                </Button>
                <Spacer size={10} />
                <Button variant="contained" size="small" value="1" onClick={onPrincipalsPercentageChange}>
                  Max
                </Button>
              </div>
            </div>
            <Spacer size={20} />
            <div className="tf__flex-column-space-between">
              <ApproveButton
                tokenTicker="Principals"
                amountToApprove={principalsBalance || BigNumber.from('0')}
                onApproved={() => {}}
                poolDataAdapter={poolDataAdapter}
                signer={signer}
                spenderAddress={getConfig().vaultContract}
                tokenToApprove={content.principalTokenAddress}
                userWalletAddress={userWalletAddress}
              />
            </div>
          </div>
        </SectionContainer>
        <PlusIconContainer orientation="horizontal" />
        <SectionContainer>
          <div className="tf__flex-row-center-v">
            <div className="tf__flex-column-space-between">
              <Typography variant="h4">Yields</Typography>
              <Spacer size={10} />
              <div className="tf__flex-row-center-v">
                <Typography variant="body-text">Amount</Typography>
                <Spacer size={10} />
                <CurrencyInput defaultValue={yieldsAmount} onChange={onYieldsAmountChange} />
              </div>
            </div>
            <Spacer size={20} />
            <div className="tf__flex-column-space-between">
              {yieldsBalanceFormatted && <Typography variant="body-text">Balance {yieldsBalanceFormatted}</Typography>}
              <Spacer size={10} />
              <div className="tf__flex-row-center-v">
                <Button variant="contained" size="small" value="0.25" onClick={onYieldsPercentageChange}>
                  25%
                </Button>
                <Spacer size={10} />
                <Button variant="contained" size="small" value="0.5" onClick={onYieldsPercentageChange}>
                  50%
                </Button>
                <Spacer size={10} />
                <Button variant="contained" size="small" value="0.75" onClick={onYieldsPercentageChange}>
                  75%
                </Button>
                <Spacer size={10} />
                <Button variant="contained" size="small" value="1" onClick={onYieldsPercentageChange}>
                  Max
                </Button>
              </div>
            </div>
            <Spacer size={20} />
            <div className="tf__flex-column-space-between">
              <ApproveButton
                tokenTicker="Yields"
                amountToApprove={yieldsBalance || BigNumber.from('0')}
                onApproved={() => {}}
                poolDataAdapter={poolDataAdapter}
                signer={signer}
                spenderAddress={getConfig().vaultContract}
                tokenToApprove={content.yieldTokenAddress}
                userWalletAddress={userWalletAddress}
              />
            </div>
          </div>
        </SectionContainer>
      </ActionContainer>
      <Spacer size={20} />
      <ActionContainer label="To">
        <Spacer size={20} />
        <SectionContainer>
          <Typography variant="h4">LP Tokens</Typography>
          <Spacer size={20} />
          <div className="tf__flex-row-space-between">
            <div className="tf__flex-row-center-v">
              <Typography variant="body-text">Estimate:&nbsp;</Typography>
              <Typography variant="h5">{expectedLPTokensFormatted} LP Tokens</Typography>
            </div>
            <Typography variant="body-text">{NumberUtils.formatPercentage(expectedPoolShare)} share of Pool</Typography>
          </div>
        </SectionContainer>
      </ActionContainer>

      <Spacer size={20} />
      <div className="tf__flex-row-center-v">
        <Button color="secondary" variant="contained" onClick={onExecute} disabled={false}>
          <Typography variant="h5" color="inverted">
            Execute
          </Typography>
        </Button>
      </div>
    </>
  );
};

export default DetailPoolAddLiquidity;
