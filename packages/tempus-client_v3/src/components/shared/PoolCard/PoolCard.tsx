import { FC, useCallback, useMemo } from 'react';
import { Chain, Decimal, DecimalUtils, prettifyProtocolName, ProtocolName, Ticker } from 'tempus-core-services';
import { min } from 'date-fns';
import FormattedDate from '../FormattedDate';
import Logo from '../Logo';
import Typography from '../Typography';
import { PoolCardStatus, PoolCardVariant } from './PoolCardTypes';
import PoolCardRipples from './PoolCardRipples/PoolCardRipples';
import PoolCardFlag from './PoolCardFlag/PoolCardFlag';

import './PoolCard.scss';

interface PoolCardProps {
  chain: Chain;
  ticker: Ticker;
  protocol: ProtocolName;
  poolCardVariant: PoolCardVariant;
  poolCardStatus: PoolCardStatus;
  terms: Date[];
  aprValues: Decimal[];
  color: string;
  aggregatedAPR?: Decimal;
  multiplier?: number;
  totalBalance?: Decimal;
  poolAddresses: string[];
  onClick: (
    chain: Chain,
    ticker: Ticker,
    protocol: ProtocolName,
    status: PoolCardStatus,
    poolAddresses: string[],
  ) => void;
}

const PoolCard: FC<PoolCardProps> = props => {
  const {
    chain,
    ticker,
    protocol,
    poolCardVariant,
    poolCardStatus,
    terms,
    aprValues,
    color,
    aggregatedAPR,
    totalBalance,
    multiplier = 1,
    poolAddresses,
    onClick,
  } = props;

  const earliestTerm = useMemo(() => min(terms), [terms]);

  const maxApr = useMemo(() => {
    let max = new Decimal(0);
    aprValues.forEach(aprValue => {
      if (aprValue.gte(max)) {
        max = aprValue;
      }
    });
    return max;
  }, [aprValues]);

  const maxAprFormatted = useMemo(() => DecimalUtils.formatPercentage(maxApr), [maxApr]);

  const aggregatedAPRFormatted = useMemo(() => {
    if (!aggregatedAPR) {
      return null;
    }
    return DecimalUtils.formatPercentage(aggregatedAPR);
  }, [aggregatedAPR]);

  const totalBalanceFormatted = useMemo(() => {
    if (!totalBalance) {
      return null;
    }
    return DecimalUtils.formatWithMultiplier(totalBalance, 2);
  }, [totalBalance]);

  const aprLabel = useMemo(() => {
    if (poolCardVariant === 'markets') {
      return aprValues.length === 1 ? 'Fixed APR' : 'Fixed APR (up to)';
    }

    return aprValues.length === 1 ? 'APR' : 'APR (up to)';
  }, [aprValues.length, poolCardVariant]);

  const handleClick = useCallback(() => {
    onClick(chain, ticker, protocol, poolCardStatus, poolAddresses);
  }, [chain, ticker, protocol, poolCardStatus, poolAddresses, onClick]);

  return (
    <div className="tc__poolCard" data-card-variant={poolCardVariant} onClick={handleClick}>
      {/* Pool backing token ticker */}
      <Typography variant="subheader" weight="bold">
        {multiplier > 1 && `x${multiplier}`} {ticker}
      </Typography>

      {/* Pool underlying protocol name */}
      <div className="tc__poolCard-protocol">
        <Logo type={`protocol-${protocol}`} size={20} />
        <Typography variant="body-secondary" weight="medium">
          {prettifyProtocolName(protocol)}
        </Typography>
      </div>

      <div className="tc__poolCard-info">
        {/* APR */}
        <div className="tc__poolCard-info-row">
          <Typography variant="body-secondary" weight="medium" color="text-secondary">
            {aprLabel}
          </Typography>
          <Typography variant="subheader" weight="medium" type="mono">
            {maxAprFormatted}
          </Typography>
        </div>

        {/* Term */}
        <div className="tc__poolCard-info-row">
          <Typography variant="body-secondary" weight="medium" color="text-secondary">
            {terms.length > 1 ? 'Earliest term' : 'Term'}
          </Typography>
          <FormattedDate date={earliestTerm} size="large" />
        </div>

        {/* Aggregated APR */}
        {poolCardVariant === 'portfolio' && aggregatedAPRFormatted && (
          <div className="tc__poolCard-info-row">
            <Typography variant="body-secondary" weight="medium" color="text-secondary">
              Aggregated APR
            </Typography>
            <Typography variant="subheader" weight="medium" type="mono">
              {aggregatedAPRFormatted}
            </Typography>
          </div>
        )}

        {/* Total Balance */}
        {poolCardVariant === 'portfolio' && totalBalanceFormatted && (
          <div className="tc__poolCard-info-row">
            <Typography variant="body-secondary" weight="medium" color="text-secondary">
              Total Balance
            </Typography>
            <Typography variant="subheader" weight="medium" type="mono">
              {totalBalanceFormatted}
            </Typography>
          </div>
        )}
      </div>

      <PoolCardRipples color={color} />
      <PoolCardFlag ticker={ticker} status={poolCardStatus} />
    </div>
  );
};
export default PoolCard;
