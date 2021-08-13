// External Libraries
import { useState } from 'react';
import { DateTime } from 'luxon';

// External UI Components
import { Divider, CircularProgress } from '@material-ui/core';

// UI Components
import TLVChart from '../tvl-chart/TVLChart';
import VolumeChart from '../volume-chart/volume-chart';
import InfoTooltip from '../../infoTooltip/infoTooltip';

// Utils
import getPastDaysNumber from '../../../utils/getPastDaysNumber';

// Interfaces
import ChartDataPoint from '../../../interfaces/ChartDataPoint';

// Style
import './chart.scss';

export type ChartKind = 'TLV' | 'VOLUME';

interface ChartProps {
  kind: ChartKind;
  title: string;
  // Temporary solution to disable loading indicator on Volume24H chart
  // TODO - Fetch data from contract for Volume24H chart as well and remove `showLoadingIndicator` prop.
  showLoadingIndicator: boolean;
  tooltip?: string;
}

function Chart(props: ChartProps): JSX.Element {
  const { title, kind, showLoadingIndicator, tooltip } = props;

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
        <div className="tf__chart-header-info">
          <p>{activeDataPoint && DateTime.fromJSDate(activeDataPoint.date).toFormat('DDD')}</p>
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
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
