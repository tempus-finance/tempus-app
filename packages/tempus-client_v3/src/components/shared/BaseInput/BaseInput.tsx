import React, { ChangeEvent, FocusEvent, FC, ReactNode, useCallback, useMemo, useRef } from 'react';

export interface BaseInputProps {
  id?: string;
  value?: string;
  placeholder?: string;
  pattern?: string;
  disabled?: boolean;
  debounce?: boolean | number;
  onChange?: (value: string) => void;
  onFocus?: (ev: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (ev: FocusEvent<HTMLInputElement>) => void;
}

export const DEFAULT_DEBOUNCE_INTERVAL = 300;

const BaseInput: FC<BaseInputProps> = props => {
  const { id, value, placeholder, pattern, disabled, debounce = false, onChange, onFocus, onBlur } = props;
  const time = useRef<NodeJS.Timeout>();

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
        const { value } = ev.currentTarget;
        if (debounceInterval) {
          if (time.current) {
            clearTimeout(time.current);
          }
          time.current = setTimeout(() => {
            onChange?.(value);
            time.current = undefined;
          }, debounceInterval);
        } else {
          onChange?.(value);
        }
      }
    },
    [pattern, debounceInterval, onChange],
  );

  const handleBlur = useCallback(
    (ev: FocusEvent<HTMLInputElement>) => {
      const { value } = ev.currentTarget;
      if (time.current) {
        clearTimeout(time.current);
        time.current = undefined;
      }
      onChange?.(value);
      onBlur?.(ev);
    },
    [onChange, onBlur],
  );

  return (
    <input
      className="tc__base-input"
      id={id}
      type="text"
      value={value}
      placeholder={placeholder}
      pattern={pattern}
      disabled={disabled}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={handleBlur}
    />
  );
};

export default BaseInput;
