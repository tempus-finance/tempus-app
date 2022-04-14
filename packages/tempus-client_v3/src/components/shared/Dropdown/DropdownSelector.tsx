import { Children, cloneElement, FC, isValidElement, ReactElement } from 'react';
import Dropdown from './Dropdown';
import { DropdownSelectableItemProps } from './DropdownSelectableItem';

interface DropdownSelectorProps {
  label: string;
  popupTitle?: string;
  selectedValue?: any;
  onSelect?: (value: any) => void;
  children?: ReactElement<DropdownSelectableItemProps> | ReactElement<DropdownSelectableItemProps>[];
}

const DropdownSelector: FC<DropdownSelectorProps> = props => {
  const { label, popupTitle, selectedValue, onSelect, children } = props;

  return (
    <Dropdown label={label} popupTitle={popupTitle}>
      {Children.map(children, child =>
        isValidElement(child) ? cloneElement(child, { selectedValue, onClick: onSelect }) : null,
      )}
    </Dropdown>
  );
};

export default DropdownSelector;
