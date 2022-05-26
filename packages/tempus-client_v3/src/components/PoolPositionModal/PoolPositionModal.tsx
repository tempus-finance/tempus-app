import { FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Chain, Decimal, ProtocolName, Ticker } from 'tempus-core-services';
import { ChartDataPoint, ChartDot, DateChart, ChartDotVariant } from '../shared/Chart';
import ActionButton from '../shared/ActionButton';
import Modal from '../shared/Modal';
import PoolPositionCard from '../shared/PoolPositionCard';

import './PoolPositionModal.scss';

interface PoolPositionModalProps {
  apr: number;
  term: Date;
  profitLoss: Decimal;
  balance: Decimal;
  totalYieldEarned: Decimal;
  projectedTotalYield: Decimal;
  tokenDecimals: number;
  tokenExchangeRate: Decimal;
  tokenTicker: Ticker;
  chartData: ChartDataPoint<Date, number>[];
  address: string;
  chain: Chain;
  backingToken: Ticker;
  protocol: ProtocolName;
}

export const PoolPositionModal: FC<PoolPositionModalProps> = props => {
  const {
    apr,
    term,
    profitLoss,
    balance,
    totalYieldEarned,
    projectedTotalYield,
    tokenDecimals,
    tokenExchangeRate,
    tokenTicker,
    chartData,
    address,
    chain,
    backingToken,
    protocol,
  } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();

  const chartDot = useCallback(
    (_x, _y, index, cx, cy) => {
      let variant: ChartDotVariant = 'plus';
      if (index > 1) {
        const currentValue = chartData[index].y;
        const previousValue = chartData[index - 1].y;

        if (currentValue < previousValue) {
          variant = 'minus';
        }
      }

      return <ChartDot variant={variant} centerX={cx} centerY={cy} key={`chart-dot-${cx}-${cy}`} />;
    },
    [chartData],
  );

  const onWithdraw = useCallback(() => {
    navigate(`/withdraw/${chain}/${backingToken}/${protocol}/${address}`);
  }, [address, backingToken, chain, protocol, navigate]);

  return (
    <Modal open onClose={() => {}} title={t('PoolPositionModal.title')} size="large">
      <div className="tc__poolPositionModal-info">
        <PoolPositionCard
          apr={apr}
          term={term}
          profitLoss={profitLoss}
          balance={balance}
          totalYieldEarned={totalYieldEarned}
          projectedTotalYield={projectedTotalYield}
          tokenDecimals={tokenDecimals}
          tokenExchangeRate={tokenExchangeRate}
          tokenTicker={tokenTicker}
        />
      </div>
      <div className="tc__poolPositionModal-chart">
        <DateChart data={chartData} dot={chartDot} height={345} width="100%" />
        {/* TODO - Add extra x-axis in chart component that will show 'Earned/Projected yield' labels */}
      </div>
      {/* TODO - Add transaction history (check with design team if it's done) */}
      <div className="tc__poolPositionModal-actions">
        <ActionButton
          onClick={onWithdraw}
          variant="primary"
          size="large"
          labels={{
            default: t('PoolPositionModal.withdrawAction'),
          }}
        />
      </div>
    </Modal>
  );
};
