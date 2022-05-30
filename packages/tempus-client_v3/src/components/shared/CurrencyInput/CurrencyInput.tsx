import { FC, useCallback, useState } from 'react';
import { Ticker, Decimal, DecimalUtils } from 'tempus-core-services';
import BaseInput from '../BaseInput';
import Loading from '../Loading';
import Typography from '../Typography';
import CurrencySelector from './CurrencySelector';
import PercentageButton from './PercentageButton';
import './CurrencyInput.scss';

const inputPercentages = [25, 50, 75, 100];

export interface CurrencyInputProps {
  maxAmount: Decimal;
  tokens: {
    precision: number;
    ticker: Ticker;
    rate: Decimal;
  }[];
  disabled?: boolean;
  error?: string;
  onAmountUpdate?: (value: string) => void;
  onCurrencyUpdate?: (currency: Ticker) => void;
}

const CurrencyInput: FC<CurrencyInputProps> = props => {
  const { tokens, maxAmount, disabled, error, onAmountUpdate, onCurrencyUpdate } = props;
  const [amount, setAmount] = useState<string>('');
  const [usdAmount, setUsdAmount] = useState<string>(DecimalUtils.formatToCurrency(0, 2, '$'));
  const [selectedToken, setSelectedToken] = useState(tokens[0]);

  const updateUsdAmount = useCallback(
    (value: string) => {
      const usdValue =
        !value || !selectedToken.rate || value === '.' ? new Decimal(0) : new Decimal(value).mul(selectedToken.rate);

      setUsdAmount(DecimalUtils.formatToCurrency(usdValue, 2, '$'));
    },
    [selectedToken],
  );

  const handleValueChange = useCallback((value: string) => {
    setAmount(value);
    setUsdAmount('');
  }, []);

  const handleDebounceValueChange = useCallback(
    (value: string) => {
      updateUsdAmount(value);
      onAmountUpdate?.(value);
    },
    [onAmountUpdate, updateUsdAmount],
  );

  const handleCurrencyChange = useCallback(
    (currency: Ticker) => {
      const result = tokens.find(token => token.ticker === currency);
      if (result) {
        setSelectedToken(result);
        onCurrencyUpdate?.(currency);
        handleValueChange('');
        handleDebounceValueChange('');
      }
    },
    [handleDebounceValueChange, handleValueChange, onCurrencyUpdate, tokens],
  );

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      const value = new Decimal(percentage).mul(maxAmount).div(100);
      const formattedValue = new Decimal(value.toTruncated(selectedToken.precision)).toString();

      handleValueChange(formattedValue);
      handleDebounceValueChange(formattedValue);
    },
    [selectedToken, handleDebounceValueChange, handleValueChange, maxAmount],
  );

  return (
    <div className="tc__currency-input">
      <div
        className={`tc__currency-input__field-container ${
          disabled ? 'tc__currency-input__field-container-disabled' : ''
        }`}
      >
        <CurrencySelector
          currencies={tokens.map(token => token.ticker)}
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
                pattern={`[0-9]*[.]?[0-9]{0,${selectedToken.precision}}`}
                disabled={disabled}
                debounce
                onChange={handleValueChange}
                onDebounceChange={handleDebounceValueChange}
              />
            </Typography>
            {usdAmount && (
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
            )}
            {!usdAmount && <Loading color="primary" />}
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
