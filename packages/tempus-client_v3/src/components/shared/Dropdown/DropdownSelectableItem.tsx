import { ReactElement, useCallback } from 'react';
import ButtonWrapper from '../ButtonWrapper';
import Typography from '../Typography';
import './DropdownItem.scss';
import Icon, { IconVariant } from '../Icon';

export interface DropdownSelectableItemProps<T> {
  label: string;
  value: T;
  selected?: boolean;
  iconType?: IconVariant;
  onClick?: (value: T) => void;
}

function DropdownSelectableItem<T>(
  props: DropdownSelectableItemProps<T>,
): ReactElement<DropdownSelectableItemProps<T>> {
  const { label, value, selected, iconType, onClick } = props;
  const handleClick = useCallback(() => onClick?.(value), [onClick, value]);

  return (
    <div className="tc__dropdownItem tc__dropdownItem__selectable">
      <ButtonWrapper onClick={handleClick}>
        <Typography variant="body-secondary" weight={selected ? 'bold' : 'regular'}>
          {label}
        </Typography>
      </ButtonWrapper>
      {iconType && (
        <span className="tc__dropdownItem__icon-container">
          <Icon variant={iconType} size="tiny" />
        </span>
      )}
    </div>
  );
}

export default DropdownSelectableItem;
