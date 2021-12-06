import { useContext, useEffect, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { AreaChart, Tooltip, Area, ResponsiveContainer } from 'recharts';
import { selectedPoolState, staticPoolDataState } from '../../../state/PoolDataState';
import getProfitLossGraphDataAdapter from '../../../adapters/getProfitLossGraphDataAdapter';
import { WalletContext } from '../../../context/walletContext';
import ChartDataPoint from '../../../interfaces/ChartDataPoint';
import getPastDaysNumber from '../../../utils/getPastDaysNumber';
import Typography from '../../typography/Typography';
import ProfitLossChartTooltip from './ProfitLossChartTooltip';

const ProfitLossChart = () => {
  const selectedPool = useHookState(selectedPoolState);
  const staticPoolData = useHookState(staticPoolDataState);

  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [startDate, setStartDate] = useState<number | null>(null);

  const selectedPoolStaticData = staticPoolData[selectedPool.get()].attach(Downgraded).get();

  useEffect(() => {
    const fetchChartData = async () => {
      if (!userWalletSigner) {
        return;
      }
      const profitLossGraphDataAdapter = getProfitLossGraphDataAdapter(userWalletSigner);

      try {
        const result = await profitLossGraphDataAdapter.generateChartData(selectedPoolStaticData, userWalletAddress);

        setChartData(result.data);
        setStartDate(result.numberOfPastDays);
      } catch (error) {
        console.error('ProfitLossChart - fetchChartData() - ', error);
      }
    };
    fetchChartData();
  }, [userWalletAddress, userWalletSigner, selectedPoolStaticData]);

  // Hide Profit Loss chart if there is no historical data (ie. we only have data for present day)
  if (chartData.length <= 1) {
    return null;
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={275}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5580AB" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#5580AB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip content={<ProfitLossChartTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#5580AB"
            strokeWidth={3}
            fillOpacity={0.8}
            fill="url(#colorUv)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="tf__flex-row-space-between">
        {startDate &&
          getPastDaysNumber(startDate, 3).map((value: number) => (
            <Typography key={value} variant="card-body-text">
              {value}
            </Typography>
          ))}
      </div>
    </>
  );
};
export default ProfitLossChart;
