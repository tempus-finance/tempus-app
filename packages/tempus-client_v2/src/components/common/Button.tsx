import React from 'react';
import { ButtonHTMLAttributes } from 'react';

import './button.scss';

const Button = React.forwardRef((props: React.HTMLProps<HTMLButtonElement>) => {
  const { className = '', children, ...btnProps } = props;
  const attr = btnProps as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button className={`tc__btn ${className}`} {...attr}>
      {children}
    </button>
  );
});

export default Button;
