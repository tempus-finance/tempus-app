import { useMemo } from 'react';
import format from 'date-fns/format';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import { dashboardChildMaturityFormat, dashboardParentMaturityFormat } from '../../../constants';
import Typography from '../../typography/Typography';
import ProgressBar from '../../progressBar';

import './maturityFormatter.scss';

const MaturityFormatter = ({ value, row }: any) => {
  const isParent = !row.parentId;

  const progressBarValue = useMemo(() => {
    const startToMaturity = differenceInSeconds(value[0], row.startDate);
    const nowToMaturity = differenceInSeconds(value[0], new Date());

    return 1 - nowToMaturity / startToMaturity;
  }, [row.startDate, value]);

  if (isParent) {
    const [min, max] = value;
    return (
      <div className="tf__dashboard__grid__maturity">
        <Typography color="default" variant="body-text">
          {format(min, dashboardParentMaturityFormat)}
          {max && ` - ${format(max, dashboardParentMaturityFormat)}`}
        </Typography>
      </div>
    );
  }

  return (
    <div className="tf__dashboard__grid__maturity">
      <div className="tf__dashboard__grid__maturity-timeLeft">
        <div>{format(value[0], dashboardChildMaturityFormat)}</div>
      </div>
      <ProgressBar value={progressBarValue} />
    </div>
  );
};

export default MaturityFormatter;
