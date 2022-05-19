import { FC } from 'react';
import Typography from '../Typography';

import './PoolsHeading.scss';

interface PoolsHeadingProps {
  text: string;
}

const PoolsHeading: FC<PoolsHeadingProps> = (props): JSX.Element => {
  const { text } = props;

  return (
    <div className="tc__poolsHeading">
      <div className="tc__poolsHeading-content">
        <Typography variant="title" weight="bold">
          {text}
        </Typography>
      </div>
      <div className="tc__poolsHeading-overlay" />
    </div>
  );
};
export default PoolsHeading;
