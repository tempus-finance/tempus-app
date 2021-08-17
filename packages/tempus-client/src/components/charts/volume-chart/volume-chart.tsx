import { FC, useCallback, useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';
import getVolumeChartDataAdapter from '../../../adapters/getVolumeChartDataAdapter';
import ChartDataPoint from '../../../interfaces/ChartDataPoint';

interface VolumeChartProps {
  onSetActiveDataPoint: (activeDataPoint: ChartDataPoint) => void;
}

const VolumeChart: FC<VolumeChartProps> = (props: VolumeChartProps): JSX.Element => {
  const { onSetActiveDataPoint } = props;

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const onChartMouseMove = useCallback(
    (event: any) => {
      let activeDataPointIndex = chartData.length - 1;
      if (event.activeLabel) {
        activeDataPointIndex = event.activeLabel;
      }
      const activeDataPoint = chartData[activeDataPointIndex];

      onSetActiveDataPoint(activeDataPoint);
    },
    [chartData, onSetActiveDataPoint],
  );

  const onChartMouseLeave = useCallback(() => {
    onSetActiveDataPoint(chartData[chartData.length - 1]);
  }, [chartData, onSetActiveDataPoint]);

  useEffect(() => {
    const fetchChartData = async () => {
      const volumeChartDataAdapter = getVolumeChartDataAdapter();

      const data = await volumeChartDataAdapter.generateChartData();
      setChartData(data);
    };
    fetchChartData();
  }, []);

  useEffect(() => {
    onSetActiveDataPoint(chartData[chartData.length - 1]);
  }, [chartData, onSetActiveDataPoint]);

  return (
    <ResponsiveContainer width="100%" height={275}>
      <BarChart
        width={730}
        height={250}
        data={chartData}
        onMouseMove={onChartMouseMove}
        onMouseLeave={onChartMouseLeave}
      >
        {/* Hide default Tooltip card UI */}
        <Tooltip contentStyle={{ display: 'none' }} />
        <Bar dataKey="value" fill="#FFDF99" />
      </BarChart>
    </ResponsiveContainer>
  );
};
export default VolumeChart;
