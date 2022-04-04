import React, { FC, forwardRef, memo, HTMLProps } from 'react';

import './ButtonWrapper.scss';

export interface ButtonWrapperProps {
  className?: string;
  title?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const Button = forwardRef<HTMLButtonElement, ButtonWrapperProps>((props, ref) => {
  const { children, className = '', title, disabled = false, onClick } = props;

  return (
    <button ref={ref} className={`tc__btn ${className}`} title={title} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
});

export default memo(Button as FC<ButtonWrapperProps & HTMLProps<HTMLButtonElement>>);