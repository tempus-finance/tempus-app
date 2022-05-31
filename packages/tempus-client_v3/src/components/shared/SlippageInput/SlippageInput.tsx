import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Decimal, DecimalUtils } from 'tempus-core-services';
import ButtonWrapper from '../ButtonWrapper';
import TextInput from '../TextInput';
import Typography, { TypographyColor } from '../Typography';

import './SlippageInput.scss';

export interface SlippageInputProps {
  percentage: Decimal;
  isAuto: boolean;
  error?: string;
  disabled?: boolean;
  onPercentageUpdate?: (value: Decimal) => void;
  onAutoUpdate?: (value: boolean) => void;
}

const SlippageInput: FC<SlippageInputProps> = props => {
  const { percentage, isAuto, error, disabled, onPercentageUpdate, onAutoUpdate } = props;
  const [placeholder, setPlaceholder] = useState<string>(DecimalUtils.formatPercentage(percentage, 2));
  const [value, setValue] = useState<string>('');
  const [focused, setFocused] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => setPlaceholder(DecimalUtils.formatPercentage(percentage, 2)), [percentage]);

  const handleTextboxFocus = useCallback(() => setFocused(true), []);
  const handleTextboxBlur = useCallback(() => setFocused(false), []);
  const handleAutoClick = useCallback(() => {
    onAutoUpdate?.(true);
  }, [onAutoUpdate]);
  const handleDebounceChange = useCallback(
    (inputValue: string) => {
      let resolvedValue = Decimal.parse(inputValue, 0).div(100);

      if (resolvedValue.gt(1)) {
        resolvedValue = new Decimal(1);
      }

      onPercentageUpdate?.(resolvedValue);
      onAutoUpdate?.(false);
    },
    [onPercentageUpdate, onAutoUpdate],
  );

  const autoButton = useMemo(() => {
    let color: TypographyColor | undefined;
    if (disabled) {
      color = 'text-disabled';
    } else if (isAuto) {
      color = 'text-primary-inverted';
    }

    return (
      <ButtonWrapper selected={isAuto} disabled={disabled} onClick={handleAutoClick}>
        <Typography variant="body-primary" weight="regular" color={color}>
          {t('SlippageInput.buttonAuto')}
        </Typography>
      </ButtonWrapper>
    );
  }, [isAuto, disabled, handleAutoClick, t]);

  return (
    <div className="tc__slippage-input">
      <TextInput
        placeholder={placeholder}
        value={focused ? value : ''}
        pattern="[0-9,]*[.]?[0-9]{0,2}"
        inputType="number"
        debounce
        error={error}
        disabled={disabled}
        endAdornment={autoButton}
        onChange={setValue}
        onFocus={handleTextboxFocus}
        onBlur={handleTextboxBlur}
        onDebounceChange={handleDebounceChange}
      />
    </div>
  );
};

export default SlippageInput;
