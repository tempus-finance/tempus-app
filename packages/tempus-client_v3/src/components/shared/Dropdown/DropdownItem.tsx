import { ChangeEvent, FC, useCallback, useState } from 'react';
import Checkbox from '../Checkbox';
import Icon, { IconVariant } from '../Icon';
import Typography from '../Typography';

import './DropdownItem.scss';

export interface DropdownItemProps {
  label: string;
  onChange: (checked: boolean, label: string) => void;
  checkbox?: boolean;
  icon?: IconVariant;
}

const DropdownItem: FC<DropdownItemProps> = props => {
  const { label, checkbox = false, icon, onChange } = props;

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
      {icon && <Icon variant={icon} size={12} />}
    </div>
  );
};
export default DropdownItem;
