import React, { FC } from 'react';
import { IconProps, ICON_SIZE_DEFAULT } from './index';
import withIcon from './withIcon';

const ExclamationBordered: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
      fill="#3E4E6E"
    />
    <path
      d="M7 5.00314V7.98597C7 8.54015 7.44767 8.9894 7.9999 8.9894C8.55221 8.9894 8.99991 8.54003 8.9998 7.98577L8.9992 5.00293C8.99909 4.45985 8.56833 4.01548 8.02737 4.0004C7.46465 3.9847 7 4.43821 7 5.00314Z"
      fill="#222222"
    />
    <path
      d="M8.9995 10.997C8.99978 10.4427 8.55209 9.99294 7.99975 9.99294C7.4476 9.99294 7 10.4424 7 10.9965C7 11.5506 7.4476 12 7.99975 12C8.5517 12 8.99922 11.5509 8.9995 10.997Z"
      fill="#222222"
    />
  </svg>
);

export default withIcon(ExclamationBordered);
