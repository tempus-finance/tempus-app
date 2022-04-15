import { Children, cloneElement, isValidElement, ReactElement } from 'react';
import { IconType } from '../Icon';
import Dropdown from './Dropdown';
import { DropdownSelectableItemProps } from './DropdownSelectableItem';

interface DropdownSelectorProps<T> {
  label: string;
  popupTitle?: string;
  itemIcon?: IconType;
  selectedValue?: T;
  onSelect?: (value: T) => void;
  children?: ReactElement<DropdownSelectableItemProps<T>> | ReactElement<DropdownSelectableItemProps<T>>[];
}

function DropdownSelector<T>(props: DropdownSelectorProps<T>): ReactElement<DropdownSelectorProps<T>> {
  const { label, popupTitle, itemIcon, selectedValue, onSelect, children } = props;

  return (
    <Dropdown label={label} popupTitle={popupTitle}>
      {Children.map(children, child =>
        isValidElement(child)
          ? cloneElement(child, {
              selected: selectedValue === child.props.value,
              iconType: selectedValue === child.props.value ? itemIcon : undefined,
              onClick: onSelect,
            })
          : null,
      )}
    </Dropdown>
  );
}

export default DropdownSelector;
