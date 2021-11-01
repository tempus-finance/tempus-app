import { Divider } from '@material-ui/core';
import Spacer from '../spacer/spacer';
import Typography from '../typography/Typography';

import './PoolCard.scss';

const PoolCard = () => {
  return (
    <div className="tc__poolCard-container">
      <Typography variant="h2">Pool</Typography>
      <Spacer size={10} />
      <div className="tc__poolCard-row">
        <div className="tc__poolCard-row-title">
          <Typography variant="body-text" color="title">
            Market implied yield
          </Typography>
        </div>
        <Typography variant="body-text">5.52%</Typography>
      </div>
      <Divider />

      <Spacer size={10} />
      <div className="tc__poolCard-row">
        <div className="tc__poolCard-row-title">
          <Typography variant="body-text" color="title">
            TVL
          </Typography>
        </div>
        <div className="tc__poolCard-percentage">
          <Typography variant="body-text">15.98%</Typography>
        </div>
        <Typography variant="body-text">$1.05b</Typography>
      </div>
      <Divider />

      <Spacer size={10} />
      <div className="tc__poolCard-row">
        <div className="tc__poolCard-row-title">
          <Typography variant="body-text" color="title">
            Volume (7d)
          </Typography>
        </div>
        <div className="tc__poolCard-percentage">
          <Typography variant="body-text" color="error">
            -15.98%
          </Typography>
        </div>
        <Typography variant="body-text">$0.94b</Typography>
      </div>
      <Divider />

      <Spacer size={10} />
      <div className="tc__poolCard-row">
        <div className="tc__poolCard-row-title">
          <Typography variant="body-text" color="title">
            Fees
          </Typography>
        </div>
      </div>
    </div>
  );
};
export default PoolCard;
