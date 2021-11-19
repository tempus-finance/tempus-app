import { DataTypeProvider } from '@devexpress/dx-react-grid';
import { ethers, BigNumber } from 'ethers';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { DashboardRow, isChildRow, isParentRow } from '../../../interfaces/DashboardRow';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
import Spacer from '../../spacer/spacer';
import Typography from '../../typography/Typography';
import TokenIcon from '../../tokenIcon';
import './availableToDepositFormatter.scss';
import { PoolDataContext, PoolData, getDataForPool } from '../../../context/poolDataContext';
import { UserSettingsContext } from '../../../context/userSettingsContext';
import { WalletContext } from '../../../context/walletContext';
import { useContext, useMemo } from 'react';
import { CircularProgress } from '@material-ui/core';
import { ZERO } from '../../../constants';
import {
  dynamicPoolDataState,
  DynamicPoolStateData,
  negativeYieldPoolDataState,
  NegativeYieldStateData,
} from '../../../state/PoolDataState';

const AvailableToDepositFormatter = (props: DataTypeProvider.ValueFormatterProps) => {
  const row = props.row as DashboardRow;

  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const negativeYieldPoolData = useHookState(negativeYieldPoolDataState).attach(Downgraded).get();

  const { poolData } = useContext(PoolDataContext);
  const { userWalletConnected } = useContext(WalletContext);
  const { showFiat } = useContext(UserSettingsContext);

  const parentAvailableToDeposit = useMemo(() => {
    if (showFiat) {
      return getParentAvailableToDepositInFiat(row.token, poolData, dynamicPoolData, negativeYieldPoolData);
    }

    return getParentAvailableToDepositInBackingToken(row.token, poolData, dynamicPoolData, negativeYieldPoolData);
  }, [dynamicPoolData, negativeYieldPoolData, poolData, row.token, showFiat]);

  const parentAvailableToDepositFormatted = useMemo(() => {
    if (!parentAvailableToDeposit) {
      return null;
    }

    let content;

    if (showFiat) {
      const currencySymbol = '$';
      content = `${currencySymbol}${NumberUtils.formatWithMultiplier(
        ethers.utils.formatEther(parentAvailableToDeposit),
        2,
      )}`;
    } else {
      content = (
        <>
          {NumberUtils.formatWithMultiplier(ethers.utils.formatEther(parentAvailableToDeposit), 2)}
          <Spacer size={5} />
          <TokenIcon ticker={poolData[0].backingToken} />
        </>
      );
    }

    return <div className="tc__dashboard__grid__avail-to-deposit__container">{content}</div>;
  }, [poolData, parentAvailableToDeposit, showFiat]);

  const childAvailableToDeposit = useMemo(() => {
    if (isChildRow(row)) {
      if (showFiat) {
        return getChildAvailableToDepositInFiat(row.id, poolData);
      }

      return getChildAvailableToDepositInBackingToken(row.id, poolData);
    }
    return null;
  }, [poolData, row, showFiat]);

  const childAvailableToDepositFormatted = useMemo(() => {
    if (!childAvailableToDeposit) {
      return null;
    }

    let content;

    if (showFiat) {
      const currencySymbol = '$';
      content = `${currencySymbol}${NumberUtils.formatWithMultiplier(
        ethers.utils.formatEther(childAvailableToDeposit),
        2,
      )}`;
    } else {
      content = (
        <>
          {NumberUtils.formatWithMultiplier(ethers.utils.formatEther(childAvailableToDeposit), 2)}
          <Spacer size={5} />
          <TokenIcon ticker={poolData[0].backingToken} />
        </>
      );
    }

    return <div className="tc__dashboard__grid__avail-to-deposit__container">{content}</div>;
  }, [poolData, childAvailableToDeposit, showFiat]);

  if (!userWalletConnected) {
    return <div></div>;
  }

  if (isParentRow(row)) {
    if (!parentAvailableToDeposit) {
      return <CircularProgress size={16} />;
    }

    return (
      <Typography color="default" variant="body-text">
        {parentAvailableToDepositFormatted}
      </Typography>
    );
  }

  if (isChildRow(row)) {
    if (!childAvailableToDeposit) {
      return <CircularProgress size={16} />;
    }

    return (
      <Typography color="default" variant="body-text">
        {childAvailableToDepositFormatted}
      </Typography>
    );
  }
};

