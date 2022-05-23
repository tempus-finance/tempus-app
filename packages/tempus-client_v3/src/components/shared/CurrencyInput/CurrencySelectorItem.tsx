import { FC, ReactNode, useCallback } from 'react';
import { Ticker } from 'tempus-core-services';
import ButtonWrapper from '../ButtonWrapper';
import Logo, { LogoType } from '../Logo';
import Typography from '../Typography';

export interface CurrencySelectorItemProps {
  currency: Ticker;
  disabled?: boolean;
  icon?: ReactNode;
  onClick?: (currency: Ticker) => void;
}

const CurrencySelectorItem: FC<CurrencySelectorItemProps> = props => {
  const { currency, disabled, icon, onClick } = props;
  const onItemClick = useCallback(() => onClick?.(currency), [currency, onClick]);

  return (
    <ButtonWrapper
      className={`tc__currency-input__currency-selector-item ${
        disabled ? 'tc__currency-input__currency-selector-item-disabled' : ''
      }`}
      onClick={onItemClick}
      disabled={disabled}
    >
      <span className="tc__currency-input__currency-selector-item-content">
        <Logo type={`token-${currency}` as LogoType} size="large" />
        <Typography
          className="tc__currency-input__currency-selector-item-label"
          variant="body-primary"
          weight="medium"
          color={disabled ? 'text-disabled' : 'text-primary'}
        >
          {currency}
        </Typography>
      </span>
      {icon}
    </ButtonWrapper>
  );
};

export default CurrencySelectorItem;
