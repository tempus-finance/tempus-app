import { formatDate } from '../../../utils/formatDate';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import Typography from '../../typography/Typography';
import ProgressBar from '../../progressBar';

import './maturityFormatter.scss';

// TODO the date format can be set in a constant and imported
const maturityFormat = 'dd MMM yy';

const MaturityFormatter = ({ value, row }: any) => {
  //TODO useState
  const isParent = !row.parentId;

  if (isParent) {
    const [min, max] = value;
    return (
      <div className="tf__dashboard__grid__maturity">
        <Typography color="default" variant="body-text">
          {formatDate(min, maturityFormat)}
          {max && ` - ${formatDate(max, maturityFormat)}`}
        </Typography>
      </div>
    );
  }

  //TODO useMemo
  const startToMaturity = differenceInSeconds(value[0], row.startDate);
  const nowToMaturity = differenceInSeconds(value[0], new Date());
  const progressBarValue = 1 - nowToMaturity / startToMaturity;

  return (
    <div className="tf__dashboard__grid__maturity">
      <div className="tf__dashboard__grid__maturity-timeLeft">
        <div>{formatDate(value[0], maturityFormat)}</div>
      </div>
      <ProgressBar value={progressBarValue} />
    </div>
  );
};

export default MaturityFormatter;
