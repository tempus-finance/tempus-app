import { ReactElement, useCallback } from 'react';
import { Radio } from '../Radio';
import Icon, { IconVariant } from '../Icon';

import './DropdownItem.scss';

export interface DropdownRadioItemProps<T> {
  label: string;
  value: T;
  checked?: boolean;
  onChange: (label: T) => void;
  icon?: IconVariant;
}

function DropdownRadioItem<T>(
  props: DropdownRadioItemProps<T | string>,
): ReactElement<DropdownRadioItemProps<T | string>> {
  const { label, value, checked = false, icon, onChange } = props;

  const onRadioToggle = useCallback(() => {
    onChange(value);
  }, [onChange, value]);

  return (
    <div className="tc__dropdownItem">
      <Radio checked={checked} label={label} onChange={onRadioToggle} />
      {icon && <Icon variant={icon} size="tiny" />}
    </div>
  );
}
export default DropdownRadioItem;
