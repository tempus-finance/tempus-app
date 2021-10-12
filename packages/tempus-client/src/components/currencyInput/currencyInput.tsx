import { FC, useCallback, useEffect, useState } from 'react';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import { formatValueToCurrency } from './currencyParser';

type CurrencyInputInProps = {
  defaultValue: string;
  placeholder?: string;
  precision?: number;
  disabled?: boolean;
};

type CurrencyInputOutProps = {
  onChange: (currentValue: string) => void;
};

type CurrencyInputProps = CurrencyInputInProps & CurrencyInputOutProps;

const CurrencyInput: FC<CurrencyInputProps> = ({
  defaultValue,
  placeholder,
  disabled,
  onChange,
}: CurrencyInputProps) => {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (defaultValue || defaultValue === '') {
      setValue(formatValueToCurrency(defaultValue));
    }
  }, [defaultValue]);

  const onValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const currentValue = event.currentTarget.value;
      const parsedCurrency = formatValueToCurrency(currentValue);
      if (parsedCurrency || parsedCurrency === '') {
        setValue(parsedCurrency);
      }
      onChange && onChange(parsedCurrency.replace(/[^0-9$.]/g, ''));
    },
    [onChange],
  );

  return (
    <FormControl>
      <TextField
        type="text"
        value={value}
        onChange={onValueChange}
        placeholder={placeholder}
        disabled={disabled}
        variant="outlined"
        size="small"
        autoComplete="off"
      />
    </FormControl>
  );
};

export default CurrencyInput;
