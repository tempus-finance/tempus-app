import { ethers, BigNumber } from 'ethers';
import { useContext, useMemo } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { CircularProgress } from '@material-ui/core';
import { DataTypeProvider } from '@devexpress/dx-react-grid';
import { UserSettingsContext } from '../../../context/userSettingsContext';
import { WalletContext } from '../../../context/walletContext';
import { DashboardRow } from '../../../interfaces/DashboardRow';
import { Chain, chainIdToChainName } from '../../../interfaces/Chain';
import NumberUtils from '../../../services/NumberUtils';
import { getChainConfigForPool } from '../../../utils/getConfig';
import Typography from '../../typography/Typography';
import { tokenPrecision, ZERO } from '../../../constants';
import Spacer from '../../spacer/spacer';

import './balanceFormatter.scss';
import {
  dynamicPoolDataState,
  DynamicPoolStateData,
  staticPoolDataState,
  StaticPoolDataMap,
} from '../../../state/PoolDataState';

const BalanceFormatter = (props: DataTypeProvider.ValueFormatterProps) => {
  const row = props.row as DashboardRow;

  const isChild = Boolean(row.parentId);

  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const staticPoolData = useHookState(staticPoolDataState).attach(Downgraded).get();

  const { userWalletConnected } = useContext(WalletContext);
  const { showFiat } = useContext(UserSettingsContext);

  const getBalance = () => {
    if (!isChild) {
      if (showFiat) {
        return getParentBalanceInFiat(row.id, row.chain, staticPoolData, dynamicPoolData);
      } else {
        return getParentBalanceInBackingToken(row.id, row.chain, staticPoolData, dynamicPoolData);
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
      content = `${currencySymbol}${NumberUtils.formatWithMultiplier(
        // TODO - Use backing token precision from child items
        ethers.utils.formatUnits(balance, tokenPrecision[row.token]),
        2,
      )}`;
    } else {
      content = (
        <>
          {/* TODO - Use decimalsForUI precision from child items (max precision) */}
          {/* TODO - Use backing token precision from child items */}
          {NumberUtils.formatWithMultiplier(ethers.utils.formatUnits(balance, tokenPrecision[row.token]), 4)}
          <Spacer size={5} />
          {row.token}
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
  parentId: string,
  chain: Chain,
  staticPoolData: StaticPoolDataMap,
  dynamicPoolData: DynamicPoolStateData,
): BigNumber | null => {
  const parentChildrenAddresses: string[] = [];
  for (const key in dynamicPoolData) {
    const chainConfig = getChainConfigForPool(key);

    if (
      `${staticPoolData[key].backingToken}-${chainIdToChainName(chainConfig.chainId.toString())}` === parentId &&
      (!dynamicPoolData[key].negativeYield || dynamicPoolData[key].userBalanceUSD?.gt(ZERO))
    ) {
      parentChildrenAddresses.push(key);
    }
  }

  // In case balance is still loading for some of the parent children, return null (show loading circle in dashboard)
  const childrenStillLoading =
    parentChildrenAddresses.length === 0 || getChildrenStillLoadingInFiat(parentChildrenAddresses, dynamicPoolData);
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
  parentId: string,
  chain: Chain,
  staticPoolData: StaticPoolDataMap,
  dynamicPoolData: DynamicPoolStateData,
): BigNumber | null => {
  const parentChildrenAddresses: string[] = [];
  for (const key in dynamicPoolData) {
    const chainConfig = getChainConfigForPool(key);

    if (
      `${staticPoolData[key].backingToken}-${chainIdToChainName(chainConfig.chainId.toString())}` === parentId &&
      (!dynamicPoolData[key].negativeYield || dynamicPoolData[key].userBalanceUSD?.gt(ZERO))
    ) {
      parentChildrenAddresses.push(key);
    }
  }

  // In case balance is still loading for some of the parent children, return null (show loading circle in dashboard)
  const childrenStillLoading =
    parentChildrenAddresses.length === 0 ||
    getChildrenStillLoadingInBackingToken(parentChildrenAddresses, dynamicPoolData);
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
