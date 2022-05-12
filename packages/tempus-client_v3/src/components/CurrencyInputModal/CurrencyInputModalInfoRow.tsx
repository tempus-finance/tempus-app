import { FC } from 'react';
import { colors, Icon, Typography } from '../shared';

type ValueChange = 'increase' | 'decrease';

export interface CurrencyInputModalInfoRowProps {
  label: string;
  value: string;
  valueChange?: ValueChange;
  currency: string;
}

const CurrencyInputModalInfoRow: FC<CurrencyInputModalInfoRowProps> = props => {
  const { label, value, valueChange, currency } = props;

  return (
    <div className="tc__currency-input-modal__info-row">
      <Typography variant="body-primary" weight="medium">
        {label}
      </Typography>
      <div className="tc__currency-input-modal__info-row-value">
        {valueChange === 'increase' && (
          <div className="tc__currency-input-modal__value-change tc__currency-input-modal__value-change-increase">
            <Icon variant="up-arrow" size="tiny" color={colors.textSuccess} />
          </div>
        )}
        {valueChange === 'decrease' && (
          <div className="tc__currency-input-modal__value-change tc__currency-input-modal__value-change-decrease">
            <Icon variant="down-arrow" size="tiny" color={colors.textError} />
          </div>
        )}
        <Typography variant="body-primary" type="mono" weight="medium">
          {value}
        </Typography>
        <Typography variant="body-primary" weight="medium">
          {currency}
        </Typography>
      </div>
    </div>
  );
};

export default CurrencyInputModalInfoRow;
