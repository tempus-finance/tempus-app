import TLVChart from '../tlv-chart/tlv-chart';
import VolumeChart from '../volume-chart/volume-chart';

import { Divider } from '@material-ui/core';

import { generatedArrayOfIntegers } from '../../../util/data-generator';

import './chart.scss';

export type ChartKind = 'TLV' | 'VOLUME';

interface ChartProps {
  kind: ChartKind;
  title: string;
}

function Chart(props: ChartProps): JSX.Element {
  const { title, kind } = props;

  return (
    <div className="chart">
      <div className="chart-header">
        <p>{title}</p>
        <p>1 July 2021</p>
      </div>
      <Divider orientation="horizontal" />
      <div className="chart-data-label">
        <p className="chart-data-label-text">$127,123,135</p>
        <p className="chart-data-label-text-small">+52.23%</p>
      </div>
      <div className="chart-row">
        <div className="chart-graph-container">
          {kind === 'TLV' && <TLVChart />}
          {kind === 'VOLUME' && <VolumeChart />}
          <div className="chart-data-axis-label-row">
            {generatedArrayOfIntegers(15).map((value: number) => (
              <p key={value} className="chart-graph-axis-label-text">
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
