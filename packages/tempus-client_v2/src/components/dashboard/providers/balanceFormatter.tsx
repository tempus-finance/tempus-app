import { ethers, BigNumber } from 'ethers';
import { useContext, useMemo } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { CircularProgress } from '@material-ui/core';
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
  staticPoolDataState,
  StaticPoolDataMap,
} from '../../../state/PoolDataState';

const BalanceFormatter = ({ row }: any) => {
  const isChild = useMemo(() => Boolean(row.parentId), [row.parentId]);

  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const staticPoolData = useHookState(staticPoolDataState).attach(Downgraded).get();
  const negativeYieldPoolData = useHookState(negativeYieldPoolDataState).attach(Downgraded).get();

  const { userWalletConnected } = useContext(WalletContext);
  const { showFiat } = useContext(UserSettingsContext);

  const getBalance = () => {
    if (!isChild) {
      if (showFiat) {
        return getParentBalanceInFiat(row.id, staticPoolData, dynamicPoolData, negativeYieldPoolData);
      } else {
        return getParentBalanceInBackingToken(row.id, staticPoolData, dynamicPoolData, negativeYieldPoolData);
      }
    } else {
      if (showFiat) {
        return getChildBalanceInFiat(row.id, dynamicPoolData);
      } else {
        return getChildBalanceInBackingToken(row.id, dynamicPoolData);
      }
    }
  };
  const balance = getBalance();

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
          <TokenIcon ticker={row.token} />
        </>
      );
    }

    return <div className="tc__dashboard__grid__balance__container">{content}</div>;
  }, [balance, showFiat, row.token]);

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
  staticPoolData: StaticPoolDataMap,
  dynamicPoolData: DynamicPoolStateData,
  negativeYieldPoolData: NegativeYieldStateData,
): BigNumber | null => {
  const parentChildrenAddresses: string[] = [];
  for (const key in dynamicPoolData) {
    if (
      staticPoolData[key].backingToken === parentId &&
      (!negativeYieldPoolData[key] || dynamicPoolData[key].userBalanceUSD?.gt(ZERO))
    ) {
      parentChildrenAddresses.push(key);
    }
  }

  // In case balance is still loading for some of the parent children, return null (show loading circle in dashboard)
  const childrenStillLoading = getChildrenStillLoadingInFiat(parentChildrenAddresses, dynamicPoolData);
  if (childrenStillLoading) {
    return null;
  }

  let parentBalance = BigNumber.from('0');
  parentChildrenAddresses.forEach(address => {
    parentBalance = parentBalance.add(dynamicPoolData[address].userBalanceUSD || BigNumber.from('0'));
  });

  return parentBalance;
};

const getParentBalanceInBackingToken = (
  parentId: Ticker,
  staticPoolData: StaticPoolDataMap,
  dynamicPoolData: DynamicPoolStateData,
  negativeYieldPoolData: NegativeYieldStateData,
): BigNumber | null => {
  const parentChildrenAddresses: string[] = [];
  for (const key in dynamicPoolData) {
    if (
      staticPoolData[key].backingToken === parentId &&
      (!negativeYieldPoolData[key] || dynamicPoolData[key].userBalanceUSD?.gt(ZERO))
    ) {
      parentChildrenAddresses.push(key);
    }
  }

  // In case balance is still loading for some of the parent children, return null (show loading circle in dashboard)
  const childrenStillLoading = getChildrenStillLoadingInBackingToken(parentChildrenAddresses, dynamicPoolData);
  if (childrenStillLoading) {
    return null;
  }

  let parentBalance = BigNumber.from('0');
  parentChildrenAddresses.forEach(address => {
    parentBalance = parentBalance.add(dynamicPoolData[address].userBalanceInBackingToken || BigNumber.from('0'));
  });

  return parentBalance;
};

const getChildrenStillLoadingInFiat = (childrenAddresses: string[], dynamicPoolData: DynamicPoolStateData): boolean =>
  childrenAddresses.some(address => dynamicPoolData[address].userBalanceUSD === null);
const getChildrenStillLoadingInBackingToken = (
  childrenAddresses: string[],
  dynamicPoolData: DynamicPoolStateData,
): boolean => childrenAddresses.some(address => dynamicPoolData[address].userBackingTokenBalance === null);

const getChildBalanceInFiat = (childId: string, dynamicPoolData: DynamicPoolStateData): BigNumber | null =>
  dynamicPoolData[childId].userBalanceUSD;

const getChildBalanceInBackingToken = (childId: string, dynamicPoolData: DynamicPoolStateData): BigNumber | null =>
  dynamicPoolData[childId].userBalanceInBackingToken;
