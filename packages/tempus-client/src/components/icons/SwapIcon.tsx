import { FC } from 'react';
import IconProps from './IconProps';

const SwapIcon: FC<IconProps> = props => {
  return (
    <svg width="15" height="21" viewBox="0 0 15 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.5057 19.5L8.94886 19.5L8.94886 3.83523L6.39205 3.83523L10.2273 -1.67643e-07L14.0625 3.83523L11.5057 3.83523L11.5057 19.5Z"
        fill={props.fillColor || '#222222'}
      />
      <path
        d="M2.5568 1L5.11362 1L5.11362 16.6193L7.67044 16.6193L3.83521 20.4545L-1.40342e-05 16.6193L2.5568 16.6193L2.5568 1Z"
        fill={props.fillColor || '#222222'}
      />
    </svg>
  );
};
export default SwapIcon;
