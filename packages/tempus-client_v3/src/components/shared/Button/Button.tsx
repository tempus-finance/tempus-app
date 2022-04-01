import React, { FC, forwardRef, memo, HTMLProps } from 'react';
import './button.scss';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'small' | 'large';

interface ButtonProps {
  size: ButtonSize;
  variant: ButtonVariant;
  className?: string;
  title?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { size, variant, children, className = '', title, disabled = false, onClick } = props;

  const additionalClassNames = `${className} tc__btn__${size} tc__btn__${variant}`;

  return (
    <button ref={ref} className={`tc__btn ${additionalClassNames}`} title={title} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
});

export default memo(Button as FC<ButtonProps & HTMLProps<HTMLButtonElement>>);
