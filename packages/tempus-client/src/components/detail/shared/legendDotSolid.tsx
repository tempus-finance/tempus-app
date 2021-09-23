import { FC } from 'react';

import './legendDot.scss';

interface LegendDotProps {
  color: string;
}

const LegendDotSolid: FC<LegendDotProps> = props => {
  const { color } = props;

  return (
    <div
      className="tf__legend__dot-container"
      style={{
        backgroundColor: color,
      }}
    />
  );
};
export default LegendDotSolid;
