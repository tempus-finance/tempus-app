import { FC, useCallback, useState } from 'react';
import { Ticker } from 'tempus-core-services';
import Icon from '../Icon';
import CurrencySelectorItem from './CurrencySelectorItem';

export interface CurrencySelectorProps {
  currencies: Ticker | Ticker[];
  disabled?: boolean;
  onChange?: (selectedCurrency: Ticker) => void;
}

const CurrencySelector: FC<CurrencySelectorProps> = props => {
  const { currencies, disabled, onChange } = props;
  const hasMultipleCurrencies = currencies.constructor === Array && currencies.length > 1;

  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0] as Ticker);
  const [dropdownOpened, setDropdownOpened] = useState(false);

  const handleSelectorClick = useCallback(() => setDropdownOpened(true), []);

  const handleSelectorItemClick = useCallback(
    (currency: Ticker) => {
      if (selectedCurrency !== currency) {
        onChange?.(currency);
      }

      setSelectedCurrency(currency);
      setDropdownOpened(false);
    },
    [onChange, selectedCurrency],
  );

  return (
    <div
      className={`tc__currency-input__currency-selector ${
        hasMultipleCurrencies ? 'tc__currency-input__currency-selector-multiple-choice' : ''
      } ${disabled ? 'tc__currency-input__currency-selector-disabled' : ''}`}
    >
      <CurrencySelectorItem
        currency={selectedCurrency}
        disabled={disabled}
        icon={hasMultipleCurrencies && <Icon variant="down-chevron" size="small" />}
        onClick={handleSelectorClick}
      />
      {hasMultipleCurrencies && dropdownOpened && (
        <div className="tc__currency-input__currency-selector-dropdown">
          {currencies.map((currency, index) => (
            <CurrencySelectorItem
              currency={currency}
              disabled={disabled}
              icon={index === 0 && <Icon variant="up-chevron" size="small" />}
              onClick={handleSelectorItemClick}
              key={currency}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
