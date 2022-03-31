import { FC, memo } from 'react';
import { colors } from '../Color';
import CheckmarkSolid from '../Icon/CheckmarkSolid';
import Loading from '../Loading';
import { LoadingColor } from '../Loading/Loading';
import Typography from '../Typography';
import { TypographyColor, TypographyWeight } from '../Typography/Typography';

import './ActionButton.scss';

type ButtonSize = 'small' | 'large';
type ButtonColor = 'default' | 'primary' | 'secondary';
type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
type ButtonState = 'default' | 'disabled' | 'loading' | 'success';
type ButtonLabels = {
  default: string;
  loading: string;
  success: string;
};

const buttonColorsMap = new Map<ButtonColor, string>();
buttonColorsMap.set('default', colors.buttonDefault);
buttonColorsMap.set('primary', colors.primaryMain);
buttonColorsMap.set('secondary', colors.secondaryRegular);

const buttonSizeMap = new Map<ButtonSize, string>();
buttonSizeMap.set('small', '32px');
buttonSizeMap.set('large', '40px');

interface ButtonProps {
  labels: ButtonLabels;
  variant?: ButtonVariant;
  state?: ButtonState;
  size?: ButtonSize;
  fullWidth?: boolean;
  onClick?: () => void;
}

const Button: FC<ButtonProps> = props => {
  const { labels, variant = 'primary', size = 'small', state = 'default', fullWidth = false, onClick } = props;

  // Border CSS class
  let borderClass = `tc__actionButton-border-${variant}-${size}`;
  switch (state) {
    case 'disabled':
      borderClass += '-disabled';
      break;
    case 'success':
      borderClass += '-success';
      break;
  }

  // Background CSS class
  let backgroundClass = `tc__actionButton-background-${variant}-${size}`;
  switch (state) {
    case 'disabled':
      backgroundClass += '-disabled';
      break;
    case 'loading':
      backgroundClass += '-loading';
      break;
    case 'success':
      backgroundClass += '-success';
      break;
  }

  // Hover CSS class
  let hoverClass = `tc__actionButton-hover-${variant}-${size}`;
  switch (state) {
    case 'disabled':
      hoverClass += '-disabled';
      break;
    case 'loading':
      hoverClass += '-loading';
      break;
    case 'success':
      hoverClass += '-success';
      break;
  }

  // Text color
  let textColor: TypographyColor = 'text-primary';
  switch (variant) {
    case 'primary':
      textColor = 'text-inverted';
      break;
  }
  switch (state) {
    case 'success':
      textColor = 'text-success';
  }
  if (variant === 'secondary' && state === 'disabled') {
    textColor = 'text-disabled';
  }
  if (variant === 'secondary' && state === 'loading') {
    textColor = 'text-disabled-secondary';
  }
  if (variant === 'tertiary' && (state === 'disabled' || state === 'loading')) {
    textColor = 'text-disabled-secondary';
  }

  // Text opacity
  let textOpacity: number = 1;
  if (variant === 'primary' && state === 'disabled') {
    textOpacity = 0.5;
  }

  // Text weight
  let textWeight: TypographyWeight = 'bold';
  switch (state) {
    case 'disabled':
      textWeight = 'regular';
      break;
    case 'loading':
      textWeight = 'medium';
      break;
  }

  // Loader color
  let loaderColor: LoadingColor = 'default';
  if ((variant === 'secondary' || variant === 'tertiary') && state === 'loading') {
    loaderColor = 'secondary';
  }

  return (
    <button
      className={`tc__actionButton ${borderClass} ${backgroundClass} ${hoverClass}`}
      disabled={state === 'disabled'}
      onClick={onClick}
      style={{
        height: buttonSizeMap.get(size),
        width: fullWidth ? '100%' : '',
      }}
    >
      {state === 'loading' && (
        <div className={`tc__actionButton-status-content-${size}`}>
          <Loading size={size === 'small' ? 12 : 20} color={loaderColor} />
        </div>
      )}
      {state === 'success' && (
        <div className={`tc__actionButton-status-content-${size}`}>
          <CheckmarkSolid size={size === 'small' ? 12 : 20} />
        </div>
      )}
      <div className="tc__actionButton-status-label">
        <Typography
          variant={size === 'large' ? 'body-primary' : 'body-secondary'}
          weight={textWeight}
          color={textColor}
          opacity={textOpacity}
        >
          {(state === 'default' || state === 'disabled') && labels.default}
          {state === 'loading' && labels.loading}
          {state === 'success' && labels.success}
        </Typography>
      </div>
    </button>
  );
};

export default memo(Button);
