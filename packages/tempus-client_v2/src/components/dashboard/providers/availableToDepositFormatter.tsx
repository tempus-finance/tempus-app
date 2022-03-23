import { useContext } from 'react';
import { ethers, BigNumber } from 'ethers';
import { CONSTANTS, NumberUtils } from 'tempus-core-services';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { DataTypeProvider } from '@devexpress/dx-react-grid';
import { CircularProgress } from '@material-ui/core';
import {
  dynamicPoolDataState,
  DynamicPoolStateData,
  staticPoolDataState,
  StaticPoolDataMap,
} from '../../../state/PoolDataState';
import { UserSettingsContext } from '../../../context/userSettingsContext';
import { WalletContext } from '../../../context/walletContext';
import { DashboardRow, isChildRow, isParentRow } from '../../../interfaces/DashboardRow';
import { Ticker } from '../../../interfaces/Token';
import { Chain, chainIdToChainName } from '../../../interfaces/Chain';
import { getChainConfigForPool } from '../../../utils/getConfig';
import Spacer from '../../spacer/spacer';
import Typography from '../../typography/Typography';

import './availableToDepositFormatter.scss';

const { tokenPrecision, ZERO } = CONSTANTS;

const AvailableToDepositFormatter = (props: DataTypeProvider.ValueFormatterProps) => {
  const row = props.row as DashboardRow;

  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const staticPoolData = useHookState(staticPoolDataState).attach(Downgraded).get();

  const { userWalletConnected } = useContext(WalletContext);
  const { showFiat } = useContext(UserSettingsContext);

  const getParentAvailableToDeposit = () => {
    if (showFiat) {
      return getParentAvailableToDepositInFiat(row.id, row.chain, staticPoolData, dynamicPoolData);
    }

    return getParentAvailableToDepositInBackingToken(row.id, row.chain, staticPoolData, dynamicPoolData);
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
        // TODO - Use backing token precision from child items
        ethers.utils.formatUnits(parentAvailableToDeposit, tokenPrecision[row.token]),
        2,
      )}`;
    } else {
      // assuming same token on different chain share the same decimal display on UI
      const poolData = Object.keys(staticPoolData).filter(key => staticPoolData[key].backingToken === row.token);
      const decimalsForUI = poolData.length ? staticPoolData[poolData[0]].decimalsForUI : 4;
      content = (
        <>
          {/* TODO - Use decimalsForUI precision from child items (max precision) */}
          {/* TODO - Use backing token precision from child items */}
          {NumberUtils.formatWithMultiplier(
            ethers.utils.formatUnits(parentAvailableToDeposit, tokenPrecision[row.token]),
            decimalsForUI,
          )}
          <Spacer size={5} />
          {row.token}
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
        ethers.utils.formatUnits(childAvailableToDeposit, staticPoolData[row.id].tokenPrecision.backingToken),
        2,
      )}`;
    } else {
      content = (
        <>
          {NumberUtils.formatWithMultiplier(
            ethers.utils.formatUnits(childAvailableToDeposit, staticPoolData[row.id].tokenPrecision.backingToken),
            staticPoolData[row.id].decimalsForUI,
          )}
          <Spacer size={5} />
          {row.token}
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
  parentId: string,
  chain: Chain,
  staticPoolData: StaticPoolDataMap,
  dynamicPoolData: DynamicPoolStateData,
) => {
  const parentChildrenAddresses: string[] = [];
  for (const key in dynamicPoolData) {
    const chainConfig = getChainConfigForPool(key);

    if (
      `${staticPoolData[key].backingToken}-${chainIdToChainName(chainConfig.chainId)}` === parentId &&
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
  parentId: string,
  chain: Chain,
  staticPoolData: StaticPoolDataMap,
  dynamicPoolData: DynamicPoolStateData,
) => {
  const parentChildrenAddresses: string[] = [];
  for (const key in dynamicPoolData) {
    const chainConfig = getChainConfigForPool(key);

    if (
      `${staticPoolData[key].backingToken}-${chainIdToChainName(chainConfig.chainId)}` === parentId &&
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
