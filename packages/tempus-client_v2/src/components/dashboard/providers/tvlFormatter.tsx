import { Downgraded, useState as useHookState } from '@hookstate/core';
import { CircularProgress } from '@material-ui/core';
import { ethers, BigNumber } from 'ethers';
import { useContext, useMemo } from 'react';
import { ZERO } from '../../../constants';
import { PoolData, PoolDataContext } from '../../../context/poolDataContext';
import { Ticker } from '../../../interfaces/Token';
import NumberUtils from '../../../services/NumberUtils';
import {
  dynamicPoolDataState,
  DynamicPoolStateData,
  negativeYieldPoolDataState,
  NegativeYieldStateData,
} from '../../../state/PoolDataState';
import Typography from '../../typography/Typography';

const TVLFormatter = ({ row }: any) => {
  const isChild = Boolean(row.parentId);

  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const negativeYieldPoolData = useHookState(negativeYieldPoolDataState).attach(Downgraded).get();

  const { poolData } = useContext(PoolDataContext);

  const tvlFormatted = useMemo(() => {
    let tvl: BigNumber | null;
    if (!isChild) {
      tvl = getParentTVL(row.id, poolData, dynamicPoolData, negativeYieldPoolData);
    } else {
      tvl = getChildTVL(row.id, dynamicPoolData);
    }

    if (!tvl) {
      return null;
    }
    return NumberUtils.formatWithMultiplier(ethers.utils.formatEther(tvl));
  }, [dynamicPoolData, negativeYieldPoolData, isChild, poolData, row.id]);

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
  poolData: PoolData[],
  dynamicPoolData: DynamicPoolStateData,
  negativeYieldPoolData: NegativeYieldStateData,
): BigNumber | null {
  const parentChildren = poolData.filter(data => {
    return data.backingToken === parentId;
  });

  // In case TVL is still loading for some of the parent children, return null (show loading circle in dashboard)
  const childrenStillLoading = parentChildren.some(child => dynamicPoolData[child.address].tvl === null);
  if (childrenStillLoading) {
    return null;
  }

  let parentTVL = BigNumber.from('0');
  parentChildren.forEach(child => {
    if (negativeYieldPoolData[child.address] && dynamicPoolData[child.address].userBalanceUSD?.lte(ZERO)) {
      return;
    }

    parentTVL = parentTVL.add(dynamicPoolData[child.address].tvl || BigNumber.from('0'));
  });

  return parentTVL;
}

function getChildTVL(childId: string, dynamicPoolData: DynamicPoolStateData): BigNumber | null {
  return dynamicPoolData[childId].tvl;
}
