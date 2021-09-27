import { FC } from 'react';
import IconProps from './IconProps';

const MenuIcon: FC<IconProps> = props => {
  return (
    <svg width="18" height="4" viewBox="0 0 18 4" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="2" cy="2" r="2" fill={props.fillColor || '#222222'} />
      <circle cx="9" cy="2" r="2" fill={props.fillColor || '#222222'} />
      <circle cx="16" cy="2" r="2" fill={props.fillColor || '#222222'} />
    </svg>
  );
};
export default MenuIcon;
