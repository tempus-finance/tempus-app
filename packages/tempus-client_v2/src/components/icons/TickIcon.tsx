import { FC, memo } from 'react';
import IconProps from './IconProps';

const TickIcon: FC<IconProps> = props => {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 6.1003L6 12L16 2L14 0L6 8L2 4L0 6.1003Z" fill={props.fillColor || '#4BB543'} />
    </svg>
  );
};
export default memo(TickIcon);
