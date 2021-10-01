import { FC, useContext, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { Palette, SelectionState, SeriesRef } from '@devexpress/dx-react-chart';
import { Chart, PieSeries } from '@devexpress/dx-react-chart-material-ui';
import { Context } from '../../../../context';
import { div18f } from '../../../../utils/wei-math';
import NumberUtils from '../../../../services/NumberUtils';
import Spacer from '../../../spacer/spacer';
import Typography from '../../../typography/Typography';
import LegendDotSolid from '../legendDotSolid';
import LegendDotGradient from '../legendDotGradient';

interface UserBalanceChartDataPoint {
  name: string;
  percentage: number;
  color: string;
}

interface DetailUserInfoBalanceChartProps {
  lpTokenPrincipalReturnBalance: BigNumber;
  lpTokenYieldReturnBalance: BigNumber;
}

const DetailUserInfoBalanceChart: FC<DetailUserInfoBalanceChartProps> = props => {
  const { lpTokenPrincipalReturnBalance, lpTokenYieldReturnBalance } = props;

  const {
    data: { userPrincipalsBalance, userYieldsBalance },
  } = useContext(Context);

  const [chartData, setChartData] = useState<UserBalanceChartDataPoint[]>([]);
  const [chartHighlightedItems, setChartHighlightedItems] = useState<SeriesRef[]>([]);
  const [chartColors, setChartColors] = useState<string[]>([]);
  const [principalShareValue, setPrincipalShareValue] = useState<string>('');
  const [yieldShareValue, setYieldShareValue] = useState<string>('');
  const [lpTokenPrincipalReturnValue, setLpTokenPrincipalReturnValue] = useState<string>('');
  const [lpTokenYieldReturnValue, setLpTokenYieldReturnValue] = useState<string>('');

  useMemo(() => {
    setPrincipalShareValue(
      userPrincipalsBalance
        ? NumberUtils.formatWithMultiplier(ethers.utils.formatEther(userPrincipalsBalance), 2)
        : '-',
    );
    setYieldShareValue(
      userYieldsBalance ? NumberUtils.formatWithMultiplier(ethers.utils.formatEther(userYieldsBalance), 2) : '-',
    );
    setLpTokenPrincipalReturnValue(
      NumberUtils.formatWithMultiplier(ethers.utils.formatEther(lpTokenPrincipalReturnBalance), 2),
    );
    setLpTokenYieldReturnValue(
      NumberUtils.formatWithMultiplier(ethers.utils.formatEther(lpTokenYieldReturnBalance), 2),
    );
  }, [lpTokenPrincipalReturnBalance, lpTokenYieldReturnBalance, userPrincipalsBalance, userYieldsBalance]);

  useMemo(() => {
    if (!userPrincipalsBalance || !userYieldsBalance) {
      return;
    }

    const totalValue = userPrincipalsBalance
      .add(userYieldsBalance)
      .add(lpTokenPrincipalReturnBalance)
      .add(lpTokenYieldReturnBalance);
    if (totalValue.isZero()) {
      return;
    }

    const dataPoints: UserBalanceChartDataPoint[] = [
      {
        name: 'Principals',
        percentage: Number(ethers.utils.formatEther(div18f(userPrincipalsBalance, totalValue))),
        color: '#FF6B00',
      },
      {
        name: 'Yields',
        percentage: Number(ethers.utils.formatEther(div18f(userYieldsBalance, totalValue))),
        color: '#288195',
      },
      {
        name: 'LP Token - Principals',
        percentage: Number(ethers.utils.formatEther(div18f(lpTokenPrincipalReturnBalance, totalValue))),
        color: '#e56000',
      },
      {
        name: 'LP Token - Yields',
        percentage: Number(ethers.utils.formatEther(div18f(lpTokenYieldReturnBalance, totalValue))),
        color: '#206777',
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

    const dataColors = dataPoints.map(dataPoint => {
      return dataPoint.color;
    });

    setChartData(dataPoints);
    setChartColors(dataColors);
    setChartHighlightedItems(highlightedDataPoints);
  }, [userPrincipalsBalance, userYieldsBalance, lpTokenPrincipalReturnBalance, lpTokenYieldReturnBalance]);

  return (
    <>
      <Chart data={chartData} height={225}>
        <Palette scheme={chartColors} />
        <PieSeries valueField="percentage" argumentField="name" innerRadius={0.6} outerRadius={1} />
        <SelectionState selection={chartHighlightedItems} />
      </Chart>
      <Spacer size={20} />
      <Typography variant="h4">Primitives</Typography>
      <Spacer size={10} />
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
      <Spacer size={15} />
      <Typography variant="h4">LP Token</Typography>
      <Spacer size={10} />
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
