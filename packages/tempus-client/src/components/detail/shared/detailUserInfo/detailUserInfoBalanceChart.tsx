import { FC, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { Palette, SelectionState, SeriesRef } from '@devexpress/dx-react-chart';
import { Chart, PieSeries } from '@devexpress/dx-react-chart-material-ui';
import { div18f } from '../../../../utils/wei-math';
import NumberUtils from '../../../../services/NumberUtils';
import Spacer from '../../../spacer/spacer';
import Typography from '../../../typography/Typography';
import LegendDotSolid from '../legendDotSolid';
import LegendDotGradient from '../legendDotGradient';

interface UserBalanceChartDataPoint {
  name: string;
  percentage: number;
}

interface DetailUserInfoBalanceChartProps {
  principalShareBalance: BigNumber;
  yieldShareBalance: BigNumber;
  lpTokenPrincipalReturnBalance: BigNumber;
  lpTokenYieldReturnBalance: BigNumber;
}

const DetailUserInfoBalanceChart: FC<DetailUserInfoBalanceChartProps> = props => {
  const { principalShareBalance, yieldShareBalance, lpTokenPrincipalReturnBalance, lpTokenYieldReturnBalance } = props;

  const [chartData, setChartData] = useState<UserBalanceChartDataPoint[]>([]);
  const [chartHighlightedItems, setChartHighlightedItems] = useState<SeriesRef[]>([]);
  const [principalShareValue, setPrincipalShareValue] = useState<string>('');
  const [yieldShareValue, setYieldShareValue] = useState<string>('');
  const [lpTokenPrincipalReturnValue, setLpTokenPrincipalReturnValue] = useState<string>('');
  const [lpTokenYieldReturnValue, setLpTokenYieldReturnValue] = useState<string>('');

  useMemo(() => {
    setPrincipalShareValue(NumberUtils.formatWithMultiplier(ethers.utils.formatEther(principalShareBalance), 2));
    setYieldShareValue(NumberUtils.formatWithMultiplier(ethers.utils.formatEther(yieldShareBalance), 2));
    setLpTokenPrincipalReturnValue(
      NumberUtils.formatWithMultiplier(ethers.utils.formatEther(lpTokenPrincipalReturnBalance), 2),
    );
    setLpTokenYieldReturnValue(
      NumberUtils.formatWithMultiplier(ethers.utils.formatEther(lpTokenYieldReturnBalance), 2),
    );
  }, [principalShareBalance, yieldShareBalance, lpTokenPrincipalReturnBalance, lpTokenYieldReturnBalance]);

  useMemo(() => {
    const totalValue = principalShareBalance
      .add(yieldShareBalance)
      .add(lpTokenPrincipalReturnBalance)
      .add(lpTokenYieldReturnBalance);
    if (totalValue.isZero()) {
      return;
    }

    const dataPoints = [
      {
        name: 'Principals',
        percentage: Number(ethers.utils.formatEther(div18f(principalShareBalance, totalValue))),
      },
      {
        name: 'Yields',
        percentage: Number(ethers.utils.formatEther(div18f(yieldShareBalance, totalValue))),
      },
      {
        name: 'LP Token - Principals',
        percentage: Number(ethers.utils.formatEther(div18f(lpTokenPrincipalReturnBalance, totalValue))),
      },
      {
        name: 'LP Token - Yields',
        percentage: Number(ethers.utils.formatEther(div18f(lpTokenYieldReturnBalance, totalValue))),
      },
    ].sort((a, b) => {
      return b.percentage - a.percentage;
    });
    const highlightedDataPoints: SeriesRef[] = [];

    dataPoints.forEach((dataPoint, index) => {
      if (dataPoint.name === 'LP Token - Principals' || dataPoint.name === 'LP Token - Yields') {
        highlightedDataPoints.push({
          series: 'defaultSeriesName',
          point: index,
        });
      }
    });

    setChartData(dataPoints);
    setChartHighlightedItems(highlightedDataPoints);
  }, [principalShareBalance, yieldShareBalance, lpTokenPrincipalReturnBalance, lpTokenYieldReturnBalance]);

  return (
    <>
      <Chart data={chartData} height={225}>
        <Palette scheme={['#FF6B00', '#288195', '#e56000', '#206777']} />
        <PieSeries valueField="percentage" argumentField="name" innerRadius={0.6} outerRadius={1} />
        <SelectionState selection={chartHighlightedItems} />
      </Chart>
      <Spacer size={20} />
      <div className="tf__detail__user__info-row">
        <div className="tf__detail__user__info-legend-label-container">
          <LegendDotSolid color="#FF6B00" />
          <Typography variant="body-text">Principals</Typography>
        </div>
        <Typography variant="body-text">{principalShareValue}</Typography>
      </div>
      <div className="tf__detail__user__info-row">
        <div className="tf__detail__user__info-legend-label-container">
          <LegendDotSolid color="#288195" />
          <Typography variant="body-text">Yields</Typography>
        </div>
        <Typography variant="body-text">{yieldShareValue}</Typography>
      </div>
      <div className="tf__detail__user__info-row">
        <div className="tf__detail__user__info-legend-label-container">
          <LegendDotGradient startColor="#F5AC37" endColor="#EB5A00" />
          <Typography variant="body-text">LP Token - Principals</Typography>
        </div>
        <Typography variant="body-text">{lpTokenPrincipalReturnValue}</Typography>
      </div>
      <div className="tf__detail__user__info-row">
        <div className="tf__detail__user__info-legend-label-container">
          <LegendDotGradient startColor="#288195" endColor="#00042C" />
          <Typography variant="body-text">LP Token - Yields</Typography>
        </div>
        <Typography variant="body-text">{lpTokenYieldReturnValue}</Typography>
      </div>
    </>
  );
};
export default DetailUserInfoBalanceChart;
