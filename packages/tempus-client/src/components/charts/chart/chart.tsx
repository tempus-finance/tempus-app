import { useState } from 'react';
import { DateTime } from 'luxon';

import TLVChart from '../tvl-chart/TVLChart';
import VolumeChart from '../volume-chart/volume-chart';

import { Divider, CircularProgress } from '@material-ui/core';

import getPastDaysNumber from '../../../util/getPastDaysNumber';

import ChartDataPoint from '../../../interfaces/ChartDataPoint';

import './chart.scss';

export type ChartKind = 'TLV' | 'VOLUME';

interface ChartProps {
  kind: ChartKind;
  title: string;
  // Temporary solution to disable loading indicator on Volume24H chart
  // TODO - Fetch data from contract for Volume24H chart as well and remove `showLoadingIndicator` prop.
  showLoadingIndicator: boolean;
}

function Chart(props: ChartProps): JSX.Element {
  const { title, kind, showLoadingIndicator } = props;

  const [activeDataPoint, setActiveDataPoint] = useState<ChartDataPoint | null>(null);

  const onSetActiveDataPoint = (dataPoint: ChartDataPoint) => {
    setActiveDataPoint(dataPoint);
  };

  return (
    <div className="tf__chart">
      {showLoadingIndicator && !activeDataPoint && (
        <div className="tf__chart-loading-overlay">
          <CircularProgress size={48} />
        </div>
      )}
      <div className="tf__chart-header">
        <p>{title}</p>
        <p>{activeDataPoint && DateTime.fromJSDate(activeDataPoint.date).toFormat('DDD')}</p>
      </div>
      <Divider orientation="horizontal" />
      <div className="tf__chart-data-label">
        <p className="tf__chart-data-label-text">${activeDataPoint && activeDataPoint.value}</p>
        <p className="tf__chart-data-label-text-small">{activeDataPoint && `${activeDataPoint.valueIncrease}%`}</p>
      </div>
      <div className="tf__chart-row">
        <div className="tf__chart-graph-container">
          {kind === 'TLV' && <TLVChart onSetActiveDataPoint={onSetActiveDataPoint} />}
          {kind === 'VOLUME' && <VolumeChart />}
          <div className="tf__chart-data-axis-label-row">
            {getPastDaysNumber(30, 2).map((value: number) => (
              <p key={value} className="tf__chart-graph-axis-label-text">
                {value}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Chart;
