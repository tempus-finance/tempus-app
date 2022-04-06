import { ChangeEvent, FC, useCallback, useState } from 'react';
import Checkbox from '../Checkbox';
import Icon, { IconType } from '../Icon';
import Typography from '../Typography';

import './DropdownItem.scss';

interface DropdownItemProps {
  label: string;
  onChange: (checked: boolean, label: string) => void;
  checkbox?: boolean;
  rightSideIcon?: IconType;
}

const DropdownItem: FC<DropdownItemProps> = props => {
  const { label, checkbox = false, rightSideIcon, onChange } = props;

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
      {checkbox && <Checkbox checked={checked} label={label} onChange={onCheckboxToggle} />}
      {!checkbox && (
        <Typography variant="body-secondary" weight={checked ? 'bold' : 'regular'}>
          {label}
        </Typography>
      )}
      {rightSideIcon && <Icon type={rightSideIcon} size={12} />}
    </div>
  );
};
export default DropdownItem;
