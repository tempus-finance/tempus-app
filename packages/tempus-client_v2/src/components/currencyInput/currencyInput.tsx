import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { FormControl, TextField, Button, Divider } from '@material-ui/core';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import InfoTooltip from '../infoTooltip/infoTooltip';
import { formatValueToCurrency } from './currencyParser';

import './currencyInput.scss';

type CurrencyInputInProps = {
  defaultValue: string;
  precision: number;
  placeholder?: string;
  disabled?: boolean;
  maxDisabled?: boolean;
  disabledTooltip?: string;
};

type CurrencyInputOutProps = {
  onChange: (currentValue: string) => void;
  onMaxClick?: () => void;
};

type CurrencyInputProps = CurrencyInputInProps & CurrencyInputOutProps;

const CurrencyInput: FC<CurrencyInputProps> = ({
  defaultValue,
  placeholder,
  precision,
  disabled,
  maxDisabled,
  disabledTooltip,
  onChange,
  onMaxClick,
}: CurrencyInputProps) => {
  const { language } = useContext(LanguageContext);

  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (defaultValue || defaultValue === '') {
      setValue(formatValueToCurrency(defaultValue, precision));
    }
  }, [defaultValue, precision]);

  const onValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.validity.patternMismatch) {
        const currentValue = event.currentTarget.value;
        const parsedCurrency = formatValueToCurrency(currentValue, precision);
        if (parsedCurrency || parsedCurrency === '') {
          setValue(parsedCurrency);
        }
        onChange && onChange(parsedCurrency.replace(/[^0-9$.]/g, ''));
      }
    },
    [precision, onChange],
  );

  const handleMaxClick = useCallback(() => {
    if (onMaxClick && !maxDisabled) {
      onMaxClick();
    }
  }, [maxDisabled, onMaxClick]);

  let containerClasses = 'tc__currencyInput-container';
  if (disabled) {
    containerClasses += ' tc__currencyInput-disabled';
  }

  if (disabled) {
    return (
      <FormControl>
        <InfoTooltip content={disabledTooltip} arrowEnabled={false}>
          <div className={containerClasses}>
            <TextField
              type="text"
              value={value}
              onChange={onValueChange}
              placeholder={placeholder}
              disabled
              variant="standard"
              autoComplete="off"
              inputProps={{
                pattern: '[0-9]*[.]?[0-9]*',
              }}
              InputProps={{
                disableUnderline: true,
              }}
            />
            <Divider orientation="vertical" />
            <Button disabled onClick={handleMaxClick}>
              {getText('max', language)}
            </Button>
          </div>
        </InfoTooltip>
      </FormControl>
    );
  }

  return (
    <FormControl>
      <div className={containerClasses}>
        <TextField
          type="text"
          value={value}
          onChange={onValueChange}
          placeholder={placeholder}
          variant="standard"
          autoComplete="off"
          inputProps={{
            pattern: '[0-9]*[.]?[0-9]*',
          }}
          InputProps={{
            disableUnderline: true,
          }}
        />
        <Divider orientation="vertical" />
        <Button disabled={disabled || maxDisabled} onClick={handleMaxClick}>
          {getText('max', language)}
        </Button>
      </div>
    </FormControl>
  );
};

export default CurrencyInput;
