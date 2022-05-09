import { ChangeEvent, FocusEvent, FC, useCallback, useMemo, useRef } from 'react';

export interface BaseInputProps {
  id?: string;
  value?: string;
  placeholder?: string;
  pattern?: string;
  disabled?: boolean;
  debounce?: boolean | number;
  onChange?: (value: string) => void;
  onDebounceChange?: (value: string) => void;
  onFocus?: (ev: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (ev: FocusEvent<HTMLInputElement>) => void;
}

export const DEFAULT_DEBOUNCE_INTERVAL_IN_MS = 300;

const BaseInput: FC<BaseInputProps> = props => {
  const {
    id,
    value,
    placeholder,
    pattern,
    disabled,
    debounce = false,
    onChange,
    onDebounceChange,
    onFocus,
    onBlur,
  } = props;
  const time = useRef<NodeJS.Timeout>();
  const valueToBeUpdated = useRef<string>();

  const debounceInterval: number = useMemo(() => {
    if (!debounce) {
      return 0;
    }
    if (debounce === true) {
      return DEFAULT_DEBOUNCE_INTERVAL_IN_MS;
    }
    return debounce as number;
  }, [debounce]);

  const handleChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      if (!pattern || !ev.target.validity.patternMismatch) {
        valueToBeUpdated.current = ev.currentTarget.value;
        onChange?.(valueToBeUpdated.current);
        if (debounceInterval) {
          if (time.current) {
            clearTimeout(time.current);
          }
          time.current = setTimeout(() => {
            onDebounceChange?.(valueToBeUpdated.current as string);
            time.current = undefined;
            valueToBeUpdated.current = undefined;
          }, debounceInterval);
        } else {
          onDebounceChange?.(valueToBeUpdated.current);
        }
      }
    },
    [pattern, debounceInterval, onChange, onDebounceChange],
  );

  const handleBlur = useCallback(
    (ev: FocusEvent<HTMLInputElement>) => {
      if (time.current) {
        clearTimeout(time.current);
        time.current = undefined;
      }
      if (valueToBeUpdated.current !== undefined) {
        onDebounceChange?.(valueToBeUpdated.current);
      }
      onBlur?.(ev);
    },
    [onDebounceChange, onBlur],
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
