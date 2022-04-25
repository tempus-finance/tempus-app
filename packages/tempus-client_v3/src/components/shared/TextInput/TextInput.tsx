import { ReactNode, FC, useCallback, useMemo, useState, memo } from 'react';
import BaseInput from '../BaseInput';
import Typography from '../Typography';
import '../Shadow';

import './TextInput.scss';

export interface TextInputProps {
  label?: string;
  value?: string;
  placeholder?: string;
  pattern?: string;
  caption?: string;
  error?: string;
  disabled?: boolean;
  debounce?: boolean | number;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onDebounceChange?: (value: string) => void;
}

let idCounter = 0;

const TextInput: FC<TextInputProps> = props => {
  const {
    label,
    value,
    placeholder,
    pattern,
    caption,
    error,
    disabled,
    debounce = false,
    startAdornment,
    endAdornment,
    onChange,
    onFocus,
    onBlur,
    onDebounceChange,
  } = props;
  const [focused, setFocused] = useState<boolean>(false);
  const id = useMemo(() => {
    idCounter += 1;
    return `text-input-${idCounter}`;
  }, []);

  const handleFocus = useCallback(() => {
    setFocused(true);
    onFocus?.();
  }, [onFocus]);
  const handleBlur = useCallback(() => {
    setFocused(false);
    onBlur?.();
  }, [onBlur]);

  let stateClass = '';
  if (disabled) {
    stateClass = 'tc__text-input__disabled';
  } else if (error) {
    stateClass = 'tc__text-input__error';
  } else if (focused) {
    stateClass = 'tc__text-input__focused';
  }

  return (
    <div className={`tc__text-input ${stateClass}`}>
      {label && (
        <label htmlFor={id}>
          <Typography variant="body-secondary" weight="bold">
            {label}
          </Typography>
        </label>
      )}
      <div className="tc__text-input__container">
        {startAdornment}
        <Typography variant="body-primary" weight="regular" color={disabled ? 'text-disabled' : undefined}>
          <BaseInput
            id={id}
            value={value}
            placeholder={placeholder}
            pattern={pattern}
            debounce={debounce}
            disabled={disabled}
            onChange={onChange}
            onDebounceChange={onDebounceChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </Typography>
        {endAdornment}
      </div>
      {caption && !error && (
        <Typography variant="body-secondary" weight="medium" color={focused ? 'text-caption' : undefined}>
          {caption}
        </Typography>
      )}
      {error && (
        <Typography variant="body-secondary" weight="medium" color="text-error">
          {error}
        </Typography>
      )}
    </div>
  );
};

export default memo(TextInput);
