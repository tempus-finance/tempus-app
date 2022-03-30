import React, { ForwardedRef, forwardRef, memo, ReactNode } from 'react';

import './button.scss';

export interface ButtonProps {
  children: ReactNode;
  className?: string;
  title?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const Button = forwardRef((props: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
  const { children, className = '', title, disabled = false, onClick } = props;

  return (
    <button ref={ref} className={`tc__btn ${className}`} title={title} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
});

export default memo(Button);
