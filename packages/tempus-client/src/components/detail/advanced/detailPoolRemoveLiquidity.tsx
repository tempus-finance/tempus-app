import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import Button from '@material-ui/core/Button';
import { Context } from '../../../context';
import { DashboardRowChild } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import NumberUtils from '../../../services/NumberUtils';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import getConfig from '../../../utils/get-config';
import Typography from '../../typography/Typography';
import CurrencyInput from '../../currencyInput';
import Spacer from '../../spacer/spacer';
import ActionContainer from '../shared/actionContainer';
import SectionContainer from '../shared/sectionContainer';
import PlusIconContainer from '../shared/plusIconContainer';
import ApproveButton from '../shared/approveButton';

type DetailPoolAddLiquidityInProps = {
  content: DashboardRowChild;
  poolDataAdapter: PoolDataAdapter | null;
  tempusPool: TempusPool;
};

type DetailPoolAddLiquidityOutProps = {};

type DetailPoolAddLiquidityProps = DetailPoolAddLiquidityInProps & DetailPoolAddLiquidityOutProps;

const DetailPoolAddLiquidity: FC<DetailPoolAddLiquidityProps> = ({ content, poolDataAdapter, tempusPool }) => {
  const { data } = useContext(Context);

  const [amount, setAmount] = useState<number>(0);
  const [estimatedPrincipals, setEstimatedPrincipals] = useState<BigNumber | null>(null);
  const [estimatedYields, setEstimatedYields] = useState<BigNumber | null>(null);
  const [executeDisabled, setExecuteDisabled] = useState<boolean>(true);

  const onAmountChange = useCallback(
    (amount: number | undefined) => {
      if (!!amount && !isNaN(amount)) {
        setAmount(amount);
      }
    },
    [setAmount],
  );

  const onAmountPercentageChange = useCallback(
    (event: any) => {
      const percentage = event.currentTarget.value;
      if (!!data.userLPBalance && !isNaN(percentage)) {
        const balanceAsNumber = Number(ethers.utils.formatEther(data.userLPBalance));
        setAmount(balanceAsNumber * Number(percentage));
      }
    },
    [data.userLPBalance, setAmount],
  );

  // Fetch estimated share tokens returned
  useEffect(() => {
    const getTokensEstimate = async () => {
      if (!poolDataAdapter) {
        return;
      }

      try {
        const estimate = await poolDataAdapter.getExpectedReturnForLPTokens(
          tempusPool.ammAddress,
          ethers.utils.parseEther(amount.toString()),
        );
        setEstimatedPrincipals(estimate.principals);
        setEstimatedYields(estimate.yields);
      } catch (error) {
        console.error('DetailPoolRemoveLiquidity - getTokensEstimate() - Failed to fetch estimated return!', error);
      }
    };
    getTokensEstimate();
  }, [amount, poolDataAdapter, tempusPool.ammAddress]);

  const onApproved = useCallback(() => {
    setExecuteDisabled(false);
  }, [setExecuteDisabled]);

  const onExecute = useCallback(() => {
    const removeLiquidity = async () => {
      if (!poolDataAdapter) {
        return;
      }
      try {
        poolDataAdapter.removeLiquidity(
          tempusPool.ammAddress,
          data.userWalletAddress,
          content.principalTokenAddress,
          content.yieldTokenAddress,
          ethers.utils.parseEther(amount.toString()),
        );
      } catch (error) {
        console.error(
          'DetailPoolRemoveLiquidity - removeLiquidity() - Failed to remove liquidity from tempus pool AMM!',
          error,
        );
      }
    };
    removeLiquidity();
  }, [
    amount,
    content.principalTokenAddress,
    content.yieldTokenAddress,
    tempusPool.ammAddress,
    data.userWalletAddress,
    poolDataAdapter,
  ]);

  const lpTokenBalanceFormatted = useMemo(() => {
    if (!data.userLPBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(data.userLPBalance), 2);
  }, [data.userLPBalance]);

  const estimatedPrincipalsFormatted = useMemo(() => {
    if (!estimatedPrincipals) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(estimatedPrincipals), 2);
  }, [estimatedPrincipals]);

  const estimatedYieldsFormatted = useMemo(() => {
    if (!estimatedYields) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(estimatedYields), 2);
  }, [estimatedYields]);

  return (
    <>
      <Spacer size={10} />
      <ActionContainer label="From">
        <Spacer size={20} />
        <SectionContainer>
          <div className="tf__flex-row-center-v">
            <div className="tf__flex-column-space-between">
              <Typography variant="h4">LP Tokens</Typography>
              <Spacer size={20} />
              <div className="tf__flex-row-center-v">
                <Typography variant="body-text">Amount</Typography>
                <Spacer size={10} />
                <CurrencyInput defaultValue={amount} onChange={onAmountChange} />
              </div>
            </div>
            <Spacer size={20} />
            <div className="tf__flex-column-space-between">
              <Typography variant="body-text">Balance: {lpTokenBalanceFormatted} LP Tokens</Typography>
              <Spacer size={20} />
              <div className="tf__flex-row-center-v">
                <Button variant="contained" size="small" value="0.25" onClick={onAmountPercentageChange}>
                  25%
                </Button>
                <Spacer size={10} />
                <Button variant="contained" size="small" value="0.5" onClick={onAmountPercentageChange}>
                  50%
                </Button>
                <Spacer size={10} />
                <Button variant="contained" size="small" value="0.75" onClick={onAmountPercentageChange}>
                  75%
                </Button>
                <Spacer size={10} />
                <Button variant="contained" size="small" value="1" onClick={onAmountPercentageChange}>
                  Max
                </Button>
              </div>
            </div>
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
              <Typography variant="body-text">est. {estimatedPrincipalsFormatted} Principals</Typography>
            </SectionContainer>
          </div>
          <PlusIconContainer orientation="vertical" />
          <div className="tf__dialog__flex-row-half-width">
            <SectionContainer>
              <Typography variant="h4">Yields</Typography>
              <Spacer size={14} />
              <Typography variant="body-text">est. {estimatedYieldsFormatted} Yields</Typography>
            </SectionContainer>
          </div>
        </div>
      </ActionContainer>
      <Spacer size={20} />
      <div className="tf__flex-row-center-v">
        <ApproveButton
          amountToApprove={data.userLPBalance}
          onApproved={onApproved}
          poolDataAdapter={poolDataAdapter}
          signer={data.userWalletSigner}
          userWalletAddress={data.userWalletAddress}
          spenderAddress={getConfig().vaultContract}
          tokenToApprove={tempusPool.ammAddress}
        />
        <Spacer size={18} />
        <Button variant="contained" color="secondary" onClick={onExecute} disabled={executeDisabled || amount === 0}>
          <Typography color="inverted" variant="h5">
            Execute
          </Typography>
        </Button>
      </div>
    </>
  );
};

export default DetailPoolAddLiquidity;
