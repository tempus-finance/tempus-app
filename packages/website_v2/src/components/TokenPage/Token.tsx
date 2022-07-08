import { memo, useCallback } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { DecimalUtils } from 'tempus-core-services';
import { ScrollFadeIn } from '../shared';

const data = [
  {
    date: 'Nov 2021',
    team: 0,
    investorsAndAdvisors: 0,
    publicSale: 70000000,
  },
  {
    date: 'Dec 2021',
    team: 0,
    investorsAndAdvisors: 0,
    publicSale: 70000000,
  },
  {
    date: 'Jan 2022',
    team: 7222222,
    investorsAndAdvisors: 7333333,
    publicSale: 70000000,
  },
  {
    date: 'Feb 2022',
    team: 14444444,
    investorsAndAdvisors: 14666667,
    publicSale: 70000000,
  },
  {
    date: 'Mar 2022',
    team: 21666667,
    investorsAndAdvisors: 22000000,
    publicSale: 70000000,
  },
  {
    date: 'Apr 2022',
    team: 28888889,
    investorsAndAdvisors: 29333333,
    publicSale: 70000000,
  },
  {
    date: 'May 2022',
    team: 36111111,
    investorsAndAdvisors: 36666667,
    publicSale: 70000000,
  },
  {
    date: 'Jun 2022',
    team: 43333333,
    investorsAndAdvisors: 44000000,
    publicSale: 70000000,
  },
  {
    date: 'Jul 2022',
    team: 50555556,
    investorsAndAdvisors: 51333333,
    publicSale: 70000000,
  },
  {
    date: 'Aug 2022',
    team: 57777778,
    investorsAndAdvisors: 58666667,
    publicSale: 70000000,
  },
  {
    date: 'Sep 2022',
    team: 65000000,
    investorsAndAdvisors: 66000000,
    publicSale: 70000000,
  },
  {
    date: 'Oct 2022',
    team: 72222222,
    investorsAndAdvisors: 73333333,
    publicSale: 70000000,
  },
  {
    date: 'Nov 2022',
    team: 79444444,
    investorsAndAdvisors: 80666667,
    publicSale: 70000000,
  },
  {
    date: 'Dec 2022',
    team: 86666667,
    investorsAndAdvisors: 88000000,
    publicSale: 70000000,
  },
  {
    date: 'Jan 2023',
    team: 93888889,
    investorsAndAdvisors: 95333333,
    publicSale: 70000000,
  },
  {
    date: 'Feb 2023',
    team: 101111111,
    investorsAndAdvisors: 102666667,
    publicSale: 70000000,
  },
  {
    date: 'Mar 2023',
    team: 108333333,
    investorsAndAdvisors: 110000000,
    publicSale: 70000000,
  },
  {
    date: 'Apr 2023',
    team: 115555556,
    investorsAndAdvisors: 117333333,
    publicSale: 70000000,
  },
  {
    date: 'May 2023',
    team: 122777778,
    investorsAndAdvisors: 124666667,
    publicSale: 70000000,
  },
  {
    date: 'Jun 2023',
    team: 130000000,
    investorsAndAdvisors: 132000000,
    publicSale: 70000000,
  },
  {
    date: 'Jul 2023',
    team: 137222222,
    investorsAndAdvisors: 139333333,
    publicSale: 70000000,
  },
  {
    date: 'Aug 2023',
    team: 144444444,
    investorsAndAdvisors: 146666667,
    publicSale: 70000000,
  },
  {
    date: 'Sep 2023',
    team: 151666667,
    investorsAndAdvisors: 154000000,
    publicSale: 70000000,
  },
  {
    date: 'Oct 2023',
    team: 158888889,
    investorsAndAdvisors: 161333333,
    publicSale: 70000000,
  },
  {
    date: 'Nov 2023',
    team: 166111111,
    investorsAndAdvisors: 168666667,
    publicSale: 70000000,
  },
  {
    date: 'Dec 2023',
    team: 173333333,
    investorsAndAdvisors: 176000000,
    publicSale: 70000000,
  },
  {
    date: 'Jan 2024',
    team: 180555556,
    investorsAndAdvisors: 183333333,
    publicSale: 70000000,
  },
  {
    date: 'Feb 2024',
    team: 187777778,
    investorsAndAdvisors: 190666667,
    publicSale: 70000000,
  },
  {
    date: 'Mar 2024',
    team: 195000000,
    investorsAndAdvisors: 198000000,
    publicSale: 70000000,
  },
  {
    date: 'Apr 2024',
    team: 202222222,
    investorsAndAdvisors: 205333333,
    publicSale: 70000000,
  },
  {
    date: 'May 2024',
    team: 209444444,
    investorsAndAdvisors: 212666667,
    publicSale: 70000000,
  },
];

const Token = (): JSX.Element => {
  const formatTickValue = useCallback((value: number) => DecimalUtils.formatWithMultiplier(value), []);

  return (
    <div className="tw__token__token">
      <ScrollFadeIn>
        <div className="tw__container tw__token__token-container">
          <h2 className="tw__token__title">TEMP Token</h2>
          <p className="tw__token__token-description">
            The maximum supply of TEMP is 1 billion and 70 million unlocked TEMP were sold in a fair launch auction in
            November 2021. The remaining 930 million TEMP will unlock gradually until May 2024.
          </p>
          <div className="tw__token__legend">
            <div className="tw__token__legend-item">
              <span className="tw__token__legend-color tw__token__token-legend-color-sale" />
              <span>Fair Launch Investors</span>
            </div>
            <div className="tw__token__legend-item">
              <span className="tw__token__legend-color tw__token__token-legend-color-investors" />
              <span>Investors &amp; Advisors</span>
            </div>
            <div className="tw__token__legend-item">
              <span className="tw__token__legend-color tw__token__token-legend-color-team" />
              <span>Current &amp; Future Team</span>
            </div>
          </div>
          <div className="tw__token__token-chart">
            <ResponsiveContainer width="100%" height={470}>
              <AreaChart
                width={500}
                height={342}
                data={data}
                margin={{
                  top: 48,
                  right: 20,
                  left: 20,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient id="publicSaleGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6167c8" />
                    <stop offset="100%" stopColor="#c6bfff" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} opacity={1} />
                <XAxis dataKey="date" stroke="#ffffff" dy={20} />
                <YAxis stroke="#ffffff" dx={-15} tickFormatter={formatTickValue} />
                <Area
                  type="monotone"
                  dataKey="team"
                  stackId="1"
                  stroke="#eeecff"
                  fill="#eeecff"
                  opacity={1}
                  fillOpacity={1}
                />
                <Area
                  type="monotone"
                  dataKey="investorsAndAdvisors"
                  stackId="1"
                  stroke="#ff7700"
                  fill="#ff7700"
                  opacity={1}
                  fillOpacity={1}
                />
                <Area
                  type="monotone"
                  dataKey="publicSale"
                  stackId="1"
                  strokeWidth={0}
                  fill="url(#publicSaleGradient)"
                  opacity={1}
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ScrollFadeIn>
    </div>
  );
};

export default memo(Token);
