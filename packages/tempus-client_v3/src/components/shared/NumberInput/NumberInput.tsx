import React, { FC, memo, useCallback, useMemo } from 'react';
import { BigNumber, utils } from 'ethers';
import TextInput from '../TextInput';
import ButtonWrapper from '../ButtonWrapper';
import Typography from '../Typography';

import './NumberInput.scss';

export interface NumberInputProps {
  label?: string;
  value?: string;
  max: number | string | BigNumber;
  precision?: number;
  placeholder?: string;
  caption?: string;
  error?: string;
  disabled?: boolean;
  debounce?: boolean | number;
  onChange?: (value: string) => void;
}

const NumberInput: FC<NumberInputProps> = props => {
  const { label, value, max, precision = 18, placeholder, caption, error, disabled, debounce, onChange } = props;

  const onMaxClick = useCallback(() => onChange?.(utils.formatUnits(max, precision)), [max, precision, onChange]);
  const maxButton = useMemo(
    () => (
      <ButtonWrapper disabled={disabled} onClick={onMaxClick}>
        <Typography variant="body-primary" weight="regular" color={disabled ? 'text-disabled' : undefined}>
          Max
        </Typography>
      </ButtonWrapper>
    ),
    [disabled, onMaxClick],
  );

  return (
    <div className="tc__number-input">
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
    </div>
  );
};

export default memo(NumberInput);
