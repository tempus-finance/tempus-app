import { FC, memo } from 'react';

interface SelectIconProps {
  selected: boolean;
}

const SelectIcon: FC<SelectIconProps> = ({ selected }) => {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10.5" cy="10.5" r="10.5" fill="#3B789F" />
      <circle cx="10.5" cy="10.5" r="8.5" fill="white" />
      <circle cx="10.5" cy="10.5" r="5.5" fill={selected ? '#3B789F' : 'white'} />
    </svg>
  );
};
export default memo(SelectIcon);
