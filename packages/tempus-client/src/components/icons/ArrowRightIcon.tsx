import { FC } from 'react';
import IconProps from './IconProps';

const ArrowRight: FC<IconProps> = props => {
  return (
    <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.84573 -3.82277e-05L-7.94794e-07 1.81724L8.3109 10L0.000121518 18.1827L1.84585 20L12 10.0023L11.9976 9.99992L11.9999 9.99763L1.84573 -3.82277e-05Z"
        fill={props.fillColor || '#222222'}
      />
    </svg>
  );
};
export default ArrowRight;
