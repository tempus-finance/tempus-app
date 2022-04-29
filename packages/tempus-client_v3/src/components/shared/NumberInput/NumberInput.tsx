import { FC, memo, useCallback, useMemo } from 'react';
import { Decimal, Numberish } from 'tempus-core-services';
import TextInput from '../TextInput';
import ButtonWrapper from '../ButtonWrapper';
import Typography from '../Typography';

import './NumberInput.scss';

export interface NumberInputProps {
  label?: string;
  value?: string;
  max: Numberish;
  precision?: number;
  placeholder?: string;
  caption?: string;
  error?: string;
  disabled?: boolean;
  debounce?: boolean | number;
  onChange?: (value: string) => void;
  onDebounceChange?: (value: string) => void;
}

const NumberInput: FC<NumberInputProps> = props => {
  const {
    label,
    value,
    max,
    precision = 18,
    placeholder,
    caption,
    error,
    disabled,
    debounce,
    onChange,
    onDebounceChange,
  } = props;

  const onMaxClick = useCallback(() => {
    const formattedMax = new Decimal(new Decimal(max).toTruncated(precision)).toString();
    onChange?.(formattedMax);
    onDebounceChange?.(formattedMax);
  }, [max, precision, onChange, onDebounceChange]);
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
  const pattern = useMemo(() => (precision > 0 ? `[0-9,]*[.]?[0-9]{0,${precision}}` : '[0-9,]*'), [precision]);

  return (
    <div className="tc__number-input">
      <TextInput
        label={label}
        value={value}
        placeholder={placeholder}
        pattern={pattern}
        caption={caption}
        error={error}
        disabled={disabled}
        debounce={debounce}
        endAdornment={maxButton}
        onChange={onChange}
        onDebounceChange={onDebounceChange}
      />
    </div>
  );
};

export default memo(NumberInput);