import { FC, memo, MouseEvent, useCallback, useState } from 'react';
import ButtonWrapper from '../ButtonWrapper';
import Icon from '../Icon';
import Typography from '../Typography';

import './Dropdown.scss';

export interface DropdownProps {
  label: string;
  popupTitle?: string;
}

const Dropdown: FC<DropdownProps> = props => {
  const { label, popupTitle = '', children } = props;

  const [open, setOpen] = useState<boolean>(false);

  const onClick = useCallback(() => {
    setOpen(prevState => !prevState);
  }, []);

  const onPopupClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    // We don't want to close popup when user clicks on the popup itself
    event.stopPropagation();
  }, []);

  return (
    <ButtonWrapper className="tc__dropdown" onClick={onClick} selected={open}>
      <Typography variant="body-secondary">{label}</Typography>
      <Icon type={open ? 'up-chevron' : 'down-chevron'} size={12} />

      {/* Popup container */}
      {open && (
        <div className="tc__dropdown__popup" onClick={onPopupClick}>
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
      )}
    </ButtonWrapper>
  );
};
export default memo(Dropdown);
