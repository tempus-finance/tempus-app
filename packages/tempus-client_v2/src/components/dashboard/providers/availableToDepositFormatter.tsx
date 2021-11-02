import { DataTypeProvider } from '@devexpress/dx-react-grid';
import { ethers, BigNumber } from 'ethers';
import { DashboardRow, isChildRow, isParentRow } from '../../../interfaces/DashboardRow';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
import Spacer from '../../spacer/spacer';
import Typography from '../../typography/Typography';
import TokenIcon from '../../tokenIcon';
import './availableToDepositFormatter.scss';
import { PoolDataContext, ContextPoolData, getDataForPool } from '../../../context/poolData';
import { useContext, useMemo } from 'react';
import { CircularProgress } from '@material-ui/core';

const AvailableToDepositFormatter = (props: DataTypeProvider.ValueFormatterProps) => {
  const row = props.row as DashboardRow;

  const { poolData } = useContext(PoolDataContext);

  const parentAvailableToDeposit = useMemo(() => {
    return getParentAvailableToDeposit(row.token, poolData);
  }, [poolData, row.token]);

  const childAvailableToDeposit = useMemo(() => {
    if (isChildRow(row)) {
      return getChildAvailableToDeposit(row.id, poolData);
    }
    return null;
  }, [poolData, row]);

  if (isParentRow(row)) {
    if (!parentAvailableToDeposit) {
      return <CircularProgress size={16} />;
    }

    return (
      <Typography color="default" variant="body-text">
        {`$${NumberUtils.formatWithMultiplier(Number(ethers.utils.formatEther(parentAvailableToDeposit)), 1)}`}
      </Typography>
    );
  }

  if (isChildRow(row)) {
    if (!childAvailableToDeposit) {
      return <CircularProgress size={16} />;
    }

    return (
      <div className="tf__dashboard__grid__avail-to-deposit-container">
        <div className="tf__dashboard__grid__avail-to-deposit-token-row">
          <>
            <p>
              {NumberUtils.formatWithMultiplier(
                Number(ethers.utils.formatEther(childAvailableToDeposit.backingToken)),
                2,
              )}
            </p>
            <div className="tf__dashboard__grid__avail-to-deposit-token-ticker-container">
              <Typography variant="body-text">{row.backingTokenTicker}</Typography>
              <Spacer size={5} />
              <TokenIcon ticker={row.backingTokenTicker} />
            </div>
          </>
        </div>
        <div className="tf__dashboard__grid__avail-to-deposit-token-row">
          <>
            <p>
              {NumberUtils.formatWithMultiplier(
                Number(ethers.utils.formatEther(childAvailableToDeposit.yieldBearingToken)),
                2,
              )}
            </p>
            <div className="tf__dashboard__grid__avail-to-deposit-token-ticker-container">
              <Typography variant="body-text">{row.yieldBearingTokenTicker}</Typography>
              <Spacer size={5} />
              <TokenIcon ticker={row.yieldBearingTokenTicker} />
            </div>
          </>
        </div>
      </div>
    );
  }
};

function getParentAvailableToDeposit(parentId: Ticker, poolData: ContextPoolData[]) {
  const parentChildren = poolData.filter(data => {
    return data.backingTokenTicker === parentId;
  });

  // In case balance is still loading for some of the parent children, return null (show loading circle in dashboard)
  const childrenStillLoading = parentChildren.some(child => child.userAvailableToDepositUSD === null);
  if (childrenStillLoading) {
    return null;
  }

  const processedTokens: Ticker[] = [];
  let parentAvailableToDeposit = BigNumber.from('0');
  parentChildren.forEach(child => {
    if (child.userAvailableToDepositUSD) {
      if (processedTokens.indexOf(child.backingTokenTicker) === -1) {
        parentAvailableToDeposit = parentAvailableToDeposit.add(child.userAvailableToDepositUSD.backingTokenAmount);
        processedTokens.push(child.backingTokenTicker);
      }
      if (processedTokens.indexOf(child.yieldBearingTokenTicker) === -1) {
        parentAvailableToDeposit = parentAvailableToDeposit.add(
          child.userAvailableToDepositUSD.yieldBearingTokenAmount,
        );
        processedTokens.push(child.yieldBearingTokenTicker);
      }
    }
  });

  return parentAvailableToDeposit;
}

function getChildAvailableToDeposit(id: string, poolData: ContextPoolData[]) {
  const data = getDataForPool(id, poolData);

  if (!data.userYieldBearingTokenBalance || !data.userBackingTokenBalance) {
    return null;
  }

  return {
    backingToken: data.userBackingTokenBalance,
    yieldBearingToken: data.userYieldBearingTokenBalance,
  };
}

export default AvailableToDepositFormatter;
