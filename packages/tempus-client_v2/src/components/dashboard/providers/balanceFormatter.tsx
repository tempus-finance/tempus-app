import { ethers, BigNumber } from 'ethers';
import { useContext, useEffect, useMemo, useState } from 'react';
import { CircularProgress } from '@material-ui/core';
import { PoolData, getDataForPool, PoolDataContext } from '../../../context/poolDataContext';
import { UserSettingsContext } from '../../../context/userSettingsContext';
import { WalletContext } from '../../../context/walletContext';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
import Typography from '../../typography/Typography';
import { ZERO } from '../../../constants';
import Spacer from '../../spacer/spacer';
import TokenIcon from '../../tokenIcon';

import './balanceFormatter.scss';

const BalanceFormatter = ({ row }: any) => {
  const isChild = useMemo(() => Boolean(row.parentId), [row.parentId]);

  const { poolData } = useContext(PoolDataContext);
  const { userWalletConnected } = useContext(WalletContext);
  const { showFiat } = useContext(UserSettingsContext);
  const [balance, setBalance] = useState<BigNumber | null>(null);

  const balanceFormatted = useMemo(() => {
    if (!balance) {
      return null;
    }

    let content;

    if (showFiat) {
      const currencySymbol = '$';
      content = `${currencySymbol}${NumberUtils.formatWithMultiplier(ethers.utils.formatEther(balance))}`;
    } else {
      content = (
        <>
          {NumberUtils.formatWithMultiplier(ethers.utils.formatEther(balance), 2)}
          <Spacer size={5} />
          <TokenIcon ticker={poolData[0].backingToken} />
        </>
      );
    }

    return <div className="tc__dashboard__grid__balance__container">{content}</div>;
  }, [poolData, balance, showFiat]);

  useEffect(() => {
    if (!isChild) {
      if (showFiat) {
        setBalance(getParentBalanceInFiat(row.id, poolData));
      } else {
        setBalance(getParentBalanceInBackingToken(row.id, poolData));
      }
    } else {
      if (showFiat) {
        setBalance(getChildBalanceInFiat(row.id, poolData));
      } else {
        setBalance(getChildBalanceInBackingToken(row.id, poolData));
      }
    }
  }, [isChild, poolData, row.id, showFiat]);

  if (!userWalletConnected) {
    return <div></div>;
  }

  return (
    <>
      {balanceFormatted && (
        <Typography color="default" variant="body-text">
          {balanceFormatted}
        </Typography>
      )}
      {!balanceFormatted && <CircularProgress size={16} />}
    </>
  );
};
export default BalanceFormatter;

const getParentBalanceInFiat = (parentId: Ticker, poolData: PoolData[]): BigNumber | null => {
  const parentChildren = poolData.filter(data => {
    return data.backingToken === parentId;
  });

  // In case balance is still loading for some of the parent children, return null (show loading circle in dashboard)
  const childrenStillLoading = getChildrenStillLoadingInFiat(parentChildren);
  if (childrenStillLoading) {
    return null;
  }

  let parentBalance = BigNumber.from('0');
  parentChildren.forEach(child => {
    if (child.isNegativeYield && child.userBalanceUSD?.lte(ZERO)) {
      return;
    }

    parentBalance = parentBalance.add(child.userBalanceUSD || BigNumber.from('0'));
  });

  return parentBalance;
};

const getParentBalanceInBackingToken = (parentId: Ticker, poolData: PoolData[]): BigNumber | null => {
  const parentChildren = poolData.filter(data => {
    return data.backingToken === parentId;
  });

  // In case balance is still loading for some of the parent children, return null (show loading circle in dashboard)
  const childrenStillLoading = getChildrenStillLoadingInBackingToken(parentChildren);
  if (childrenStillLoading) {
    return null;
  }

  let parentBalance = BigNumber.from('0');
  parentChildren.forEach(child => {
    if (child.isNegativeYield && child.userBalanceInBackingToken?.lte(ZERO)) {
      return;
    }

    parentBalance = parentBalance.add(child.userBalanceInBackingToken || BigNumber.from('0'));
  });

  return parentBalance;
};

const getChildrenStillLoadingInFiat = (children: PoolData[]): boolean =>
  children.some(child => child.userBalanceUSD === null);
const getChildrenStillLoadingInBackingToken = (children: PoolData[]): boolean =>
  children.some(child => child.userBackingTokenBalance === null);

const getChildBalanceInFiat = (childId: string, poolData: PoolData[]): BigNumber | null =>
  getDataForPool(childId, poolData).userBalanceUSD;

const getChildBalanceInBackingToken = (childId: string, poolData: PoolData[]): BigNumber | null =>
  getDataForPool(childId, poolData).userBalanceInBackingToken;
