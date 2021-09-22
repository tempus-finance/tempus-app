import { FC } from 'react';

import './legendDot.scss';

interface LegendDotProps {
  startColor: string;
  endColor: string;
}

const LegendDotGradient: FC<LegendDotProps> = props => {
  const { startColor, endColor } = props;

  return (
    <div
      className="tf__legend__dot-container"
      style={{
        background: `linear-gradient(220.1deg, ${startColor} 14.4%, ${endColor} 87.86%)`,
      }}
    />
  );
};
export default LegendDotGradient;
