import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '../../typography/Typography';
import AddIcon from '@material-ui/icons/Add';
import ConnectingArrow from '../shared/connectingArrow';
import ActionContainer from '../shared/actionContainer';
import ActionContainerGrid from '../shared/actionContainerGrid';
import Execute from '../shared/execute';
import TokenDescriptor from '../../tokenDescriptor';
import NumberUtils from '../../../services/NumberUtils';
import CurrencyInput from '../../currencyInput';
import { DashboardRowChild } from '../../../interfaces';
import SectionContainer from '../shared/sectionContainer';
import Spacer from '../../spacer/spacer';
import { Divider } from '@material-ui/core';

import './detailPoolAddLiquidity.scss';
import ScaleIcon from '../../icons/ScaleIcon';
import ApproveButton from '../shared/approveButton';
import { BigNumber } from '@ethersproject/bignumber';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import { JsonRpcSigner } from '@ethersproject/providers';
import getConfig from '../../../utils/get-config';
import { ethers } from 'ethers';
import PlusIconContainer from '../shared/plusIconContainer';
import { div18f, mul18f } from '../../../utils/wei-math';

type DetailPoolAddLiquidityInProps = {
  content: DashboardRowChild;
  poolDataAdapter: PoolDataAdapter | null;
  signer: JsonRpcSigner | null;
  userWalletAddress: string;
};

type DetailPoolAddLiquidityOutProps = {};

type DetailPoolAddLiquidityProps = DetailPoolAddLiquidityInProps & DetailPoolAddLiquidityOutProps;

const DetailPoolAddLiquidity: FC<DetailPoolAddLiquidityProps> = props => {
  const { content, poolDataAdapter, signer, userWalletAddress } = props;

  const [principalsBalance, setPrincipalsBalance] = useState<BigNumber | null>(null);
  const [yieldsBalance, setYieldsBalance] = useState<BigNumber | null>(null);

  const [principalsPercentage, setPrincipalsPercentage] = useState<number | null>(null);
  const [yieldsPercentage, setYieldsPercentage] = useState<number | null>(null);

  const [principalsAmount, setPrincipalsAmount] = useState<number>(0);
  const [yieldsAmount, setYieldsAmount] = useState<number>(0);

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

    const totalTokens = principalsBalance.add(yieldsBalance);

    setPrincipalsPercentage(Number(ethers.utils.formatEther(div18f(principalsBalance, totalTokens))));
    setYieldsPercentage(Number(ethers.utils.formatEther(div18f(yieldsBalance, totalTokens))));
  }, [principalsBalance, yieldsBalance, setPrincipalsPercentage, setYieldsPercentage]);

  const principalsBalanceFormatted = useMemo(() => {
    if (!principalsBalance) {
      return;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(principalsBalance), 3);
  }, [principalsBalance]);

  const yieldsBalanceFormatted = useMemo(() => {
    if (!yieldsBalance) {
      return;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(yieldsBalance), 3);
  }, [yieldsBalance]);

  return (
    <>
      <SectionContainer>
        <Typography variant="h4">Pool rations</Typography>
        <div className="tf__flex-row-center-vh">
          <Typography variant="body-text">
            {principalsPercentage && NumberUtils.formatPercentage(principalsPercentage, 3)}
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
            {yieldsPercentage && NumberUtils.formatPercentage(yieldsPercentage, 3)}
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
              <Typography variant="h5">2400 LP Tokens</Typography>
            </div>
            <Typography variant="body-text">45% share of Pool</Typography>
          </div>
        </SectionContainer>
      </ActionContainer>

      <Spacer size={20} />
      <div className="tf__flex-row-center-v">
        <Button color="secondary" variant="contained" onClick={() => {}} disabled={false}>
          <Typography variant="h5" color="inverted">
            Execute
          </Typography>
        </Button>
      </div>
    </>
  );
};

export default DetailPoolAddLiquidity;
