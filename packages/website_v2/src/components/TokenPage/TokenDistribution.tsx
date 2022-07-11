import { memo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { ScrollFadeIn } from '../shared';
import ChartLabel from './ChartLabel';

const tokenAllocationData = [
  { name: 'Tempus Team', value: 26, color: '#eeecff' },
  { name: 'Investors & Advisors', value: 22, color: '#ff7700' },
  { name: 'Fair Launch Auction', value: 7, color: '#6167c8' },
  { name: 'Treasury & Liquidity Incentives', value: 45, color: '#c6cfff' },
];

const TokenDistribution = (): JSX.Element => (
  <div className="tw__token__token-distribution">
    <ScrollFadeIn>
      <div className="tw__container tw__token__token-distribution-container">
        <div className="tw__token__token-distribution-separator" />
        <h2 className="tw__token__title">Distribution</h2>
        <p className="tw__token__token-distribution-description">
          The pie chart below sets out the initial three year allocation of the 1 billion TEMP total supply. At Tempus,
          we are strong believers in decentralization and so we have allocated 52% of our initial token supply to
          benefit Tempus DAO.
        </p>
        <div className="tw__token__legend">
          <div className="tw__token__legend-item">
            <span className="tw__token__legend-color tw__token__token-distribution-legend-color-team" />
            <div>
              Tempus Team - <span className="tw__token__token-distribution-legend-value">26%</span>
            </div>
          </div>
          <div className="tw__token__legend-item">
            <span className="tw__token__legend-color tw__token__token-distribution-legend-color-investors" />
            <div>
              Investors &amp; Advisors - <span className="tw__token__token-distribution-legend-value">22%</span>
            </div>
          </div>
          <div className="tw__token__legend-item">
            <span className="tw__token__legend-color tw__token__token-distribution-legend-color-treasury" />
            <div>
              Treasury &amp; Liquidity Incentives -{' '}
              <span className="tw__token__token-distribution-legend-value">45%</span>
            </div>
          </div>
          <div className="tw__token__legend-item">
            <span className="tw__token__legend-color tw__token__token-distribution-legend-color-sale" />
            <div>
              Fair Launch Auction - <span className="tw__token__token-distribution-legend-value">7%</span>
            </div>
          </div>
        </div>
        <div className="tw__token__token-distribution-chart">
          <div className="tw__token__token-distribution-chart-wrapper">
            <ResponsiveContainer width="100%" height={435}>
              <PieChart>
                <Pie
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                  data={tokenAllocationData}
                  innerRadius="64%"
                  outerRadius="100%"
                  fill="#82ca9d"
                >
                  {tokenAllocationData.map(entry => (
                    <Cell key={entry.name} fill={entry.color} stroke={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <ChartLabel x={0} y={120} width={360} orientation="left" label="Tempus Team" value="26.00%" />
            <ChartLabel
              x={100}
              y={330}
              width={270}
              orientation="left"
              label="Investors &amp; Advisors"
              value="22.00%"
            />
            <ChartLabel
              x={0}
              y={100}
              width={370}
              orientation="right"
              label="Treasury &amp; Liquidity Incentives"
              value="45.00%"
            />
            <ChartLabel x={110} y={390} width={370} orientation="right" label="Fair Launch Auction" value="7.00%" />
          </div>
        </div>
      </div>
    </ScrollFadeIn>
  </div>
);

export default memo(TokenDistribution);
