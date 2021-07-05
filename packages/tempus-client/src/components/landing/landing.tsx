import { AreaChart, YAxis, XAxis, Tooltip, Area, ResponsiveContainer } from "recharts";

import './landing.scss';

function Landing(): JSX.Element {
  const data = [
    {
      "name": "31",
      "Value": 500
    },
    {
      "name": "27",
      "Value": 800
    },
    {
      "name": "23",
      "Value": 100
    },
    {
      "name": "19",
      "Value": 50
    },
    {
      "name": "17",
      "Value": 950
    },
    {
      "name": "13",
      "Value": 1000
    },
    {
      "name": "9",
      "Value": 1200
    },
    {
      "name": "5",
      "Value": 800
    },
    {
      "name": "1",
      "Value": 1900
    }
  ]

  return (
    <div className='tvl-chart-container'>
      <ResponsiveContainer width='80%' height={350}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="Value" stroke="#8884d8" strokeWidth={3} fillOpacity={0.8} fill="url(#colorUv)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export default Landing;
