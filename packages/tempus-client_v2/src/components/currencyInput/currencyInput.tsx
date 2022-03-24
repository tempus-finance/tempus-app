import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { FormControl, TextField, Button, Divider } from '@material-ui/core';
import { LocaleContext } from '../../context/localeContext';
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
  const { locale } = useContext(LocaleContext);

  const [value, setValue] = useState<string>('');
  const [time, setTime] = useState<NodeJS.Timeout>();

  useEffect(() => {
    if (defaultValue || defaultValue === '') {
      setValue(formatValueToCurrency(defaultValue, precision));
    }
  }, [defaultValue, precision]);

  const delayedChange = useCallback(
    value => onChange && onChange(value.replace(/[^0-9$.]/g, '')),
    [precision, onChange],
  );

  const onValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.validity.patternMismatch) {
        const parsedCurrency = formatValueToCurrency(event.currentTarget.value, precision);
        if (parsedCurrency || parsedCurrency === '') {
          setValue(parsedCurrency);
        }
        if (time) {
          clearTimeout(time);
        }
        setTime(
          setTimeout(() => {
            delayedChange(parsedCurrency);
            setTime(undefined);
          }, 300),
        );
      }
    },
    [delayedChange, time],
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

  return (
    <FormControl>
      <InfoTooltip content={disabledTooltip} arrowEnabled={false} disabled={!disabled}>
        <div className={containerClasses}>
          <TextField
            type="text"
            value={value}
            onChange={onValueChange}
            placeholder={placeholder}
            disabled={disabled}
            variant="standard"
            autoComplete="off"
            inputProps={{
              pattern: '[0-9,]*[.]?[0-9]*',
            }}
            InputProps={{
              disableUnderline: true,
            }}
          />
          <Divider orientation="vertical" />
          <Button disabled={disabled || maxDisabled} onClick={handleMaxClick}>
            {getText('max', locale)}
          </Button>
        </div>
      </InfoTooltip>
    </FormControl>
  );
};

export default CurrencyInput;
