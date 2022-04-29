import { FC, forwardRef, memo, HTMLProps } from 'react';

import './ButtonWrapper.scss';

export interface ButtonWrapperProps {
  className?: string;
  title?: string;
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const Button = forwardRef<HTMLButtonElement, ButtonWrapperProps>((props, ref) => {
  const {
    children,
    className = '',
    title,
    disabled = false,
    selected = false,
    onClick,
    onMouseOver,
    onMouseOut,
    onFocus,
    onBlur,
  } = props;

  return (
    <button
      ref={ref}
      className={`tc__btn ${className}`}
      title={title}
      disabled={disabled}
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onFocus={onFocus}
      onBlur={onBlur}
      data-selected={selected}
      type="button"
    >
      {children}
    </button>
  );
});

export default memo(Button as FC<ButtonWrapperProps & HTMLProps<HTMLButtonElement>>);
