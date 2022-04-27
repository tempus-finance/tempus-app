import { FC } from 'react';

import './Tooltip.scss';

export type TooltipPlacement = 'bottom-left' | 'bottom-right';

export interface TooltipProps {
  open: boolean;
  placement?: TooltipPlacement;
}

const Tooltip: FC<TooltipProps> = props => {
  const { open, placement = 'bottom-right', children } = props;

  if (!open) {
    return null;
  }

  return <div className={`tc__tooltip tc__tooltip__${placement}`}>{children}</div>;
};
export default Tooltip;
