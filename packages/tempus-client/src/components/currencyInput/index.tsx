import { FC, useCallback, useState } from 'react';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import { formatValueToCurrency, parseStringToNumber } from './currencyParser';

import './currencyInput.scss';

type CurrencyInputInProps = {
  defaultValue?: number;
  placeholder?: string;
  precision?: number;
};

type CurrencyInputOutProps = {
  onChange: (currentValue: number | undefined) => void;
};

type CurrencyInputProps = CurrencyInputInProps & CurrencyInputOutProps;

const CurrencyInput: FC<CurrencyInputProps> = ({ defaultValue = 0, placeholder, onChange }: CurrencyInputProps) => {
  const [stringValue, setStringValue] = useState<string | undefined>(() =>
    formatValueToCurrency(defaultValue.toString()),
  );

  const onValueChange = useCallback(
    (event: any) => {
      const currentValue = event.currentTarget.value;
      const parsedCurrency = formatValueToCurrency(currentValue);
      if (parsedCurrency !== undefined) {
        setStringValue(parsedCurrency);
      }
      onChange && onChange(parseStringToNumber(currentValue));
    },
    [setStringValue, onChange],
  );

  return (
    <div className="tf__currency-input">
      <div className="amount">
        <FormControl>
          <TextField
            id="standard-basic"
            type="text"
            value={stringValue}
            onChange={onValueChange}
            placeholder={placeholder}
          />
        </FormControl>
      </div>
    </div>
  );
};

export default CurrencyInput;
