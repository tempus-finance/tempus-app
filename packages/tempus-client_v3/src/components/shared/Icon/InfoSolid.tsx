import React, { FC } from 'react';
import { IconProps, ICON_SIZE_DEFAULT } from './Icon';
import withIcon from './withIcon';

const InfoSolid: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="8" fill="#222222" />
    <path
      d="M8.9998 10.9969L8.9998 8.01403C8.9998 7.45985 8.55213 7.0106 7.9999 7.0106C7.44759 7.0106 6.99989 7.45997 7 8.01423L7.0006 10.9971C7.00071 11.5401 7.43147 11.9845 7.97243 11.9996C8.53515 12.0153 8.9998 11.5618 8.9998 10.9969Z"
      fill="white"
    />
    <path
      d="M7.0003 5.00303C7.00002 5.55732 7.44771 6.00706 8.00005 6.00706C8.55219 6.00706 8.9998 5.55763 8.9998 5.00353C8.9998 4.44944 8.55219 4 8.00005 4C7.4481 4 7.00057 4.44913 7.0003 5.00303Z"
      fill="white"
    />
  </svg>
);

export default withIcon(InfoSolid);
