import { FC, useMemo } from 'react';
import { Decimal, DecimalUtils, Ticker } from 'tempus-core-services';
import Typography from '../Typography';

interface PoolPositionCardDataCellProps {
  label: string;
  value: Decimal;
  tokenTicker: Ticker;
  tokenExchangeRate: Decimal;
  tokenDecimals: number;
}

const PoolPositionCardDataCell: FC<PoolPositionCardDataCellProps> = props => {
  const { label, value, tokenTicker, tokenExchangeRate, tokenDecimals } = props;

  const valueFormatted = useMemo(() => DecimalUtils.formatToCurrency(value, tokenDecimals), [value, tokenDecimals]);

  const valueFiatFormatted = useMemo(
    () => DecimalUtils.formatToCurrency(value.mul(tokenExchangeRate), 2, '$'),
    [value, tokenExchangeRate],
  );

  return (
    <div className="tc__poolPositionCard-cellData">
      <Typography variant="body-secondary" weight="bold" color="text-secondary">
        {label}
      </Typography>
      <div className="tc__poolPositionCard-cellDataRow">
        <Typography variant="body-primary" weight="medium" type="mono">
          {valueFormatted}
        </Typography>
        &nbsp; {/* space character */}
        <Typography variant="body-primary" weight="medium" color="text-secondary">
          {tokenTicker}
        </Typography>
      </div>
      <div className="tc__poolPositionCard-cellDataRow">
        <Typography variant="body-secondary" weight="medium" type="mono">
          {valueFiatFormatted}
        </Typography>
        &nbsp; {/* space character */}
        <Typography variant="body-secondary" weight="medium" color="text-secondary">
          USD
        </Typography>
      </div>
    </div>
  );
};
export default PoolPositionCardDataCell;
