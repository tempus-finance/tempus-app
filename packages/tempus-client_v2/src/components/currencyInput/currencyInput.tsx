import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { FormControl, TextField, Button, Divider } from '@material-ui/core';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';
import { formatValueToCurrency } from './currencyParser';

import './currencyInput.scss';

type CurrencyInputInProps = {
  defaultValue: string;
  placeholder?: string;
  precision?: number;
  disabled?: boolean;
  disabledTooltip?: string;
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
  disabledTooltip,
  onChange,
  onMaxClick,
}: CurrencyInputProps) => {
  const { language } = useContext(LanguageContext);

  const [value, setValue] = useState<string>('');
  const [disabledTooltipOpen, setDisabledTooltipOpen] = useState<boolean>(false);

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

  const handleContainerClick = useCallback(() => {
    if (disabled) {
      setDisabledTooltipOpen(prevState => !prevState);
    }
  }, [disabled]);

  let containerClasses = 'tc__currencyInput-container';
  if (disabled) {
    containerClasses += ' tc__currencyInput-disabled';
  }

  return (
    <FormControl>
      <div className={containerClasses} onClick={handleContainerClick}>
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
        {disabledTooltipOpen && (
          <>
            <div className="tc__currencyInput-tooltip">
              <Typography variant="card-body-text">{disabledTooltip}</Typography>
            </div>
            <div className="tc__backdrop" />
          </>
        )}
      </div>
    </FormControl>
  );
};

export default CurrencyInput;
