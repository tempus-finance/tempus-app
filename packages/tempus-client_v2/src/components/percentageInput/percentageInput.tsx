import { FC, useCallback, useContext, useEffect, useState } from 'react';
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
  disabledTooltip?: string;
};

type PercentageInputOutProps = {
  onChange: (currentValue: string) => void;
  onAutoClick?: () => void;
};

type PercentageInputProps = PercentageInputInProps & PercentageInputOutProps;

const PercentageInput: FC<PercentageInputProps> = ({
  defaultValue,
  placeholder,
  disabled,
  disabledTooltip,
  onChange,
  onAutoClick,
}: PercentageInputProps) => {
  const { language } = useContext(LanguageContext);

  const [value, setValue] = useState<string>('');
  const [disabledTooltipOpen, setDisabledTooltipOpen] = useState<boolean>(false);

  useEffect(() => {
    if (defaultValue || defaultValue === '') {
      setValue(formatValueToPercentage(defaultValue));
    }
  }, [defaultValue]);

  const onValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const currentValue = event.currentTarget.value;
      const parsedPercentage = formatValueToPercentage(currentValue);
      if (parsedPercentage || parsedPercentage === '') {
        setValue(parsedPercentage);
      }
      onChange && onChange(parsedPercentage);
    },
    [onChange],
  );

  const handleOnAutoClick = useCallback(() => {
    setValue('100');
    onChange && onChange('100');
  }, [onChange]);

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
        <Button disabled={disabled} onClick={handleOnAutoClick}>
          <Typography variant="card-body-text">{getText('auto', language)}</Typography>
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
