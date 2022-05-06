import { FC } from 'react';
import { Typography } from '../shared';
import './DepositModal.scss';

const DepositModalHeader: FC = () => (
  <span className="tc__deposit-modal__header">
    <Typography variant="body-secondary" weight="bold" color="text-success">
      Rewards available
    </Typography>
  </span>
);

export default DepositModalHeader;
