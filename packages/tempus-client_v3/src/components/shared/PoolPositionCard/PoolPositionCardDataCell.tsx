import { FC, useMemo } from 'react';
import { Decimal, DecimalUtils, Ticker } from 'tempus-core-services';
import Typography from '../Typography';

interface PoolPositionCardDataCellProps {
  label: string;
  value: Decimal | null;
  tokenTicker: Ticker;
  tokenExchangeRate: Decimal;
  tokenDecimals: number;
}

const PoolPositionCardDataCell: FC<PoolPositionCardDataCellProps> = props => {
  const { label, value, tokenTicker, tokenExchangeRate, tokenDecimals } = props;

  const valueFormatted = useMemo(() => {
    if (!value) {
      return null;
    }
    return DecimalUtils.formatToCurrency(value, tokenDecimals);
  }, [value, tokenDecimals]);

  const valueFiatFormatted = useMemo(() => {
    if (!value) {
      return null;
    }
    return DecimalUtils.formatToCurrency(value.mul(tokenExchangeRate), 2, '$');
  }, [value, tokenExchangeRate]);

  // Wait for data to load before showing anything
  // TODO - Check with design team if we want to show some kind of loading indicator before the value is loaded
  if (!valueFormatted || !valueFiatFormatted) {
    return null;
  }

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
