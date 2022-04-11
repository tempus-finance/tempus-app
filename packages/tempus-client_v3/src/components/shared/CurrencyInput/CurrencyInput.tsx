import { BigNumber, ethers } from 'ethers';
import { FC, useCallback, useMemo, useState } from 'react';
import { div18f, increasePrecision, mul18f, NumberUtils, Ticker } from 'tempus-core-services';
import BaseInput from '../BaseInput';
import Typography from '../Typography';
import CurrencySelector from './CurrencySelector';
import PercentageButton from './PercentageButton';
import './CurrencyInput.scss';

const inputPercentages = [25, 50, 75, 100];

interface CurrencyInputProps {
  precision: number;
  maxAmount: BigNumber;
  usdRates: Map<Ticker, BigNumber>;
  ratePrecision: number;
  disabled?: boolean;
  error?: string;
  onChange?: (value: string) => void;
}

const CurrencyInput: FC<CurrencyInputProps> = props => {
  const { precision, maxAmount, usdRates, ratePrecision, disabled, error, onChange } = props;
  const [amount, setAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState(NumberUtils.formatToCurrency('0', 2, '$'));
  const [selectedCurrency, setSelectedCurrency] = useState(Array.from(usdRates.keys())[0]);

  const updateUsdAmount = useCallback(
    (value: string) => {
      const rate = usdRates.get(selectedCurrency);
      let usdValue: BigNumber;

      if (!value || !rate) {
        usdValue = BigNumber.from(0);
      } else if (precision > ratePrecision) {
        usdValue = mul18f(
          ethers.utils.parseUnits(value, precision),
          increasePrecision(rate, precision - ratePrecision),
          precision,
        );
      } else {
        usdValue = mul18f(ethers.utils.parseUnits(value, precision), rate, precision);
      }

      setUsdAmount(NumberUtils.formatToCurrency(ethers.utils.formatUnits(usdValue, precision), 2, '$'));
    },
    [usdRates, selectedCurrency, precision, ratePrecision],
  );

  const handleCurrencyChange = useCallback(currency => {
    setSelectedCurrency(currency);
    setAmount('');
  }, []);

  const handleValueChange = useCallback(
    (value: string) => {
      setAmount(value);
      onChange?.(value);
    },
    [onChange],
  );

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      let value = div18f(mul18f(BigNumber.from(percentage), maxAmount, precision), BigNumber.from(100), precision);
      handleValueChange(ethers.utils.formatUnits(value, precision));
    },
    [handleValueChange, maxAmount, precision],
  );

  return (
    <div className="tc__currency-input">
      <div
        className={`tc__currency-input__field-container ${
          disabled ? 'tc__currency-input__field-container-disabled' : ''
        }`}
      >
        <CurrencySelector
          currencies={Array.from(usdRates.keys())}
          disabled={disabled}
          onChange={handleCurrencyChange}
        />
        <div
          className={`tc__currency-input__input-container ${
            disabled ? 'tc__currency-input__input-container-disabled' : ''
          }`}
        >
          <div className="tc__currency-input__amount-container">
            <Typography
              className="tc__currency-input__amount"
              variant="body-primary"
              type="mono"
              color={disabled ? 'text-disabled' : 'text-primary'}
            >
              <BaseInput
                value={amount}
                placeholder="0"
                pattern={`[0-9]*[.]?[0-9]{0,${precision}}`}
                disabled={disabled}
                debounce={true}
                onChange={handleValueChange}
                onDebounceChange={updateUsdAmount}
              />
            </Typography>
            <span className="tc__currency-input__fiat-amount">
              <Typography
                variant="body-primary"
                weight="medium"
                type="mono"
                color={!disabled && amount ? 'text-secondary' : 'text-disabled'}
              >
                {usdAmount}
              </Typography>
              <Typography
                className="tc__currency-input__fiat-amount-currency"
                variant="body-primary"
                weight="medium"
                color={!disabled && amount ? 'text-secondary' : 'text-disabled'}
              >
                USD
              </Typography>
            </span>
          </div>
          {error && (
            <Typography
              className="tc__currency-input__error"
              variant="body-secondary"
              weight="medium"
              color="text-error"
            >
              {error}
            </Typography>
          )}
        </div>
      </div>
      <div className="tc__currency-input__percentage-buttons">
        {inputPercentages.map(percentage => (
          <PercentageButton
            percentage={percentage}
            disabled={disabled}
            onClick={handlePercentageClick}
            key={`percentage-button-${percentage}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CurrencyInput;
