import { ReactElement, ReactNode } from 'react';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import Tooltip from '../Tooltip';

interface ChartTooltipProps<X extends NameType, Y extends ValueType> {
  tooltipContent: (x: X, y: Y) => ReactNode;
}

function ChartTooltip<X extends NameType, Y extends ValueType>(
  props: ChartTooltipProps<X, Y> & TooltipProps<Y, X>,
): ReactElement<ChartTooltipProps<X, Y> & TooltipProps<Y, X>> {
  const { tooltipContent, coordinate, viewBox, payload } = props;
  return (
    <div className="tc__chart__tooltip-chart">
      <Tooltip
        open
        placement={
          coordinate && coordinate.x && viewBox && viewBox.width && coordinate.x / viewBox.width > 0.5
            ? 'left'
            : 'right'
        }
      >
        {payload && payload[0] !== undefined && tooltipContent(payload[0].payload.x, payload[0].payload.y)}
      </Tooltip>
    </div>
  );
}

export default ChartTooltip;
