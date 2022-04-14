import { FC } from 'react';
import Icon, { IconType } from '../Icon';

export interface DropdownSelectableItemIconProps {
  icon: IconType;
  // eslint-disable-next-line react/no-unused-prop-types
  value?: any;
}

const DropdownSelectableItemIcon: FC<DropdownSelectableItemIconProps> = props => {
  const { icon } = props;

  return (
    <span className="tc__dropdownItem__icon-container">
      <Icon type={icon} size={12} />
    </span>
  );
};

export default DropdownSelectableItemIcon;
