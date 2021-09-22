import { FC, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Divider } from '@material-ui/core';
import { Palette, SelectionState, SeriesRef } from '@devexpress/dx-react-chart';
import { Chart, PieSeries } from '@devexpress/dx-react-chart-material-ui';
import NumberUtils from '../../../../services/NumberUtils';
import { TempusPool } from '../../../../interfaces/TempusPool';
import { DashboardRowChild } from '../../../../interfaces';
import PoolDataAdapter from '../../../../adapters/PoolDataAdapter';
import { div18f } from '../../../../utils/wei-math';
import Spacer from '../../../spacer/spacer';
import Typography from '../../../typography/Typography';
import ActionContainer from './../actionContainer';
import SectionContainer from './../sectionContainer';
import LegendDotSolid from '../legendDotSolid';
import LegendDotGradient from '../legendDotGradient';

interface ChartDataPoint {
  name: string;
  percentage: number;
}

interface DetailUserInfoBalancesProps {
  content: DashboardRowChild;
  poolDataAdapter: PoolDataAdapter | null;
  tempusPool: TempusPool;
  signer: JsonRpcSigner | null;
  userWalletAddress: string;
}

const DetailUserInfoBalance: FC<DetailUserInfoBalancesProps> = props => {
  const { poolDataAdapter, signer, userWalletAddress, tempusPool, content } = props;
  const { address, ammAddress } = tempusPool;
  const { supportedTokens, availableTokensToDeposit, presentValue, fixedAPR, variableAPY } = content;

  const backingTokenTicker = supportedTokens[0];
  const yieldBearingTokenTicker = supportedTokens[1];

  const [backingTokenValue, setBackingTokenValue] = useState<string>('');
  const [yieldBearingTokenValue, setYieldBearingTokenValue] = useState<string>('');
  const [formattedPresentValue, setFormattedPresentValue] = useState<string>('');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartHighlightedItems, setChartHighlightedItems] = useState<SeriesRef[]>([]);
  const [principalShareValue, setPrincipalShareValue] = useState<string>('');
  const [yieldShareValue, setYieldShareValue] = useState<string>('');
  const [lpTokenPrincipalReturnValue, setLpTokenPrincipalReturnValue] = useState<string>('');
  const [lpTokenYieldReturnValue, setLpTokenYieldReturnValue] = useState<string>('');
  const [principalShareBalance, setPrincipalShareBalance] = useState<BigNumber>(BigNumber.from('0'));
  const [yieldShareBalance, setYieldShareBalance] = useState<BigNumber>(BigNumber.from('0'));
  const [lpTokenPrincipalReturnBalance, setLpTokenPrincipalReturn] = useState<BigNumber>(BigNumber.from('0'));
  const [lpTokenYieldReturnBalance, setLpTokenYieldReturn] = useState<BigNumber>(BigNumber.from('0'));

  useMemo(() => {
    if (!availableTokensToDeposit || !presentValue) {
      return;
    }

    setBackingTokenValue(
      NumberUtils.formatWithMultiplier(ethers.utils.formatEther(availableTokensToDeposit.backingToken)),
    );
    setYieldBearingTokenValue(
      NumberUtils.formatWithMultiplier(ethers.utils.formatEther(availableTokensToDeposit.yieldBearingToken)),
    );
    setFormattedPresentValue(`$${NumberUtils.formatWithMultiplier(ethers.utils.formatEther(presentValue))}`);
  }, [availableTokensToDeposit, presentValue]);

  useMemo(() => {
    setPrincipalShareValue(NumberUtils.formatWithMultiplier(ethers.utils.formatEther(principalShareBalance)));
    setYieldShareValue(NumberUtils.formatWithMultiplier(ethers.utils.formatEther(yieldShareBalance)));
    setLpTokenPrincipalReturnValue(
      NumberUtils.formatWithMultiplier(ethers.utils.formatEther(lpTokenPrincipalReturnBalance)),
    );
    setLpTokenYieldReturnValue(NumberUtils.formatWithMultiplier(ethers.utils.formatEther(lpTokenYieldReturnBalance)));
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

  useEffect(() => {
    const retrieveBalances = async () => {
      if (signer && address && ammAddress && poolDataAdapter) {
        try {
          const userBalance = await poolDataAdapter.retrieveBalances(address, ammAddress, userWalletAddress, signer);
          const expectedLPTokenReturn = await poolDataAdapter.getExpectedReturnForLPTokens(
            ammAddress,
            userBalance.lpTokensBalance,
          );

          setPrincipalShareBalance(userBalance.principalsTokenBalance);
          setYieldShareBalance(userBalance.yieldsTokenBalance);
          setLpTokenPrincipalReturn(expectedLPTokenReturn.principals);
          setLpTokenYieldReturn(expectedLPTokenReturn.yields);
        } catch (error) {
          console.log('Detail User Info - retrieveBalances() - Failed to fetch token balances for the user!', error);
        }
      }
    };

    retrieveBalances();
  }, [signer, address, ammAddress, userWalletAddress, poolDataAdapter]);

  return (
    <>
      <SectionContainer>
        <ActionContainer label="Available to Deposit">
          <Spacer size={6} />
          <div className="tf__detail__user__info-row">
            <Typography variant="body-text">{backingTokenTicker}</Typography>
            <Typography variant="body-text">{backingTokenValue}</Typography>
          </div>
          <div className="tf__detail__user__info-row">
            <Typography variant="body-text">{yieldBearingTokenTicker}</Typography>
            <Typography variant="body-text">{yieldBearingTokenValue}</Typography>
          </div>
        </ActionContainer>
      </SectionContainer>
      <Spacer size={20} />
      <SectionContainer>
        <ActionContainer label="Current position">
          <div className="tf__detail__user__info-row">
            <Typography variant="body-text">Value</Typography>
            <Typography variant="body-text">{formattedPresentValue}</Typography>
          </div>
          <div className="tf__detail__user__info-row">
            <Typography variant="body-text">APR</Typography>
            <Typography variant="body-text">
              {NumberUtils.formatPercentage(fixedAPR)} / {NumberUtils.formatPercentage(variableAPY)}
            </Typography>
          </div>
          <Divider />
          <Spacer size={20} />
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
        </ActionContainer>
      </SectionContainer>
    </>
  );
};
export default DetailUserInfoBalance;
