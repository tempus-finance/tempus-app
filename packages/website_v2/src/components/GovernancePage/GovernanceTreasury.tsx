import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { DecimalUtils, ZERO } from 'tempus-core-services';
import TreasuryValueService, { TreasuryValues } from '../../services/TreasuryValueService';
import { Loading } from '../shared';

interface TreasurySource {
  name: string;
  description?: string;
  percent: number;
  color: string;
}

const GovernanceTreasury = (): JSX.Element => {
  const [treasuryValues, setTreasuryValues] = useState<TreasuryValues | null>(null);
  const [selectedSource, setSelectedSource] = useState<TreasurySource | null>(null);

  useEffect(() => {
    const fetchValue = async () => {
      const treasuryValueService = new TreasuryValueService();

      try {
        setTreasuryValues(await treasuryValueService.getValuesPerSource());
      } catch (error) {
        console.log('GovernanceTreasury - getValuesPerSource() - Failed to fetch treasury values!', error);
      }
    };
    fetchValue();
  }, []);

  const totalTreasuryValue = useMemo(
    () =>
      treasuryValues ? Object.values(treasuryValues).reduce((sum, sourceValue) => sum.add(sourceValue), ZERO) : null,
    [treasuryValues],
  );

  const totalTreasuryValueFormatted = useMemo(() => {
    if (!totalTreasuryValue) {
      return null;
    }

    return DecimalUtils.formatToCurrency(totalTreasuryValue, 0, '$');
  }, [totalTreasuryValue]);

  const chartData = useMemo(
    () =>
      treasuryValues
        ? [
            {
              name: 'TEMP token',
              value: treasuryValues.tempToken,
              color: '#C6C0FF',
            },
            {
              name: 'Other',
              value: treasuryValues.tempusPools,
              color: '#EEECFF',
            },
            {
              name: 'Balancer Liquidity',
              description: 'TEMP-WETH (80/20)',
              value: treasuryValues.balancerPool,
              color: '#6167C8',
            },
            {
              name: 'Uniswap Liquidity',
              description: 'TEMP-USDC (50/50)',
              value: treasuryValues.uniswapPool,
              color: '#FF7700',
            },
          ].map(entry => ({ ...entry, value: +entry.value.toBigNumber() }))
        : [],
    [treasuryValues],
  );

  const handlePieSectorSelect = useCallback(data => setSelectedSource(data), [setSelectedSource]);

  const handlePieSectorDeselect = useCallback(() => setSelectedSource(null), []);

  return (
    <div className="tw__governance__treasury">
      <div className="tw__container tw__governance__treasury-container">
        <h2 className="tw__governance__title">Treasury Funds</h2>
        <div className="tw__governance__treasury-content">
          {totalTreasuryValueFormatted ? (
            <div className="tw__governance__treasury-value">{totalTreasuryValueFormatted}</div>
          ) : (
            <Loading />
          )}

          <div className="tw__governance__treasury-chart">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                  data={chartData}
                  innerRadius="70%"
                  outerRadius="100%"
                  fill="#82ca9d"
                  onMouseEnter={handlePieSectorSelect}
                  onMouseLeave={handlePieSectorDeselect}
                  onMouseDown={handlePieSectorSelect}
                >
                  {chartData.map(entry => (
                    <Cell key={entry.name} fill={entry.color} stroke={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {selectedSource && (
              <div className="tw__governance__treasury-chart-selected-sector">
                <div className="tw__governance__treasury-chart-selected-name">{selectedSource.name}</div>
                {selectedSource.description && (
                  <div className="tw__governance__treasury-chart-selected-description">
                    {selectedSource.description}
                  </div>
                )}
                <div className="tw__governance__treasury-chart-selected-value" style={{ color: selectedSource.color }}>
                  {DecimalUtils.formatPercentage(selectedSource.percent)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(GovernanceTreasury);
