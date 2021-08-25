import { FC } from 'react';
import { Chart, PieSeries } from '@devexpress/dx-react-chart-material-ui';

import './poolChart.scss';

const Slice = (props: PieSeries.PointProps) => {
  console.log('Slice props', props);

  const className = `tf__pool-chart__slice-${props.argument}`;

  const BLOW_OUT_DISTANCE = 10;
  const sin = Math.sin((props.endAngle - props.startAngle) / 2 + props.startAngle + Math.PI / 2);
  const cos = Math.cos((props.endAngle - props.startAngle) / 2 + props.startAngle + Math.PI / 2);
  const sx = BLOW_OUT_DISTANCE * cos * -1;
  const sy = BLOW_OUT_DISTANCE * sin * -1;

  return (
    <PieSeries.Point
      {...props}
      className={className}
      style={{
        transform:
          props.argument === 'staked-principals' || props.argument === 'staked-yields'
            ? `translate(${sx}px, ${sy}px)`
            : 'none',
      }}
    />
  );
};

type PoolChartProps = {
  data?: any;
};

const ProgressBar: FC<PoolChartProps> = ({ data = [] }) => {
  return (
    <div className="tf__pool-chart">
      <Chart data={data}>
        <PieSeries valueField="amount" argumentField="token" pointComponent={Slice} />
      </Chart>
      <div className="tf__pool-chart__legend">
        <div className="tf__pool-chart__slice-principals">
          <div className="tf__pool-chart__legend-color"></div>
          <div className="tf__pool-chart__legend-text">Principals</div>
          <div className="tf__pool-chart__legend-value">{data.find((v: any) => v.token === 'principals').amount}</div>
        </div>
        <div className="tf__pool-chart__slice-staked-principals">
          <div className="tf__pool-chart__legend-color"></div>
          <div className="tf__pool-chart__legend-text">St Principals</div>
          <div className="tf__pool-chart__legend-value">
            {data.find((v: any) => v.token === 'staked-principals').amount}
          </div>
        </div>

        <div className="tf__pool-chart__slice-yields">
          <div className="tf__pool-chart__legend-color"></div>
          <div className="tf__pool-chart__legend-text">Yields</div>
          <div className="tf__pool-chart__legend-value">{data.find((v: any) => v.token === 'yields').amount}</div>
        </div>
        <div className="tf__pool-chart__slice-staked-yields">
          <div className="tf__pool-chart__legend-color"></div>
          <div className="tf__pool-chart__legend-text">St Yields</div>
          <div className="tf__pool-chart__legend-value">
            {data.find((v: any) => v.token === 'staked-yields').amount}
          </div>
        </div>
      </div>
      <svg className="mysvg">
        <defs>
          <pattern
            id="diagonalHatch"
            width="10"
            height="10"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="10" style={{ stroke: 'black', strokeWidth: 1 }} />
          </pattern>
          <mask id="diagonalMask" x="0" y="0" width="1" height="1">
            <rect x="0" y="0" width="100" height="100" fill="#999" />
          </mask>
        </defs>
      </svg>
    </div>
  );
};

export default ProgressBar;
