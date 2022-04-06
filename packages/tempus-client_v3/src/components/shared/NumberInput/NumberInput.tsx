import React, { FC, memo, useCallback, useMemo } from 'react';
import TextInput from '../TextInput';
import ButtonWrapper from '../ButtonWrapper';
import Typography from '../Typography';

import './NumberInput.scss';

export interface NumberInputProps {
  label?: string;
  value?: string;
  max?: number;
  placeholder?: string;
  caption?: string;
  error?: string;
  disabled?: boolean;
  debounce?: boolean | number;
  onChange?: (value: string) => void;
}

const NumberInput: FC<NumberInputProps> = props => {
  const { label, value, max, placeholder, caption, error, disabled, debounce, onChange } = props;

  const onMaxClick = useCallback(() => onChange?.(`${max}`), [max, onChange]);
  const maxButton = useMemo(
    () => (
      <ButtonWrapper disabled={disabled} onClick={onMaxClick}>
        <Typography variant="body-primary" weight="regular" color={disabled ? 'text-disabled' : undefined}>
          Max
        </Typography>
      </ButtonWrapper>
    ),
    [max, disabled, onMaxClick],
  );

  return (
    <TextInput
      label={label}
      value={value}
      placeholder={placeholder}
      pattern="[0-9,]*[.]?[0-9]*"
      caption={caption}
      error={error}
      disabled={disabled}
      debounce={debounce}
      endAdornment={maxButton}
      onChange={onChange}
    />
  );
};

export default memo(NumberInput);
