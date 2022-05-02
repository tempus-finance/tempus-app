import { FC, forwardRef, HTMLProps } from 'react';

import './Tooltip.scss';

export type TooltipPlacement = 'bottom-left' | 'bottom-right';

export interface TooltipProps {
  open: boolean;
  placement?: TooltipPlacement;
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>((props, ref) => {
  const { open, placement = 'bottom-right', children } = props;

  if (!open) {
    return null;
  }

  return (
    <div className={`tc__tooltip tc__tooltip__${placement}`} ref={ref}>
      {children}
    </div>
  );
});

export default Tooltip as FC<TooltipProps & HTMLProps<HTMLDivElement>>;
