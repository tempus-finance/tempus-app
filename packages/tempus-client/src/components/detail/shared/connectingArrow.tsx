import { FC } from 'react';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

import './connectingArrow.scss';

const ConnectingArrow: FC = () => {
  return (
    <div className="tf__dialog__tab__connecting-arrow">
      <div className="arrow-container">
        <ArrowDownwardIcon />
      </div>
    </div>
  );
};

export default ConnectingArrow;
