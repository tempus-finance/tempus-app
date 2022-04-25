import { FC } from 'react';

import './Tooltip.scss';

export interface TooltipProps {
  open: boolean;
}

const Tooltip: FC<TooltipProps> = props => {
  const { open, children } = props;

  if (!open) {
    return null;
  }

  return <div className="tc__tooltip">{children}</div>;
};
export default Tooltip;
