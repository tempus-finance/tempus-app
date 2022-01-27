import { ethers } from 'ethers';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { AreaChart, Tooltip, Area, ResponsiveContainer } from 'recharts';
import { dynamicPoolDataState, selectedPoolState, staticPoolDataState } from '../../../state/PoolDataState';
import { selectedChainState } from '../../../state/ChainState';
import getProfitLossGraphDataAdapter from '../../../adapters/getProfitLossGraphDataAdapter';
import { WalletContext } from '../../../context/walletContext';
import ChartDataPoint from '../../../interfaces/ChartDataPoint';
import getPastDaysNumber from '../../../utils/getPastDaysNumber';
import Typography from '../../typography/Typography';
import ProfitLossChartTooltip from './ProfitLossChartTooltip';

const ProfitLossChart = () => {
  const selectedPool = useHookState(selectedPoolState);
  const staticPoolData = useHookState(staticPoolDataState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);
  const selectedNetwork = useHookState(selectedChainState);

  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [startDate, setStartDate] = useState<number | null>(null);

  const pastDaysNumber = useMemo(() => (startDate ? getPastDaysNumber(startDate, 3) : []), [startDate]);

  const selectedNetworkName = selectedNetwork.attach(Downgraded).get();
  const selectedPoolStaticData = staticPoolData[selectedPool.get()].attach(Downgraded).get();
  const userBalanceUSD = dynamicPoolData[selectedPool.get()].userBalanceUSD.attach(Downgraded).get();

  useEffect(() => {
    const fetchChartData = async () => {
      if (!userWalletSigner) {
        return;
      }
      const profitLossGraphDataAdapter = getProfitLossGraphDataAdapter(selectedNetworkName, userWalletSigner);

      try {
        const result = await profitLossGraphDataAdapter.generateChartData(selectedPoolStaticData, userWalletAddress);

        setChartData(result.data);
        setStartDate(result.numberOfPastDays);
      } catch (error) {
        console.error('ProfitLossChart - fetchChartData() - ', error);
      }
    };
    fetchChartData();
  }, [userWalletAddress, userWalletSigner, selectedPoolStaticData, selectedNetworkName]);

  /**
   * Update chart data every time user USD balance changes for the pool
   */
  useEffect(() => {
    if (!userBalanceUSD || chartData.length === 0) {
      return;
    }

    const currentChartData = [...chartData];

    const lastChartEntry = currentChartData.pop();
    if (!lastChartEntry) {
      return;
    }

    // USD Values are always in 18 decimal precision
    lastChartEntry.value = Number(ethers.utils.formatEther(userBalanceUSD));

    // Calculate new value increase
    const previousEntry = currentChartData[currentChartData.length - 1];
    if (previousEntry && previousEntry.value !== 0) {
      const valueDiff = lastChartEntry.value - previousEntry.value;
      const valueRatio = valueDiff / previousEntry.value;

      lastChartEntry.valueIncrease = valueRatio.toString();
    }

    // Update chart with new data
    currentChartData.push(lastChartEntry);
    setChartData(currentChartData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userBalanceUSD]);

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
        {pastDaysNumber.length > 0 &&
          pastDaysNumber.map((value: number) => (
            <Typography key={value} variant="card-body-text">
              {value}
            </Typography>
          ))}
      </div>
    </>
  );
};
export default ProfitLossChart;
