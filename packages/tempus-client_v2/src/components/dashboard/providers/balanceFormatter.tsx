import { ethers, BigNumber } from 'ethers';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
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
import {
  dynamicPoolDataState,
  DynamicPoolStateData,
  negativeYieldPoolDataState,
  NegativeYieldStateData,
} from '../../../state/PoolDataState';

const BalanceFormatter = ({ row }: any) => {
  const isChild = useMemo(() => Boolean(row.parentId), [row.parentId]);

  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const negativeYieldPoolData = useHookState(negativeYieldPoolDataState).attach(Downgraded).get();

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
        setBalance(getParentBalanceInFiat(row.id, poolData, dynamicPoolData, negativeYieldPoolData));
      } else {
        setBalance(getParentBalanceInBackingToken(row.id, poolData, negativeYieldPoolData));
      }
    } else {
      if (showFiat) {
        setBalance(getChildBalanceInFiat(row.id, dynamicPoolData));
      } else {
        setBalance(getChildBalanceInBackingToken(row.id, poolData));
      }
    }
  }, [dynamicPoolData, negativeYieldPoolData, isChild, poolData, row.id, showFiat]);

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

const getParentBalanceInFiat = (
  parentId: Ticker,
  poolData: PoolData[],
  dynamicPoolData: DynamicPoolStateData,
  negativeYieldPoolData: NegativeYieldStateData,
): BigNumber | null => {
  const parentChildren = poolData.filter(data => {
    return data.backingToken === parentId;
  });

  // In case balance is still loading for some of the parent children, return null (show loading circle in dashboard)
  const childrenStillLoading = getChildrenStillLoadingInFiat(parentChildren, dynamicPoolData);
  if (childrenStillLoading) {
    return null;
  }

  let parentBalance = BigNumber.from('0');
  parentChildren.forEach(child => {
    if (negativeYieldPoolData[child.address] && dynamicPoolData[child.address].userBalanceUSD?.lte(ZERO)) {
      return;
    }

    parentBalance = parentBalance.add(dynamicPoolData[child.address].userBalanceUSD || BigNumber.from('0'));
  });

  return parentBalance;
};

const getParentBalanceInBackingToken = (
  parentId: Ticker,
  poolData: PoolData[],
  negativeYieldPoolData: NegativeYieldStateData,
): BigNumber | null => {
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
    if (negativeYieldPoolData[child.address] && child.userBalanceInBackingToken?.lte(ZERO)) {
      return;
    }

    parentBalance = parentBalance.add(child.userBalanceInBackingToken || BigNumber.from('0'));
  });

  return parentBalance;
};

const getChildrenStillLoadingInFiat = (children: PoolData[], dynamicPoolData: DynamicPoolStateData): boolean =>
  children.some(child => dynamicPoolData[child.address].userBalanceUSD === null);
const getChildrenStillLoadingInBackingToken = (children: PoolData[]): boolean =>
  children.some(child => child.userBackingTokenBalance === null);

const getChildBalanceInFiat = (childId: string, dynamicPoolData: DynamicPoolStateData): BigNumber | null =>
  dynamicPoolData[childId].userBalanceUSD;

const getChildBalanceInBackingToken = (childId: string, poolData: PoolData[]): BigNumber | null =>
  getDataForPool(childId, poolData).userBalanceInBackingToken;
