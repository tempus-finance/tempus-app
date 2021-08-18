import { useState, useCallback } from 'react';
import format from 'date-fns/format';
import { Divider, CircularProgress } from '@material-ui/core';
import TLVChart from '../tvl-chart/TVLChart';
import VolumeChart from '../volume-chart/volume-chart';
import InfoTooltip from '../../infoTooltip/infoTooltip';
import getPastDaysNumber from '../../../utils/getPastDaysNumber';
import ChartDataPoint from '../../../interfaces/ChartDataPoint';

import './chart.scss';

export type ChartKind = 'TLV' | 'VOLUME';

interface ChartProps {
  kind: ChartKind;
  title: string;
  tooltip?: string;
}

function Chart(props: ChartProps): JSX.Element {
  const { title, kind, tooltip } = props;

  const [activeDataPoint, setActiveDataPoint] = useState<ChartDataPoint | null>(null);

  const onSetActiveDataPoint = useCallback(
    (dataPoint: ChartDataPoint) => {
      setActiveDataPoint(dataPoint);
    },
    [setActiveDataPoint],
  );

  return (
    <div className="tf__chart">
      {!activeDataPoint && (
        <div className="tf__chart-loading-overlay">
          <CircularProgress size={48} />
        </div>
      )}
      <div className="tf__chart-header">
        <p>{title}</p>
        <div className="tf__chart-header-info">
          <p>{activeDataPoint && format(activeDataPoint.date, 'MMMM d, yyyy')}</p>
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
          {kind === 'VOLUME' && <VolumeChart onSetActiveDataPoint={onSetActiveDataPoint} />}
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
