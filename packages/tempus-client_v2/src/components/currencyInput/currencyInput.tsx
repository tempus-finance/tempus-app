import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { FormControl, TextField, Button, Divider } from '@material-ui/core';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import { formatValueToCurrency } from './currencyParser';

import './currencyInput.scss';

type CurrencyInputInProps = {
  defaultValue: string;
  placeholder?: string;
  precision?: number;
  disabled?: boolean;
};

type CurrencyInputOutProps = {
  onChange: (currentValue: string) => void;
  onMaxClick?: () => void;
};

type CurrencyInputProps = CurrencyInputInProps & CurrencyInputOutProps;

const currencyPrecision = 8;

const CurrencyInput: FC<CurrencyInputProps> = ({
  defaultValue,
  placeholder,
  disabled,
  onChange,
  onMaxClick,
}: CurrencyInputProps) => {
  const { language } = useContext(LanguageContext);
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (defaultValue || defaultValue === '') {
      setValue(formatValueToCurrency(defaultValue, currencyPrecision));
    }
  }, [defaultValue]);

  const onValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const currentValue = event.currentTarget.value;
      const parsedCurrency = formatValueToCurrency(currentValue, currencyPrecision);
      if (parsedCurrency || parsedCurrency === '') {
        setValue(parsedCurrency);
      }
      onChange && onChange(parsedCurrency.replace(/[^0-9$.]/g, ''));
    },
    [onChange],
  );

  const handleMaxClick = useCallback(() => {
    if (onMaxClick) {
      onMaxClick();
    }
  }, [onMaxClick]);

  return (
    <FormControl>
      <div className="tc__currencyInput-container">
        <TextField
          type="text"
          value={value}
          onChange={onValueChange}
          placeholder={placeholder}
          disabled={disabled}
          variant="standard"
          autoComplete="off"
          InputProps={{
            disableUnderline: true,
          }}
        />
        <Divider orientation="vertical" />
        <Button disabled={disabled} onClick={handleMaxClick}>
          {getText('max', language)}
        </Button>
      </div>
    </FormControl>
  );
};

export default CurrencyInput;
