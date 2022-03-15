import { FC, MouseEvent, useCallback, useContext, useEffect, useState } from 'react';
import { FormControl, TextField, Button, Divider } from '@material-ui/core';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';
import { formatValueToPercentage } from './percentageParser';

import './percentageInput.scss';

type PercentageInputInProps = {
  defaultValue: string;
  placeholder?: string;
  precision?: number;
  disabled?: boolean;
  autoOn?: boolean;
  disabledTooltip?: string;
};

type PercentageInputOutProps = {
  onChange: (currentValue: string) => void;
  onInputClick: () => void;
  onAutoClick: () => void;
};

type PercentageInputProps = PercentageInputInProps & PercentageInputOutProps;

const PercentageInput: FC<PercentageInputProps> = ({
  defaultValue,
  placeholder,
  disabled,
  autoOn,
  disabledTooltip,
  onChange,
  onInputClick,
  onAutoClick,
}: PercentageInputProps) => {
  const { language } = useContext(LanguageContext);

  const [parsedValue, setParsedValue] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [disabledTooltipOpen, setDisabledTooltipOpen] = useState<boolean>(false);

  useEffect(() => {
    if (defaultValue || defaultValue === '') {
      if (defaultValue === '') {
        setValue(formatValueToPercentage(defaultValue));
      } else {
        setValue(`${formatValueToPercentage(defaultValue)}%`);
      }
      setParsedValue(formatValueToPercentage(defaultValue));
    }
  }, [defaultValue]);

  const onValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.validity.patternMismatch) {
        const currentValue = event.currentTarget.value;
        let formattedValue = '';
        if (currentValue !== '' && value.length > 0 && value[value.length - 1] === '%') {
          formattedValue = formatValueToPercentage(currentValue.slice(0, -1));
        } else {
          formattedValue = currentValue;
        }
        setParsedValue(formattedValue);
        setValue(formattedValue);
      }
    },
    [value],
  );

  const onFocus = useCallback(() => {
    if (value !== '' && value.length > 0 && value[value.length - 1] === '%') {
      setValue(value.slice(0, -1));
    } else {
      setValue(value);
    }
  }, [value]);

  const onBlur = useCallback(() => {
    if (parsedValue || parsedValue === '') {
      if (parsedValue === '') {
        setValue(parsedValue);
      } else {
        setValue(`${parsedValue}%`);
      }
      onChange && onChange(parsedValue);
    }
  }, [parsedValue, onChange]);

  const handleOnAutoClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onAutoClick && onAutoClick();
    },
    [onAutoClick],
  );

  const handleOnTextFieldClick = useCallback(
    (event: MouseEvent<HTMLInputElement>) => {
      event.stopPropagation();
      onInputClick && onInputClick();
    },
    [onInputClick],
  );

  const handleContainerClick = useCallback(() => {
    if (disabled) {
      setDisabledTooltipOpen(prevState => !prevState);
    }
  }, [disabled]);

  let containerClasses = 'tc__percentage-input-container';
  if (disabled) {
    containerClasses += ' tc__percentage-input-disabled';
  }

  return (
    <FormControl>
      <div className={containerClasses} onClick={handleContainerClick}>
        <TextField
          type="text"
          value={value}
          onClick={handleOnTextFieldClick}
          onChange={onValueChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          variant="standard"
          autoComplete="off"
          inputProps={{
            pattern: '[0-9]*[.]?[0-9]{0,2}',
          }}
          InputProps={{
            disableUnderline: true,
          }}
        />
        <Divider orientation="vertical" />
        <Button color={autoOn ? 'primary' : 'secondary'} onClick={handleOnAutoClick}>
          <Typography variant="card-body-text" color={autoOn ? 'inverted' : 'default'}>
            {getText('auto', language)}
          </Typography>
        </Button>
        {disabledTooltipOpen && (
          <>
            <div className="tc__percentage-input-tooltip">
              <Typography variant="card-body-text">{disabledTooltip}</Typography>
            </div>
            <div className="tc__backdrop" />
          </>
        )}
      </div>
    </FormControl>
  );
};

export default PercentageInput;
