import { FC } from 'react';
import { InnerIconProps } from './IconProps';
import withIcon from './withIcon';

const Info: FC<InnerIconProps> = ({ size, color }) => (
  <svg
    className="tc__icon tc__icon-info"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.9996 13.9937L9.9996 8.02806C9.9996 6.9197 9.10426 6.02119 7.9998 6.02119C6.89518 6.02119 5.99978 6.91994 6 8.02846L6.0012 13.9941C6.00142 15.0803 6.86294 15.969 7.94486 15.9992C9.07031 16.0306 9.9996 15.1236 9.9996 13.9937Z"
      fill={color}
    />
    <path
      d="M6.0006 2.00606C6.00004 3.11465 6.89541 4.01413 8.0001 4.01413C9.10439 4.01413 9.9996 3.11526 9.9996 2.00706C9.9996 0.898871 9.10439 -9.65404e-08 8.0001 0C6.89619 9.65063e-08 6.00115 0.89826 6.0006 2.00606Z"
      fill={color}
    />
  </svg>
);

export default withIcon(Info);
