import React, { ReactNode, ChangeEvent, FocusEvent, FC, useCallback, useMemo, useRef, useState, memo } from 'react';
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
}

export const DEFAULT_DEBOUNCE_INTERVAL = 300;
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
  } = props;
  const [focused, setFocused] = useState<boolean>(false);
  const time = useRef<NodeJS.Timeout>();
  const id = useMemo(() => `text-input-${idCounter++}`, []);

  const debounceInterval: number = useMemo(() => {
    if (!debounce) {
      return 0;
    }
    if (debounce && debounce === true) {
      return DEFAULT_DEBOUNCE_INTERVAL;
    }
    return debounce as number;
  }, [debounce]);

  const handleChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      if (!pattern || !ev.target.validity.patternMismatch) {
        const elementValue = ev.currentTarget.value;
        if (debounceInterval) {
          if (time.current) {
            clearTimeout(time.current);
          }
          time.current = setTimeout(() => {
            onChange?.(elementValue);
            time.current = undefined;
          }, debounceInterval);
        } else {
          onChange?.(elementValue);
        }
      }
    },
    [pattern, debounceInterval, onChange],
  );

  const handleFocus = useCallback(() => setFocused(true), []);

  const handleBlur = useCallback(
    (ev: FocusEvent<HTMLInputElement>) => {
      const elementValue = ev.currentTarget.value;
      if (time.current) {
        clearTimeout(time.current);
        time.current = undefined;
      }
      setFocused(false);
      onChange?.(elementValue);
    },
    [onChange],
  );

  return (
    <div
      className={`tc__text-input ${
        disabled
          ? 'tc__text-input__disabled'
          : error
          ? 'tc__text-input__error'
          : focused
          ? 'tc__text-input__focused'
          : ''
      }`}
    >
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
          <input
            id={id}
            type="text"
            value={value}
            placeholder={placeholder}
            pattern={pattern}
            disabled={disabled}
            onChange={handleChange}
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
