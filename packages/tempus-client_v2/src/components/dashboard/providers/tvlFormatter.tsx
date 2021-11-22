import { Downgraded, useState as useHookState } from '@hookstate/core';
import { CircularProgress } from '@material-ui/core';
import { ethers, BigNumber } from 'ethers';
import { useMemo } from 'react';
import { ZERO } from '../../../constants';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
import {
  dynamicPoolDataState,
  DynamicPoolStateData,
  negativeYieldPoolDataState,
  NegativeYieldStateData,
  staticPoolDataState,
  StaticPoolStateData,
} from '../../../state/PoolDataState';
import Typography from '../../typography/Typography';

const TVLFormatter = ({ row }: any) => {
  const isChild = Boolean(row.parentId);

  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const staticPoolData = useHookState(staticPoolDataState).attach(Downgraded).get();
  const negativeYieldPoolData = useHookState(negativeYieldPoolDataState).attach(Downgraded).get();

  const tvlFormatted = useMemo(() => {
    let tvl: BigNumber | null;
    if (!isChild) {
      tvl = getParentTVL(row.id, staticPoolData, dynamicPoolData, negativeYieldPoolData);
    } else {
      tvl = getChildTVL(row.id, dynamicPoolData);
    }

    if (!tvl) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(tvl));
  }, [isChild, row.id, staticPoolData, dynamicPoolData, negativeYieldPoolData]);

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
  staticPoolData: StaticPoolStateData,
  dynamicPoolData: DynamicPoolStateData,
  negativeYieldPoolData: NegativeYieldStateData,
): BigNumber | null {
  const parentChildrenAddresses: string[] = [];
  for (const key in dynamicPoolData) {
    if (
      staticPoolData[key].backingToken === parentId &&
      (!negativeYieldPoolData[key] || dynamicPoolData[key].userBalanceUSD?.gt(ZERO))
    ) {
      parentChildrenAddresses.push(key);
    }
  }

  // In case TVL is still loading for some of the parent children, return null (show loading circle in dashboard)
  const childrenStillLoading = parentChildrenAddresses.some(address => dynamicPoolData[address].tvl === null);
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
