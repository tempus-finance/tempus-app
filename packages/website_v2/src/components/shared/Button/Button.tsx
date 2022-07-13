import { FC, memo, MouseEvent, PropsWithChildren, useCallback } from 'react';

import './Button.scss';

interface ButtonProps {
  className?: string;
  width?: string;
  height?: string;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

const Button: FC<ButtonProps> = props => {
  const { className, width, height, onClick, children } = props;

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
    },
    [onClick],
  );

  return (
    <div
      className={`tw__button__container ${className ?? ''}`}
      style={{ width, height }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
};

Button.defaultProps = {
  width: '',
  height: '',
  onClick: undefined,
};

export default memo<PropsWithChildren<ButtonProps>>(Button);
