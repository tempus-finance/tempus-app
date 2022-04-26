import { ChangeEvent, FC, useCallback, useState } from 'react';
import Checkbox from '../Checkbox';
import Icon, { IconVariant } from '../Icon';

import './DropdownItem.scss';

export interface DropdownCheckboxItemProps {
  label: string;
  onChange: (checked: boolean, label: string) => void;
  icon?: IconVariant;
}

const DropdownCheckboxItem: FC<DropdownCheckboxItemProps> = props => {
  const { label, icon, onChange } = props;

  const [checked, setChecked] = useState<boolean>(false);

  const onCheckboxToggle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setChecked(event.target.checked);

      onChange(event.target.checked, label);
    },
    [label, onChange],
  );

  return (
    <div className="tc__dropdownItem">
      <Checkbox checked={checked} label={label} onChange={onCheckboxToggle} />
      {icon && <Icon variant={icon} size="tiny" />}
    </div>
  );
};
export default DropdownCheckboxItem;
