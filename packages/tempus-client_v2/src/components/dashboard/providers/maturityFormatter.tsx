import { useMemo } from 'react';
import { CircularProgress } from '@material-ui/core';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import format from 'date-fns/format';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import { dashboardChildMaturityFormat, dashboardParentMaturityFormat, ZERO } from '../../../constants';
import Typography from '../../typography/Typography';
import ProgressBar from '../../progressBar';
import { Chain, chainIdToChainName } from '../../../interfaces/Chain';
import getRangeFrom from '../../../utils/getRangeFrom';
import { getChainConfigForPool } from '../../../utils/getConfig';
import {
  dynamicPoolDataState,
  DynamicPoolStateData,
  staticPoolDataState,
  StaticPoolDataMap,
} from '../../../state/PoolDataState';

import './maturityFormatter.scss';

const MaturityFormatter = ({ value, row }: any) => {
  const dynamicPoolData = useHookState(dynamicPoolDataState).attach(Downgraded).get();
  const staticPoolData = useHookState(staticPoolDataState).attach(Downgraded).get();

  const isParent = !row.parentId;

  const progressBarValue = useMemo(() => {
    if (!row.startDate) {
      return null;
    }

    const maturity = getChildMaturity(row.id, staticPoolData);

    const startToMaturity = differenceInSeconds(maturity, row.startDate);
    const nowToMaturity = differenceInSeconds(maturity, new Date());

    return 1 - nowToMaturity / startToMaturity;
  }, [row.id, row.startDate, staticPoolData]);

  if (isParent) {
    const [min, max] = getParentMaturity(row.id, row.chain, staticPoolData, dynamicPoolData);
    return (
      <div className="tf__dashboard__grid__maturity">
        <Typography color="default" variant="body-text">
          {min && format(min, dashboardParentMaturityFormat)}
          {max && ` - ${format(max, dashboardParentMaturityFormat)}`}
          {!min && !max && <CircularProgress size={16} />}
        </Typography>
      </div>
    );
  }

  if (!isParent && progressBarValue) {
    return (
      <div className="tf__dashboard__grid__maturity">
        <div className="tf__dashboard__grid__maturity-timeLeft">
          <Typography color="default" variant="body-text">
            {format(getChildMaturity(row.id, staticPoolData), dashboardChildMaturityFormat)}
          </Typography>
        </div>
        <ProgressBar value={progressBarValue} />
      </div>
    );
  }
};

export default MaturityFormatter;

function getParentMaturity(
  parentId: string,
  chain: Chain,
  staticPoolData: StaticPoolDataMap,
  dynamicPoolData: DynamicPoolStateData,
): number[] {
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

  const childrenMaturityDates = parentChildrenAddresses.map(address => staticPoolData[address].maturityDate);

  if (childrenMaturityDates.length === 1) {
    return childrenMaturityDates;
  }

  return getRangeFrom<number>(childrenMaturityDates);
}

function getChildMaturity(childId: string, staticPoolData: StaticPoolDataMap): number {
  return staticPoolData[childId].maturityDate;
}
