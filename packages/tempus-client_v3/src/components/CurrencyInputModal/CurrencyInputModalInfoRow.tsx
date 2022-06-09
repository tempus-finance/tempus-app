import { FC } from 'react';
import { Icon, Typography } from '../shared';

type ValueChange = 'increase' | 'decrease';

export interface CurrencyInputModalInfoRowProps {
  label: string;
  value: string;
  valueChange?: ValueChange;
  currency: string;
  usdValue: string;
}

const CurrencyInputModalInfoRow: FC<CurrencyInputModalInfoRowProps> = props => {
  const { label, value, valueChange, currency, usdValue } = props;

  return (
    <div className="tc__currency-input-modal__info-row">
      <Typography className="tc__currency-input-modal__info-row-label" variant="body-primary" weight="medium">
        {label}
      </Typography>
      {valueChange && (
        <div className="tc__currency-input-modal__value-change">
          {valueChange === 'increase' && <Icon variant="plus" size="tiny" />}
          {valueChange === 'decrease' && <Icon variant="minus" size="tiny" />}
        </div>
      )}
      <Typography
        className="tc__currency-input-modal__info-row-value"
        variant="body-primary"
        type="mono"
        weight="medium"
      >
        {value}
      </Typography>
      <Typography className="tc__currency-input-modal__info-row-currency" variant="body-primary" weight="medium">
        {currency}
      </Typography>
      <Typography
        className="tc__currency-input-modal__info-row-fiat-value"
        variant="body-secondary"
        type="mono"
        weight="medium"
      >
        {usdValue}
      </Typography>
      <Typography className="tc__currency-input-modal__info-row-fiat" variant="body-secondary" weight="medium">
        USD
      </Typography>
    </div>
  );
};

export default CurrencyInputModalInfoRow;
