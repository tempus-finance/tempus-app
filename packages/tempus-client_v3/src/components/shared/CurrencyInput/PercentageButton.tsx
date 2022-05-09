import { FC, useCallback } from 'react';
import { NumberUtils } from 'tempus-core-services';
import ActionButton from '../ActionButton';

interface PercentageButtonProps {
  percentage: number;
  disabled?: boolean;
  onClick?: (percentage: number) => void;
}

const PercentageButton: FC<PercentageButtonProps> = props => {
  const { percentage, disabled, onClick } = props;
  const onButtonClick = useCallback(() => onClick?.(percentage), [percentage, onClick]);

  return (
    <ActionButton
      labels={{ default: NumberUtils.formatPercentage(percentage / 100), loading: '', success: '' }}
      onClick={onButtonClick}
      variant="secondary"
      size="small"
      state={disabled ? 'disabled' : 'default'}
    />
  );
};

export default PercentageButton;
