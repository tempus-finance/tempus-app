import { FC, memo } from 'react';
import { colors } from '../Color';

import './ActionButton.scss';

type ButtonSize = 'small' | 'large';
type ButtonColor = 'default' | 'primary' | 'secondary';

const buttonColorsMap = new Map<ButtonColor, string>();
buttonColorsMap.set('default', colors.buttonDefault);
buttonColorsMap.set('primary', colors.primaryMain);
buttonColorsMap.set('secondary', colors.secondaryRegular);

const buttonSizeMap = new Map<ButtonSize, string>();
buttonSizeMap.set('small', '32px');
buttonSizeMap.set('large', '40px');

interface ButtonProps {
  color?: ButtonColor;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: FC<ButtonProps> = props => {
  const { color = 'default', size = 'small', disabled = false, fullWidth = false, onClick, children } = props;

  return (
    <button
      className="tc__actionButton"
      disabled={disabled}
      onClick={onClick}
      style={{
        backgroundColor: buttonColorsMap.get(color),
        height: buttonSizeMap.get(size),
        width: fullWidth ? '100%' : '',
        border: color === 'default' ? `1px solid ${colors.buttonBorder}` : 'none',
      }}
    >
      {children}
    </button>
  );
};

export default memo(Button);
