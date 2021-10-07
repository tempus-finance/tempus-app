import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import Button from '@material-ui/core/Button';
import { Context } from '../../../context';
import { DashboardRowChild } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import NumberUtils from '../../../services/NumberUtils';
import { getPoolLiquidityNotification } from '../../../services/NotificationService';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import getConfig from '../../../utils/get-config';
import { mul18f } from '../../../utils/wei-math';
import Typography from '../../typography/Typography';
import CurrencyInput from '../../currencyInput';
import Spacer from '../../spacer/spacer';
import ActionContainer from '../shared/actionContainer';
import SectionContainer from '../shared/sectionContainer';
import PlusIconContainer from '../shared/plusIconContainer';
import ApproveButton from '../shared/approveButton';
import ExecuteButton from '../shared/executeButton';

type DetailPoolAddLiquidityInProps = {
  content: DashboardRowChild;
  poolDataAdapter: PoolDataAdapter | null;
  tempusPool: TempusPool;
};

type DetailPoolAddLiquidityOutProps = {};

type DetailPoolAddLiquidityProps = DetailPoolAddLiquidityInProps & DetailPoolAddLiquidityOutProps;

const DetailPoolAddLiquidity: FC<DetailPoolAddLiquidityProps> = ({ content, poolDataAdapter, tempusPool }) => {
  const { data } = useContext(Context);

  const [amount, setAmount] = useState<string>('0');
  const [estimatedPrincipals, setEstimatedPrincipals] = useState<BigNumber | null>(null);
  const [estimatedYields, setEstimatedYields] = useState<BigNumber | null>(null);
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
   * - Requires user LP token balance to be loaded so we can calculate percentage of that.
   */
  const onPercentageChange = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!data.userLPBalance) {
        return;
      }
      const percentage = ethers.utils.parseEther(event.currentTarget.value);
      setAmount(ethers.utils.formatEther(mul18f(data.userLPBalance, percentage)));
    },
    [data.userLPBalance],
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
  }, []);

  const onExecuted = useCallback(() => {
    setExecuteDisabled(false);
  }, []);

  const onExecute = useCallback((): Promise<ethers.ContractTransaction | undefined> => {
    if (!poolDataAdapter) {
      return Promise.resolve(undefined);
    }
    setExecuteDisabled(true);

    return poolDataAdapter.removeLiquidity(
      tempusPool.ammAddress,
      data.userWalletAddress,
      content.principalTokenAddress,
      content.yieldTokenAddress,
      ethers.utils.parseEther(amount.toString()),
    );
  }, [
    poolDataAdapter,
    tempusPool.ammAddress,
    data.userWalletAddress,
    content.principalTokenAddress,
    content.yieldTokenAddress,
    amount,
  ]);

  const lpTokenBalanceFormatted = useMemo(() => {
    if (!data.userLPBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(data.userLPBalance), tempusPool.decimalsForUI);
  }, [data.userLPBalance, tempusPool.decimalsForUI]);

  const estimatedPrincipalsFormatted = useMemo(() => {
    if (!estimatedPrincipals) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(estimatedPrincipals), tempusPool.decimalsForUI);
  }, [estimatedPrincipals, tempusPool.decimalsForUI]);

  const estimatedYieldsFormatted = useMemo(() => {
    if (!estimatedYields) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(estimatedYields), tempusPool.decimalsForUI);
  }, [estimatedYields, tempusPool.decimalsForUI]);

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
          tokenTicker="LP"
          amountToApprove={data.userLPBalance}
          onApproved={onApproved}
          poolDataAdapter={poolDataAdapter}
          spenderAddress={getConfig().vaultContract}
          tokenToApprove={tempusPool.ammAddress}
        />
        <Spacer size={18} />
        <ExecuteButton
          notificationText={getPoolLiquidityNotification(
            content.backingTokenTicker,
            content.protocol,
            content.maturityDate,
          )}
          actionName="Liquidity Withdrawal"
          disabled={executeDisabled}
          onExecute={onExecute}
          onExecuted={onExecuted}
        />
      </div>
    </>
  );
};

export default DetailPoolAddLiquidity;
