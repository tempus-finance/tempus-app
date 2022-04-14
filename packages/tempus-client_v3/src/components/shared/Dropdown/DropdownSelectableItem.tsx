import { Children, FC, isValidElement, ReactElement, useCallback, useState } from 'react';
import ButtonWrapper from '../ButtonWrapper';
import Typography from '../Typography';
import { DropdownSelectableItemIconProps } from './DropdownSelectableItemIcon';
import './DropdownItem.scss';

export interface DropdownSelectableItemProps {
  label: string;
  value?: any;
  selectedValue?: any;
  onClick?: (value: any) => void;
  children?: ReactElement<DropdownSelectableItemIconProps> | ReactElement<DropdownSelectableItemIconProps>[];
}

const DropdownSelectableItem: FC<DropdownSelectableItemProps> = props => {
  const { label, value, selectedValue, onClick, children } = props;
  const childrenValues = Children.map(children, child => (isValidElement(child) ? child.props.value : null))?.filter(
    val => val !== null,
  );
  const alreadySelectedIndex = childrenValues ? childrenValues.findIndex(val => val === selectedValue) : null;

  const [selectedIndex, setSelectedIndex] = useState<number>(
    alreadySelectedIndex !== null && alreadySelectedIndex > -1 ? alreadySelectedIndex : 0,
  );

  const resolvedValue = childrenValues && selectedIndex !== null ? childrenValues[selectedIndex] : value;
  const selected = selectedValue === resolvedValue;

  const handleClick = useCallback(() => {
    let updatedSelectedIndex = selectedIndex;

    if (selected && selectedIndex !== null) {
      updatedSelectedIndex = (selectedIndex + 1) % Children.count(children);
      setSelectedIndex(updatedSelectedIndex);
    }

    const newValue =
      childrenValues && updatedSelectedIndex !== null && childrenValues[updatedSelectedIndex]
        ? childrenValues[updatedSelectedIndex]
        : value;
    onClick?.(newValue);
  }, [selectedIndex, selected, childrenValues, value, onClick, children]);

  return (
    <div className="tc__dropdownItem tc__dropdownItem__selectable">
      <ButtonWrapper onClick={handleClick}>
        <Typography variant="body-secondary" weight={selected ? 'bold' : 'regular'}>
          {label}
        </Typography>
      </ButtonWrapper>
      {Children.map(children, (child, index) => selectedIndex === index && child)}
    </div>
  );
};

export default DropdownSelectableItem;
