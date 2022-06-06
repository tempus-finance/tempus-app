import { FC, memo } from 'react';
import Button from '../ButtonWrapper';
import Icon from '../Icon';
import Loading, { LoadingColor } from '../Loading';
import Typography, { TypographyColor, TypographyWeight } from '../Typography';

import './ActionButton.scss';

type ActionButtonSize = 'small' | 'large';
export type ActionButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ActionButtonState = 'default' | 'disabled' | 'loading' | 'success';
export type ActionButtonLabels = {
  default: string;
  loading?: string;
  success?: string;
};

export interface ButtonProps {
  labels: ActionButtonLabels;
  onClick: () => void;
  variant?: ActionButtonVariant;
  state?: ActionButtonState;
  size?: ActionButtonSize;
  fullWidth?: boolean;
}

const ActionButton: FC<ButtonProps> = props => {
  const { labels, variant = 'primary', size = 'small', state = 'default', fullWidth = false, onClick } = props;

  // Compute CSS class names
  let borderClass = `tc__actionButton-border-${variant}-${size}`;
  let backgroundClass = `tc__actionButton-background-${variant}-${size}`;
  let hoverClass = `tc__actionButton-hover-${variant}-${size}`;
  const shadowClass = `tc__actionButton-shadow-${state}`;
  const cursorClass = `tc__actionButton-cursor-${state}`;
  const heightClass = `tc__actionButton-size-${size}`;
  const widthClass = fullWidth ? 'tc__actionButton-width-full' : '';
  switch (state) {
    case 'disabled':
      borderClass += '-disabled';
      backgroundClass += '-disabled';
      hoverClass += '-disabled';
      break;
    case 'loading':
      borderClass += '-loading';
      backgroundClass += '-loading';
      hoverClass += '-loading';
      break;
    case 'success':
      borderClass += '-success';
      backgroundClass += '-success';
      hoverClass += '-success';
      break;
    default:
  }

  // Text color
  let textColor: TypographyColor = 'text-primary';
  switch (variant) {
    case 'primary':
      textColor = 'text-primary-inverted';
      break;
    default:
  }
  switch (state) {
    case 'success':
      textColor = 'text-success';
      break;
    default:
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
  let textOpacity = 1;
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
    default:
  }

  // Loader color
  let loaderColor: LoadingColor = 'default';
  if ((variant === 'secondary' || variant === 'tertiary') && state === 'loading') {
    loaderColor = 'secondary';
  }

  return (
    <Button
      className={
        `tc__actionButton ${borderClass} ${backgroundClass} ${hoverClass}` +
        ` ${shadowClass} ${cursorClass} ${heightClass} ${widthClass}`
      }
      disabled={state !== 'default'}
      onClick={onClick}
    >
      {state === 'loading' && (
        <div className={`tc__actionButton-status-${size}-content`}>
          <Loading size={size === 'small' ? 12 : 20} color={loaderColor} />
        </div>
      )}
      {state === 'success' && (
        <div className={`tc__actionButton-status-${size}-content`}>
          <Icon variant="checkmark-solid" size={size === 'small' ? 12 : 20} />
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
    </Button>
  );
};

export default memo(ActionButton);
