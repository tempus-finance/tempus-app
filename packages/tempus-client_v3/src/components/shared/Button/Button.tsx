import React, { FC, forwardRef, memo, HTMLProps } from 'react';

import './button.scss';

export interface ButtonProps {
  className?: string;
  title?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { children, className = '', title, disabled = false, onClick } = props;

  return (
    <button ref={ref} className={`tc__btn ${className}`} title={title} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
});

export default memo(Button as FC<ButtonProps & HTMLProps<HTMLButtonElement>>);
