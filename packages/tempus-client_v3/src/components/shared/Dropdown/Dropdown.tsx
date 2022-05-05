import { FC, memo, useCallback, useMemo, useState } from 'react';
import Icon from '../Icon';
import TooltipWrapper from '../TooltipWrapper';
import Typography from '../Typography';

import './Dropdown.scss';

export interface DropdownProps {
  label: string;
  popupTitle?: string;
}

const Dropdown: FC<DropdownProps> = props => {
  const { label, popupTitle = '', children } = props;

  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const popup = useMemo(
    () => (
      <div className="tc__dropdown__popup">
        {popupTitle && (
          <div className="tc__dropdown-popup-title">
            <Typography variant="body-tertiary" weight="bold">
              {popupTitle}
            </Typography>
          </div>
        )}
        {/* Dropdown list items */}
        {children}
      </div>
    ),
    [popupTitle, children],
  );

  return (
    <div className="tc__dropdown">
      <TooltipWrapper tooltipContent={popup} onOpen={handleOpen} onClose={handleClose}>
        <Typography variant="body-secondary">{label}</Typography>
        <Icon variant={open ? 'up-chevron' : 'down-chevron'} size="tiny" />
      </TooltipWrapper>
    </div>
  );
};
export default memo(Dropdown) as FC<DropdownProps>;
