import React, { memo } from 'react';
import { ButtonHTMLAttributes } from 'react';

import './button.scss';

const Button = React.forwardRef(
  (props: React.HTMLProps<HTMLButtonElement>, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const { className = '', children, ...btnProps } = props;
    const attr = btnProps as ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <button className={`tc__btn ${className}`} {...attr} style={{ ...props.style }} ref={ref}>
        {children}
      </button>
    );
  },
);

export default memo(Button);
