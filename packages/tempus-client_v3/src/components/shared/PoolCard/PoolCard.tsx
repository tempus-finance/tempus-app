import { FC, useMemo } from 'react';
import { Decimal, DecimalUtils, prettifyProtocolName, ProtocolName, Ticker } from 'tempus-core-services';
import { min } from 'date-fns';
import FormattedDate from '../FormattedDate';
import Logo from '../Logo';
import Typography from '../Typography';
import { PoolCardStatus, PoolCardVariant } from './PoolCardTypes';
import PoolCardRipples from './PoolCardRipples/PoolCardRipples';
import PoolCardFlag from './PoolCardFlag/PoolCardFlag';

import './PoolCard.scss';

interface PoolCardProps {
  ticker: Ticker;
  protocol: ProtocolName;
  poolCardType: PoolCardVariant;
  poolCartStatus: PoolCardStatus;
  terms: Date[];
  apr: Decimal;
  color: string;
  aggregatedAPR?: Decimal;
  multiplier?: number;
  totalBalance?: Decimal;
}

const PoolCard: FC<PoolCardProps> = props => {
  const {
    ticker,
    protocol,
    poolCardType,
    poolCartStatus,
    terms,
    apr,
    color,
    aggregatedAPR,
    totalBalance,
    multiplier = 1,
  } = props;

  const earliestTerm = useMemo(() => min(terms), [terms]);

  const aprFormatted = useMemo(() => DecimalUtils.formatPercentage(apr), [apr]);

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

  return (
    <div className="tc__poolCard" data-cardType={poolCardType}>
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
            APR (up to)
          </Typography>
          <Typography variant="subheader" weight="medium" type="mono">
            {aprFormatted}
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
        {aggregatedAPRFormatted && (
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
        {totalBalanceFormatted && (
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
      <PoolCardFlag ticker={ticker} status={poolCartStatus} />
    </div>
  );
};
export default PoolCard;
