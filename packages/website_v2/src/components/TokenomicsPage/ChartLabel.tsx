import { FC, memo } from 'react';

interface ChartLabelProps {
  x: number;
  y: number;
  width: number;
  label: string;
  value: string;
  orientation: 'left' | 'right';
}

const ChartLabel: FC<ChartLabelProps> = props => {
  const { x, y, width, label, value, orientation } = props;

  return (
    <div
      className="tw__tokenomics__chart-label-line"
      style={{
        left: orientation === 'left' ? `${x}px` : undefined,
        right: orientation === 'right' ? `${x}px` : undefined,
        top: `${y}px`,
        width: `${width}px`,
      }}
    >
      <div
        className="tw__tokenomics__chart-label-label"
        style={orientation === 'left' ? { left: '0px' } : { right: '0px' }}
      >
        {label}
      </div>

      <div
        className="tw__tokenomics__chart-label-percentage"
        style={orientation === 'left' ? { left: '0px' } : { right: '0px' }}
      >
        {value}
      </div>
    </div>
  );
};

export default memo(ChartLabel);
