import { FC, memo } from 'react';
import './ProgressBar.scss';

export interface ProgressBarProps {
  value: number;
}

const ProgressBar: FC<ProgressBarProps> = props => {
  const { value } = props;

  return (
    <div className="tc__progress-bar">
      <div className="tc__progress-bar__progress" style={{ width: `${value}%` }} />
    </div>
  );
};

export default memo(ProgressBar);
