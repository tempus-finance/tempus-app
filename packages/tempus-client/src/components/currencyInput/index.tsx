import { FC, useCallback, useEffect, useState } from 'react';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import { formatValueToCurrency, parseStringToNumber } from './currencyParser';

type CurrencyInputInProps = {
  defaultValue?: number;
  placeholder?: string;
  precision?: number; // TODO: use precision, default should be 0
  disabled?: boolean;
};

type CurrencyInputOutProps = {
  onChange: (currentValue: number | undefined) => void;
};

type CurrencyInputProps = CurrencyInputInProps & CurrencyInputOutProps;

const CurrencyInput: FC<CurrencyInputProps> = ({
  defaultValue = 0,
  placeholder,
  disabled,
  onChange,
}: CurrencyInputProps) => {
  const [stringValue, setStringValue] = useState<string | undefined>(() =>
    formatValueToCurrency(defaultValue.toString()),
  );

  useEffect(() => {
    if (defaultValue !== undefined) {
      setStringValue(formatValueToCurrency(defaultValue.toString()));
    }
  }, [defaultValue, setStringValue]);

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
    <FormControl>
      <TextField
        id="standard-basic"
        type="text"
        value={stringValue}
        onChange={onValueChange}
        placeholder={placeholder}
        disabled={disabled}
        variant="outlined"
        size="small"
      />
    </FormControl>
  );
};

export default CurrencyInput;
