import React, { FC } from 'react';
import { IconProps, ICON_SIZE_DEFAULT } from './Icon';
import withIcon from './withIcon';

const IconBordered: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg
    className="tc__icon tc__icon-info-bordered"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
      fill="#3E4E6E"
    />
    <path
      d="M8.9998 10.9969L8.9998 8.01403C8.9998 7.45985 8.55213 7.0106 7.9999 7.0106C7.44759 7.0106 6.99989 7.45997 7 8.01423L7.0006 10.9971C7.00071 11.5401 7.43147 11.9845 7.97243 11.9996C8.53515 12.0153 8.9998 11.5618 8.9998 10.9969Z"
      fill="#222222"
    />
    <path
      d="M7.0003 5.00303C7.00002 5.55732 7.44771 6.00706 8.00005 6.00706C8.55219 6.00706 8.9998 5.55763 8.9998 5.00353C8.9998 4.44944 8.55219 4 8.00005 4C7.4481 4 7.00057 4.44913 7.0003 5.00303Z"
      fill="#222222"
    />
  </svg>
);

export default withIcon(IconBordered);
