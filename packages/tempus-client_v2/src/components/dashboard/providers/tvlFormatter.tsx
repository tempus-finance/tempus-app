import { ethers, BigNumber } from 'ethers';
import { CircularProgress } from '@material-ui/core';
import { DataTypeProvider } from '@devexpress/dx-react-grid';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { ZERO } from '../../../constants';
import { Ticker } from '../../../interfaces/Token';
import { DashboardRow } from '../../../interfaces/DashboardRow';
import NumberUtils from '../../../services/NumberUtils';
import {
  dynamicPoolDataState,
  DynamicPoolStateData,
  staticPoolDataState,
  StaticPoolDataMap,
} from '../../../state/PoolDataState';
import Typography from '../../typography/Typography';

const TVLFormatter = (props: DataTypeProvider.ValueFormatterProps) => {
  const row = props.row as DashboardRow;

  const isChild = Boolean(row.parentId);

  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const staticPoolData = useHookState(staticPoolDataState).attach(Downgraded).get();

  const getTvlFormatted = () => {
    let tvl: BigNumber | null;
    let tokenPrecision;

    if (!isChild) {
      tvl = getParentTVL(row.token, staticPoolData, dynamicPoolData);
      const firstChildAddress = getParentChildrenAddresses(row.token, staticPoolData, dynamicPoolData)[0];
      tokenPrecision = firstChildAddress && staticPoolData[firstChildAddress].tokenPrecision.backingToken;
    } else {
      tvl = getChildTVL(row.id, dynamicPoolData);
      tokenPrecision = staticPoolData[row.id].tokenPrecision.backingToken;
    }

    if (!tvl) {
      return null;
    }

    return NumberUtils.formatWithMultiplier(ethers.utils.formatUnits(tvl, tokenPrecision), 2);
  };
  const tvlFormatted = getTvlFormatted();

  return (
    <>
      {tvlFormatted && (
        <Typography color="default" variant="body-text">
          ${tvlFormatted}
        </Typography>
      )}
      {!tvlFormatted && <CircularProgress size={16} />}
    </>
  );
};
export default TVLFormatter;

function getParentTVL(
  parentId: Ticker,
  staticPoolData: StaticPoolDataMap,
  dynamicPoolData: DynamicPoolStateData,
): BigNumber | null {
  const parentChildrenAddresses: string[] = getParentChildrenAddresses(parentId, staticPoolData, dynamicPoolData);

  // In case TVL is still loading for some of the parent children, return null (show loading circle in dashboard)
  const childrenStillLoading =
    parentChildrenAddresses.length === 0 ||
    parentChildrenAddresses.some(address => dynamicPoolData[address].tvl === null);
  if (childrenStillLoading) {
    return null;
  }

  let parentTVL = BigNumber.from('0');
  parentChildrenAddresses.forEach(address => {
    parentTVL = parentTVL.add(dynamicPoolData[address].tvl || BigNumber.from('0'));
  });

  return parentTVL;
}

function getChildTVL(childId: string, dynamicPoolData: DynamicPoolStateData): BigNumber | null {
  return dynamicPoolData[childId].tvl;
}

const getParentChildrenAddresses = (
  parentId: Ticker,
  staticPoolData: StaticPoolDataMap,
  dynamicPoolData: DynamicPoolStateData,
): string[] => {
  const parentChildrenAddresses: string[] = [];
  for (const key in dynamicPoolData) {
    if (
      staticPoolData[key].backingToken === parentId &&
      (!dynamicPoolData[key].negativeYield || dynamicPoolData[key].userBalanceUSD?.gt(ZERO))
    ) {
      parentChildrenAddresses.push(key);
    }
  }
  return parentChildrenAddresses;
};