const getParentAvailableToDepositInFiat = (
  parentId: Ticker,
  poolData: PoolData[],
  dynamicPoolData: DynamicPoolStateData,
  negativeYieldPoolData: NegativeYieldStateData,
) => {
  const parentChildren = poolData
    .filter(pool => pool.backingToken === parentId)
    .filter(child => {
      if (!negativeYieldPoolData[child.address]) {
        return true;
      }

      return dynamicPoolData[child.address].userBalanceUSD?.gt(ZERO);
    });

  // In case balance is still loading for some of the parent children, return null (show loading circle in dashboard)
  const childrenStillLoading = getChildrenStillLoadingInFiat(parentChildren);
  if (childrenStillLoading) {
    return null;
  }

  const processedTokens: { [ticker in Ticker]?: boolean } = {};

  let parentAvailableToDeposit = BigNumber.from('0');

  parentChildren.forEach((child: PoolData) => {
    const { backingToken, backingTokenValueInFiat, yieldBearingToken, yieldBearingTokenValueInFiat } = child;

    if (processedTokens[backingToken] === undefined) {
      processedTokens[backingToken] = true;
      parentAvailableToDeposit = parentAvailableToDeposit.add(backingTokenValueInFiat || ZERO);
    }

    if (processedTokens[yieldBearingToken] === undefined) {
      processedTokens[yieldBearingToken] = true;
      parentAvailableToDeposit = parentAvailableToDeposit.add(yieldBearingTokenValueInFiat || ZERO);
    }
  });

  return parentAvailableToDeposit;
};

const getParentAvailableToDepositInBackingToken = (
  parentId: Ticker,
  poolData: PoolData[],
  dynamicPoolData: DynamicPoolStateData,
  negativeYieldPoolData: NegativeYieldStateData,
) => {
  const parentChildren = poolData
    .filter(pool => pool.backingToken === parentId)
    .filter(child => {
      if (!negativeYieldPoolData[child.address]) {
        return true;
      }

      return dynamicPoolData[child.address].userBalanceUSD?.gt(ZERO);
    });

  // In case balance is still loading for some of the parent children, return null (show loading circle in dashboard)
  const childrenStillLoading = getChildrenStillLoadingInBackingToken(parentChildren);
  if (childrenStillLoading) {
    return null;
  }

  const processedTokens: { [ticker in Ticker]?: boolean } = {};

  let parentAvailableToDeposit = BigNumber.from('0');

  parentChildren.forEach((child: PoolData) => {
    const { backingToken, backingTokensAvailable, yieldBearingToken, yieldBearingTokenValueInBackingToken } = child;

    if (processedTokens[backingToken] === undefined) {
      processedTokens[backingToken] = true;
      parentAvailableToDeposit = parentAvailableToDeposit.add(backingTokensAvailable || ZERO);
    }

    if (processedTokens[yieldBearingToken] === undefined) {
      processedTokens[yieldBearingToken] = true;
      parentAvailableToDeposit = parentAvailableToDeposit.add(yieldBearingTokenValueInBackingToken || ZERO);
    }
  });

  return parentAvailableToDeposit;
};

const getChildrenStillLoadingInFiat = (children: PoolData[]): boolean =>
  children.some(child => child.backingTokenValueInFiat === null || child.yieldBearingTokenValueInFiat === null);

const getChildrenStillLoadingInBackingToken = (children: PoolData[]): boolean =>
  children.some(child => child.userBalanceInBackingToken === null);

const getChildAvailableToDepositInFiat = (id: string, poolData: PoolData[]) => {
  const child = getDataForPool(id, poolData);

  return (child.backingTokenValueInFiat || ZERO).add(child.yieldBearingTokenValueInFiat || ZERO);
};

const getChildAvailableToDepositInBackingToken = (id: string, poolData: PoolData[]) => {
  const child = getDataForPool(id, poolData);

  return (child.backingTokensAvailable || ZERO).add(child.yieldBearingTokenValueInBackingToken || ZERO);
};

export default AvailableToDepositFormatter;
