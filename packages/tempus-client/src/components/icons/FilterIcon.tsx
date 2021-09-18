import { FC } from 'react';
import IconProps from './IconProps';

const FilterIcon: FC<IconProps> = props => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.77799 20L12.2226 16.6667V11.3333L20 0H9.99361H0L7.77799 11.3333V20Z"
        fill={props.fillColor || '#222222'}
      />
    </svg>
  );
};
export default FilterIcon;
