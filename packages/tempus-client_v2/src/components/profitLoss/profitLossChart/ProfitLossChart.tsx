import { useContext, useEffect, useMemo, useState } from 'react';
import { AreaChart, Tooltip, Area, ResponsiveContainer } from 'recharts';
import getProfitLossGraphDataAdapter from '../../../adapters/getProfitLossGraphDataAdapter';
import { getDataForPool, PoolDataContext } from '../../../context/poolDataContext';
import { WalletContext } from '../../../context/walletContext';
import ChartDataPoint from '../../../interfaces/ChartDataPoint';
import getPastDaysNumber from '../../../utils/getPastDaysNumber';
import Typography from '../../typography/Typography';
import ProfitLossChartTooltip from './ProfitLossChartTooltip';

const ProfitLossChart = () => {
  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);
  const { poolData, selectedPool } = useContext(PoolDataContext);

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [startDate, setStartDate] = useState<number | null>(null);

  const activePoolData = useMemo(() => {
    return getDataForPool(selectedPool, poolData);
  }, [poolData, selectedPool]);

  useEffect(() => {
    const fetchChartData = async () => {
      if (!userWalletSigner) {
        return;
      }
      const profitLossGraphDataAdapter = getProfitLossGraphDataAdapter(userWalletSigner);

      const result = await profitLossGraphDataAdapter.generateChartData(activePoolData, userWalletAddress);

      setChartData(result.data);
      setStartDate(result.numberOfPastDays);
    };
    fetchChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userWalletAddress, userWalletSigner]);

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
