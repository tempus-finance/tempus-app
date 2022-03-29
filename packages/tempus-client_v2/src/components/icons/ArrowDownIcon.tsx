import { FC, memo } from 'react';
import IconProps from './IconProps';

const ArrowDown: FC<IconProps> = props => {
  return (
    <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 1.84573L18.1828 0L9.99996 8.3109L1.81728 0.000121598L0 1.84585L9.99767 12L10.0001 11.9976L10.0024 11.9999L20 1.84573Z"
        fill={props.fillColor || '#222222'}
      />
    </svg>
  );
};
export default memo(ArrowDown);
