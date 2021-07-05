import TLVChart from "../tlv-chart/tlv-chart";
import VolumeChart from "../volume-chart/volume-chart";
import Divider from "../../divider/divider";

import { generatedArrayOfIntegers } from "../../../util/data-generator";

import './chart.scss';

export enum ChartType {
  TLV = 'TLV',
  VOLUME = 'VOLUME',
};

interface ChartProps {
  type: ChartType;
  title: string;
}

function Chart(props: ChartProps): JSX.Element {
  return (
    <div className='chart'>
      <div className='chart-header'>
        <p>
          {props.title}
        </p>
        <p>
          1 July 2021
        </p>
      </div>
      <Divider />
      <div className='chart-data-label'>
        <p className='chart-data-label-text'>
          $127,123,135
        </p>
        <p className='chart-data-label-text-small'>
          +52.23%
        </p>
      </div>
      <div className='chart-row'>
        <div className='chart-graph-container'>
          {props.type === ChartType.TLV && <TLVChart />}
          {props.type === ChartType.VOLUME && <VolumeChart />}
          <div className='chart-data-axis-label-row'>
            {generatedArrayOfIntegers(15).map((number) => {
              return (
                <p key={number} className='chart-graph-axis-label-text'>
                  {number}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Chart;
