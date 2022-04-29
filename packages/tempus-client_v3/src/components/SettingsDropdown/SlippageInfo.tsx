import { FC } from 'react';
import { Typography } from '../shared';

const SlippageInfo: FC = () => (
  <Typography className="tc__settings-popup-info" variant="body-primary">
    Your transaction will revert if the price changes unfavorably by more than this percentage.
  </Typography>
);

export default SlippageInfo;
