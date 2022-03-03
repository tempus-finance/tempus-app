import { ButtonHTMLAttributes } from 'react';

import './button.scss';

const Button = (props: React.HTMLProps<HTMLButtonElement>) => {
  const { children, ...btnProps } = props;
  const attr = btnProps as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button className="tc__btn" {...attr}>
      {children}
    </button>
  );
};

export default Button;
