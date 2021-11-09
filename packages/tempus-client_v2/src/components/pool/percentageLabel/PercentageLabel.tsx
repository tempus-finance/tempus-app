import { FC } from 'react';
import NumberUtils from '../../../services/NumberUtils';
import GreenArrowUp from '../../icons/GreenArrowUp';
import RedArrowDown from '../../icons/RedArrowDown';
import Spacer from '../../spacer/spacer';
import Typography from '../../typography/Typography';

import './PercentageLabel.scss';

interface PercentageLabelProps {
  percentage: number;
}

const PercentageLabel: FC<PercentageLabelProps> = props => {
  const { percentage } = props;

  return (
    <div className="tc__percentage-label__container">
      {percentage >= 0 && <GreenArrowUp />}
      {percentage < 0 && <RedArrowDown />}
      <Spacer size={4} />
      <Typography variant="card-body-text" color={percentage < 0 ? 'error' : 'success'}>
        {NumberUtils.formatPercentage(percentage, 2)}
      </Typography>
    </div>
  );
};
export default PercentageLabel;
