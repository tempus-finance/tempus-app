import { FC, useMemo } from 'react';

import './progressBar.scss';

type ProgressBarProps = {
  value?: number;
};

const ProgressBar: FC<ProgressBarProps> = ({ value = 0 }) => {
  const width = useMemo(() => `${value * 100}%`, [value]);

  return (
    <div className="tf__progress-bar">
      <div className="tf__progress-bar__outer">
        <div className="tf__progress-bar__inner" style={{ width }} />
      </div>
    </div>
  );
};

export default ProgressBar;
