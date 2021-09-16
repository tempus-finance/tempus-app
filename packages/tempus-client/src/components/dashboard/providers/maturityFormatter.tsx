import { format } from 'date-fns';
import differenceInSeconds from 'date-fns/differenceInSeconds';
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
        <div>{format(min, maturityFormat)}</div>
        {max && (
          <div className="tf__dashboard__grid__maturity-responsive-wrapper">
            <div className="tf__dashboard__grid__maturity tf__dashboard__grid__maturity-range">&nbsp;-&nbsp;</div>
            <div>{format(max, maturityFormat)}</div>
          </div>
        )}
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
        <div>{format(value[0], maturityFormat)}</div>
      </div>
      <div className="tf__dashboard__grid__maturity-responsive-progress-bar-wrapper">
        <ProgressBar value={progressBarValue} />
      </div>
    </div>
  );
};

export default MaturityFormatter;
