import { useContext, useMemo } from 'react';
import format from 'date-fns/format';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import { dashboardChildMaturityFormat, dashboardParentMaturityFormat, ZERO } from '../../../constants';
import Typography from '../../typography/Typography';
import ProgressBar from '../../progressBar';

import './maturityFormatter.scss';
import { Ticker } from '../../../interfaces/Token';
import { getDataForPool, PoolData, PoolDataContext } from '../../../context/poolDataContext';
import getRangeFrom from '../../../utils/getRangeFrom';
import { CircularProgress } from '@material-ui/core';

const MaturityFormatter = ({ value, row }: any) => {
  const { poolData } = useContext(PoolDataContext);

  const isParent = !row.parentId;

  const progressBarValue = useMemo(() => {
    if (!row.startDate) {
      return null;
    }

    const maturity = getChildMaturity(row.id, poolData);

    const startToMaturity = differenceInSeconds(maturity, row.startDate);
    const nowToMaturity = differenceInSeconds(maturity, new Date());

    return 1 - nowToMaturity / startToMaturity;
  }, [poolData, row.id, row.startDate]);

  if (isParent) {
    const [min, max] = getParentMaturity(row.id, poolData);
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
            {format(getChildMaturity(row.id, poolData), dashboardChildMaturityFormat)}
          </Typography>
        </div>
        <ProgressBar value={progressBarValue} />
      </div>
    );
  }
};

export default MaturityFormatter;

function getParentMaturity(parentId: Ticker, poolData: PoolData[]): number[] {
  const parentChildren = poolData.filter(data => {
    return data.backingToken === parentId;
  });

  const validChildren = parentChildren.filter(child => {
    return !child.isNegativeYield || (child.isNegativeYield && child.userBalanceUSD?.gt(ZERO));
  });

  const childrenMaturityDates = validChildren.map(child => child.maturityDate);

  if (childrenMaturityDates.length === 1) {
    return childrenMaturityDates;
  }

  return getRangeFrom<number>(childrenMaturityDates);
}

function getChildMaturity(childId: string, poolData: PoolData[]): number {
  return getDataForPool(childId, poolData).maturityDate;
}
