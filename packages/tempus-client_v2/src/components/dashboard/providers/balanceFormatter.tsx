import { ethers, BigNumber } from 'ethers';
import { useContext, useMemo } from 'react';
import { CircularProgress } from '@material-ui/core';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
import Typography from '../../typography/Typography';
import { PoolData, getDataForPool, PoolDataContext } from '../../../context/poolDataContext';

const BalanceFormatter = ({ row }: any) => {
  const isChild = Boolean(row.parentId);

  const { poolData } = useContext(PoolDataContext);

  const balanceFormatted = useMemo(() => {
    let balance: BigNumber | null;
    if (!isChild) {
      balance = getParentBalance(row.id, poolData);
    } else {
      balance = getChildBalance(row.id, poolData);
    }

    if (!balance) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(balance));
  }, [isChild, poolData, row.id]);

  return (
    <>
      {balanceFormatted && (
        <Typography color="default" variant="body-text">
          ${balanceFormatted}
        </Typography>
      )}
      {!balanceFormatted && <CircularProgress size={16} />}
    </>
  );
};
export default BalanceFormatter;

function getParentBalance(parentId: Ticker, poolData: PoolData[]): BigNumber | null {
  const parentChildren = poolData.filter(data => {
    return data.backingTokenTicker === parentId;
  });

  // In case balance is still loading for some of the parent children, return null (show loading circle in dashboard)
  const childrenStillLoading = parentChildren.some(child => child.userBalanceUSD === null);
  if (childrenStillLoading) {
    return null;
  }

  let parentBalance = BigNumber.from('0');
  parentChildren.forEach(child => {
    parentBalance = parentBalance.add(child.userBalanceUSD || BigNumber.from('0'));
  });

  return parentBalance;
}

function getChildBalance(childId: string, poolData: PoolData[]): BigNumber | null {
  return getDataForPool(childId, poolData).userBalanceUSD;
}
