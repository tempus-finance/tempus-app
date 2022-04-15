import { Children, FC, isValidElement, ReactElement, useCallback, useState } from 'react';
import ButtonWrapper from '../ButtonWrapper';
import Typography from '../Typography';
import { DropdownSelectableItemIconProps } from './DropdownSelectableItemIcon';
import './DropdownItem.scss';

export interface DropdownSelectableItemProps {
  label: string;
  value?: string;
  selectedValue?: string;
  onClick?: (value: string) => void;
  children?: ReactElement<DropdownSelectableItemIconProps> | ReactElement<DropdownSelectableItemIconProps>[];
}

const DropdownSelectableItem: FC<DropdownSelectableItemProps> = props => {
  const { label, value, selectedValue, onClick, children } = props;
  const childrenValues = Children.map(children, child => (isValidElement(child) ? child.props.value : null))?.filter(
    val => val !== null,
  );
  const alreadySelectedIconIndex = childrenValues ? childrenValues.findIndex(val => val === selectedValue) : null;

  const [selectedIconIndex, setSelectedIconIndex] = useState(
    alreadySelectedIconIndex !== null && alreadySelectedIconIndex > -1 ? alreadySelectedIconIndex : 0,
  );

  const resolvedValue = childrenValues && selectedIconIndex !== null ? childrenValues[selectedIconIndex] : value;
  const selected = selectedValue === resolvedValue;

  const handleClick = useCallback(() => {
    let updatedSelectedIconIndex = selectedIconIndex;

    if (selected && selectedIconIndex !== null) {
      updatedSelectedIconIndex = (selectedIconIndex + 1) % Children.count(children);
      setSelectedIconIndex(updatedSelectedIconIndex);
    }

    const newValue =
      childrenValues && updatedSelectedIconIndex !== null && childrenValues[updatedSelectedIconIndex]
        ? childrenValues[updatedSelectedIconIndex]
        : value;
    onClick?.(newValue);
  }, [selectedIconIndex, selected, childrenValues, value, onClick, children]);

  return (
    <div className="tc__dropdownItem tc__dropdownItem__selectable">
      <ButtonWrapper onClick={handleClick}>
        <Typography variant="body-secondary" weight={selected ? 'bold' : 'regular'}>
          {label}
        </Typography>
      </ButtonWrapper>
      {Children.map(children, (child, index) => selectedIconIndex === index && child)}
    </div>
  );
};

export default DropdownSelectableItem;
