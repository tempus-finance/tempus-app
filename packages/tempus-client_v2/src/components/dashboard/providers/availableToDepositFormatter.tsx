import { useContext } from 'react';
import { ethers, BigNumber } from 'ethers';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { DataTypeProvider } from '@devexpress/dx-react-grid';
import { CircularProgress } from '@material-ui/core';
import { ZERO } from '../../../constants';
import {
  dynamicPoolDataState,
  DynamicPoolStateData,
  negativeYieldPoolDataState,
  NegativeYieldStateData,
  staticPoolDataState,
  StaticPoolStateData,
} from '../../../state/PoolDataState';
import { UserSettingsContext } from '../../../context/userSettingsContext';
import { WalletContext } from '../../../context/walletContext';
import { DashboardRow, isChildRow, isParentRow } from '../../../interfaces/DashboardRow';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
import Spacer from '../../spacer/spacer';
import Typography from '../../typography/Typography';
import TokenIcon from '../../tokenIcon';

import './availableToDepositFormatter.scss';

const AvailableToDepositFormatter = (props: DataTypeProvider.ValueFormatterProps) => {
  const row = props.row as DashboardRow;

  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const staticPoolData = useHookState(staticPoolDataState).attach(Downgraded).get();
  const negativeYieldPoolData = useHookState(negativeYieldPoolDataState).attach(Downgraded).get();

  const { userWalletConnected } = useContext(WalletContext);
  const { showFiat } = useContext(UserSettingsContext);

  const getParentAvailableToDeposit = () => {
    if (showFiat) {
      return getParentAvailableToDepositInFiat(row.token, staticPoolData, dynamicPoolData, negativeYieldPoolData);
    }

    return getParentAvailableToDepositInBackingToken(row.token, staticPoolData, dynamicPoolData, negativeYieldPoolData);
  };
  const parentAvailableToDeposit = getParentAvailableToDeposit();

  const getParentAvailableToDepositFormatted = () => {
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
          <TokenIcon ticker={row.token} />
        </>
      );
    }

    return <div className="tc__dashboard__grid__avail-to-deposit__container">{content}</div>;
  };
  const parentAvailableToDepositFormatted = getParentAvailableToDepositFormatted();

  const getChildAvailableToDeposit = () => {
    if (isChildRow(row)) {
      if (showFiat) {
        return getChildAvailableToDepositInFiat(row.id, dynamicPoolData);
      }

      return getChildAvailableToDepositInBackingToken(row.id, dynamicPoolData);
    }
    return null;
  };
  const childAvailableToDeposit = getChildAvailableToDeposit();

  const getChildAvailableToDepositFormatted = () => {
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
          <TokenIcon ticker={row.token} />
        </>
      );
    }

    return <div className="tc__dashboard__grid__avail-to-deposit__container">{content}</div>;
  };
  const childAvailableToDepositFormatted = getChildAvailableToDepositFormatted();

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
  staticPoolData: StaticPoolStateData,
  dynamicPoolData: DynamicPoolStateData,
  negativeYieldPoolData: NegativeYieldStateData,
) => {
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

  const processedTokens: { [ticker in Ticker]?: boolean } = {};

  let parentAvailableToDeposit = BigNumber.from('0');

  parentChildrenAddresses.forEach((address: string) => {
    const { backingToken, yieldBearingToken } = staticPoolData[address];
    const { backingTokenValueInFiat, yieldBearingTokenValueInFiat } = dynamicPoolData[address];

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
  staticPoolData: StaticPoolStateData,
  dynamicPoolData: DynamicPoolStateData,
  negativeYieldPoolData: NegativeYieldStateData,
) => {
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

  const processedTokens: { [ticker in Ticker]?: boolean } = {};

  let parentAvailableToDeposit = BigNumber.from('0');

  parentChildrenAddresses.forEach((address: string) => {
    const { backingToken, yieldBearingToken } = staticPoolData[address];
    const { backingTokensAvailable, yieldBearingTokenValueInBackingToken } = dynamicPoolData[address];

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

const getChildrenStillLoadingInFiat = (childrenAddresses: string[], dynamicPoolData: DynamicPoolStateData): boolean =>
  childrenAddresses.some(
    address =>
      dynamicPoolData[address].backingTokenValueInFiat === null ||
      dynamicPoolData[address].yieldBearingTokenValueInFiat === null,
  );

const getChildrenStillLoadingInBackingToken = (
  childrenAddresses: string[],
  dynamicPoolData: DynamicPoolStateData,
): boolean => childrenAddresses.some(address => dynamicPoolData[address].userBalanceInBackingToken === null);

const getChildAvailableToDepositInFiat = (id: string, dynamicPoolData: DynamicPoolStateData) => {
  return (dynamicPoolData[id].backingTokenValueInFiat || ZERO).add(
    dynamicPoolData[id].yieldBearingTokenValueInFiat || ZERO,
  );
};

const getChildAvailableToDepositInBackingToken = (id: string, dynamicPoolData: DynamicPoolStateData) => {
  return (dynamicPoolData[id].backingTokensAvailable || ZERO).add(
    dynamicPoolData[id].yieldBearingTokenValueInBackingToken || ZERO,
  );
};

export default AvailableToDepositFormatter;
