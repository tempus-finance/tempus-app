import { ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';

import { generateChartData } from '../../../utils/data-generator';

function VolumeChart(): JSX.Element {
  // Dummy data - TODO - Replace with real date from contract
  const data = generateChartData(60);

  return (
    <ResponsiveContainer width="100%" height={275}>
      <BarChart width={730} height={250} data={data}>
        {/* Hide default Tooltip card UI */}
        <Tooltip contentStyle={{ display: 'none' }} />
        <Bar dataKey="value" fill="#FFDF99" />
      </BarChart>
    </ResponsiveContainer>
  );
}
export default VolumeChart;
