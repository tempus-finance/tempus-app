import { ChangeEvent, ReactElement, useCallback, useState } from 'react';
import Checkbox from '../Checkbox';
import Icon, { IconVariant } from '../Icon';

import './DropdownItem.scss';

export interface DropdownCheckboxItemProps<T> {
  label: string;
  value?: T;
  onChange: (checked: boolean, label: T) => void;
  icon?: IconVariant;
}

function DropdownCheckboxItem<T>(
  props: DropdownCheckboxItemProps<T | string>,
): ReactElement<DropdownCheckboxItemProps<T | string>> {
  const { label, value, icon, onChange } = props;

  const [checked, setChecked] = useState<boolean>(false);

  const onCheckboxToggle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setChecked(event.target.checked);

      onChange(event.target.checked, value ?? label);
    },
    [label, onChange, value],
  );

  return (
    <div className="tc__dropdownItem">
      <Checkbox checked={checked} label={label} onChange={onCheckboxToggle} />
      {icon && <Icon variant={icon} size="tiny" />}
    </div>
  );
}
export default DropdownCheckboxItem;
