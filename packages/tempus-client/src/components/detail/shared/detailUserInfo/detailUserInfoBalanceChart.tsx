import { FC, useContext, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { Palette, SelectionState, SeriesRef } from '@devexpress/dx-react-chart';
import { Chart, PieSeries } from '@devexpress/dx-react-chart-material-ui';
import { Context } from '../../../../context';
import { TempusPool } from '../../../../interfaces/TempusPool';
import { div18f } from '../../../../utils/wei-math';
import NumberUtils from '../../../../services/NumberUtils';
import Spacer from '../../../spacer/spacer';
import Typography from '../../../typography/Typography';
import LegendDotSolid from '../legendDotSolid';

interface UserBalanceChartDataPoint {
  name: string;
  percentage: number;
  color: string;
}

interface DetailUserInfoBalanceChartProps {
  lpTokenPrincipalReturnBalance: BigNumber;
  lpTokenYieldReturnBalance: BigNumber;
  tempusPool: TempusPool;
}

const DetailUserInfoBalanceChart: FC<DetailUserInfoBalanceChartProps> = props => {
  const { lpTokenPrincipalReturnBalance, lpTokenYieldReturnBalance, tempusPool } = props;

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
        ? NumberUtils.formatToCurrency(ethers.utils.formatEther(userPrincipalsBalance), tempusPool.decimalsForUI)
        : '-',
    );
    setYieldShareValue(
      userYieldsBalance
        ? NumberUtils.formatToCurrency(ethers.utils.formatEther(userYieldsBalance), tempusPool.decimalsForUI)
        : '-',
    );
    setLpTokenPrincipalReturnValue(
      NumberUtils.formatToCurrency(ethers.utils.formatEther(lpTokenPrincipalReturnBalance), tempusPool.decimalsForUI),
    );
    setLpTokenYieldReturnValue(
      NumberUtils.formatToCurrency(ethers.utils.formatEther(lpTokenYieldReturnBalance), tempusPool.decimalsForUI),
    );
  }, [
    lpTokenPrincipalReturnBalance,
    lpTokenYieldReturnBalance,
    userPrincipalsBalance,
    userYieldsBalance,
    tempusPool.decimalsForUI,
  ]);

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
        name: 'LP Token - Principals',
        percentage: Number(ethers.utils.formatEther(div18f(lpTokenPrincipalReturnBalance, totalValue))),
        color: '#e56000',
      },
      {
        name: 'Yields',
        percentage: Number(ethers.utils.formatEther(div18f(userYieldsBalance, totalValue))),
        color: '#288195',
      },
      {
        name: 'LP Token - Yields',
        percentage: Number(ethers.utils.formatEther(div18f(lpTokenYieldReturnBalance, totalValue))),
        color: '#206777',
      },
    ];

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

      <div className="tf__detail__user__info-row">
        <div className="tf__detail__user__info-legend-label-container">
          <LegendDotSolid color="#FF6B00" />
          <Typography variant="body-text">Principals</Typography>
        </div>
        <Typography variant="body-text">
          {principalShareValue} ({lpTokenPrincipalReturnValue} staked)
        </Typography>
      </div>
      <div className="tf__detail__user__info-row">
        <div className="tf__detail__user__info-legend-label-container">
          <LegendDotSolid color="#288195" />
          <Typography variant="body-text">Yields</Typography>
        </div>
        <Typography variant="body-text">
          {yieldShareValue} ({lpTokenYieldReturnValue} staked)
        </Typography>
      </div>
    </>
  );
};
export default DetailUserInfoBalanceChart;
